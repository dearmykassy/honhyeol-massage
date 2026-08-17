import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const FEELING = "/Users/ssm/Documents/Codex/feeling-hometai";
const GEONMAE = "/Users/ssm/Documents/Codex/geonmae-banhada";
const CAMPAIGN = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function copyImmutable(source, destination) {
  const sourceBytes = await readFile(source);
  const target = path.join(ROOT, destination);
  await mkdir(path.dirname(target), { recursive: true });
  try {
    const existing = await readFile(target);
    if (!existing.equals(sourceBytes)) throw new Error(`REUSED_DESTINATION_DRIFT:${destination}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await copyFile(source, target);
  }
  const copiedBytes = await readFile(target);
  if (!copiedBytes.equals(sourceBytes)) throw new Error(`REUSED_COPY_MISMATCH:${destination}`);
  return { sourceBytes, sha256: sha256(sourceBytes) };
}

const regional = [];
for (let newIndex = 1; newIndex <= 65; newIndex += 1) {
  const fromFeeling = newIndex % 2 === 1;
  const sourceIndex = fromFeeling
    ? 1 + Math.floor((newIndex - 1) / 2) * 4
    : 3 + Math.floor((newIndex - 2) / 2) * 4;
  const sourceId = `${sourceIndex}`.padStart(3, "0");
  const destinationId = `${newIndex}`.padStart(3, "0");
  const sourceLane = "abcdefghij"[Math.floor((sourceIndex - 1) / 13)];
  const destinationLane = "abcdefghij"[Math.floor((newIndex - 1) / 13)];
  const sourceRoot = fromFeeling ? FEELING : GEONMAE;
  const sourcePlatform = fromFeeling ? "feeling-hometai" : "geonmae-banhada";
  const sourcePrefix = fromFeeling ? "rng-t3" : "gmb-t4";
  const sourceRelative = fromFeeling
    ? `public/images/rang-template3/regional-originals/lane-${sourceLane}/${sourcePrefix}-rgn-${sourceId}-v1.png`
    : `public/images/geonma-template4/regional-originals/lane-${sourceLane}/${sourcePrefix}-rgn-${sourceId}-v1.png`;
  const destinationRelative = `public/images/honhyeol-template4/regional-originals/lane-${destinationLane}/hym-t4-rgn-${destinationId}-v1.png`;
  const copied = await copyImmutable(path.join(sourceRoot, sourceRelative), destinationRelative);
  const metadata = await sharp(copied.sourceBytes).metadata();
  regional.push({
    assetId: `hym-t4-rgn-${destinationId}-v1`,
    sourcePlatform,
    sourceRelative,
    sourceAbsoluteRoot: sourceRoot,
    sourceAssetId: `${sourcePrefix}-rgn-${sourceId}-v1`,
    sourceSha256: copied.sha256,
    destinationRelative,
    destinationSha256: copied.sha256,
    dimensions: { width: metadata.width, height: metadata.height, format: metadata.format },
    sourceMutationCheck: { sourceMtimeMs: (await stat(path.join(sourceRoot, sourceRelative))).mtimeMs },
  });
}

const editorialPlan = [
  ["home.hero", FEELING, "feeling-hometai", "public/images/feeling-template3/home/feeling-t3-home-mirror-v1.png", "hym-t4-home-hero-v1"],
  ["home.feature-01", GEONMAE, "geonmae-banhada", "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/generated-originals/nonregional/gmb-t4-feature-01-v1.png", "hym-t4-feature-01-v1"],
  ["home.feature-03", GEONMAE, "geonmae-banhada", "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/generated-originals/nonregional/gmb-t4-feature-03-v1.png", "hym-t4-feature-03-v1"],
  ["home.feature-05", GEONMAE, "geonmae-banhada", "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/generated-originals/nonregional/gmb-t4-feature-05-v1.png", "hym-t4-feature-05-v1"],
  ["home.category-01", GEONMAE, "geonmae-banhada", "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/generated-originals/nonregional/gmb-t4-category-01-v1.png", "hym-t4-category-01-v1"],
  ["home.category-03", GEONMAE, "geonmae-banhada", "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/generated-originals/nonregional/gmb-t4-category-03-v1.png", "hym-t4-category-03-v1"],
  ["home.category-05", GEONMAE, "geonmae-banhada", "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/generated-originals/nonregional/gmb-t4-category-05-v1.png", "hym-t4-category-05-v1"],
  ["blog.note-01", FEELING, "feeling-hometai", "public/images/rang-template3/regional-originals/lane-a/rng-t3-rgn-002-v1.png", "hym-t4-blog-note-01-v1"],
  ["blog.note-02", FEELING, "feeling-hometai", "public/images/rang-template3/regional-originals/lane-a/rng-t3-rgn-003-v1.png", "hym-t4-blog-note-02-v1"],
];

const editorial = [];
for (const [slot, sourceRoot, sourcePlatform, sourceRelative, assetId] of editorialPlan) {
  const destinationRelative = `${CAMPAIGN}/reused-originals/editorial/${assetId}.png`;
  const copied = await copyImmutable(path.join(sourceRoot, sourceRelative), destinationRelative);
  const metadata = await sharp(copied.sourceBytes).metadata();
  editorial.push({
    slot,
    assetId,
    sourcePlatform,
    sourceRelative,
    sourceAbsoluteRoot: sourceRoot,
    sourceSha256: copied.sha256,
    destinationRelative,
    destinationSha256: copied.sha256,
    dimensions: { width: metadata.width, height: metadata.height, format: metadata.format },
    sourceMutationCheck: { sourceMtimeMs: (await stat(path.join(sourceRoot, sourceRelative))).mtimeMs },
  });
}

const sourceDistribution = [...regional, ...editorial].reduce((counts, entry) => {
  counts[entry.sourcePlatform] = (counts[entry.sourcePlatform] ?? 0) + 1;
  return counts;
}, {});
if (regional.length !== 65 || editorial.length !== 9 || sourceDistribution["feeling-hometai"] !== 36 || sourceDistribution["geonmae-banhada"] !== 38) {
  throw new Error("REUSE_DISTRIBUTION_MISMATCH");
}

const document = {
  schemaVersion: "honhyeol-template4-reuse-provenance/v2",
  status: "IMMUTABLE_COPIES_VERIFIED",
  platform: "honhyeol-massage",
  counts: { total: 74, regional: 65, editorial: 9 },
  sourceDistribution,
  sourceMutationPolicy: "Sources were read and copied only; source paths were not modified.",
  regional,
  editorial,
};
const output = path.join(ROOT, `${CAMPAIGN}/reuse-provenance.v2.json`);
await mkdir(path.dirname(output), { recursive: true });
const bytes = Buffer.from(`${JSON.stringify(document, null, 2)}\n`);
try {
  await writeFile(output, bytes, { flag: "wx" });
} catch (error) {
  if (error?.code !== "EEXIST") throw error;
  const existing = await readFile(output);
  if (!existing.equals(bytes)) throw new Error("REUSE_PROVENANCE_DRIFT");
}

console.log(JSON.stringify({ counts: document.counts, sourceDistribution, output: path.relative(ROOT, output) }, null, 2));
