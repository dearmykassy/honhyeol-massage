import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1";
const REUSE_PROVENANCE = `${CAMPAIGN}/reuse-provenance.v2.json`;
const CAMPAIGN_OUTPUT = `${CAMPAIGN}/campaign.v1.json`;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function readJson(relativePath) {
  const bytes = await readFile(path.join(ROOT, relativePath));
  return { bytes, sha256: sha256(bytes), value: JSON.parse(bytes.toString("utf8")) };
}

async function writeNewOrExact(relativePath, bytes) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await writeFile(absolutePath, bytes, { flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existing = await readFile(absolutePath);
    if (!existing.equals(bytes)) throw new Error(`CAMPAIGN_DRIFT:${relativePath}`);
  }
}

const reuseDocument = await readJson(REUSE_PROVENANCE);
if (
  reuseDocument.value.schemaVersion !== "honhyeol-template4-reuse-provenance/v2" ||
  reuseDocument.value.counts?.total !== 74 ||
  reuseDocument.value.counts?.regional !== 65 ||
  reuseDocument.value.counts?.editorial !== 9
) throw new Error("REUSE_PROVENANCE_INVALID");

const reuseRegional = new Map(reuseDocument.value.regional.map((entry) => [entry.assetId, entry]));
const reuseEditorial = new Map(reuseDocument.value.editorial.map((entry) => [entry.assetId, entry]));
const jobs = [];

for (let index = 1; index <= 130; index += 1) {
  const id = String(index).padStart(3, "0");
  const assetId = `hym-t4-rgn-${id}-v1`;
  const lane = "abcdefghij"[Math.floor((index - 1) / 13)];
  const sourceRelative = `public/images/honhyeol-template4/regional-originals/lane-${lane}/${assetId}.png`;
  const sourceBytes = await readFile(path.join(ROOT, sourceRelative));
  const metadata = await sharp(sourceBytes).metadata();
  if (!metadata.width || !metadata.height || metadata.format !== "png") throw new Error(`REGIONAL_SOURCE_INVALID:${assetId}`);
  if (index <= 65) {
    const reuse = reuseRegional.get(assetId);
    if (!reuse || reuse.destinationRelative !== sourceRelative || reuse.destinationSha256 !== sha256(sourceBytes)) {
      throw new Error(`REGIONAL_REUSE_CHAIN_INVALID:${assetId}`);
    }
    jobs.push({ assetId, jobClass: "regional", sourceClass: "reused", lane, sourceRelative, sourceSha256: sha256(sourceBytes), width: metadata.width, height: metadata.height, provenance: { relativePath: REUSE_PROVENANCE, sha256: reuseDocument.sha256, sourcePlatform: reuse.sourcePlatform, sourceRelative: reuse.sourceRelative, sourceAssetId: reuse.sourceAssetId, sourceSha256: reuse.sourceSha256 }, styling: "source-approved-mirror-selfie" });
  } else {
    const receiptRelative = `${CAMPAIGN}/receipts/generated/${assetId}.json`;
    const receipt = await readJson(receiptRelative);
    if (receipt.value.status !== "GENERATED_AND_COPIED" || receipt.value.projectRelative !== sourceRelative || receipt.value.projectSha256 !== sha256(sourceBytes)) {
      throw new Error(`REGIONAL_GENERATION_CHAIN_INVALID:${assetId}`);
    }
    jobs.push({ assetId, jobClass: "regional", sourceClass: "new", lane, sourceRelative, sourceSha256: sha256(sourceBytes), width: metadata.width, height: metadata.height, provenance: { relativePath: receiptRelative, sha256: receipt.sha256, prompt: receipt.value.prompt }, styling: index <= 83 ? "tasteful-fitted-fashion" : "restrained-everyday-fashion" });
  }
}

const editorialPlan = [
  ["hym-t4-home-hero-v1", "home.hero", "public/images/honhyeol-template4/home/hero-mirror.webp"],
  ["hym-t4-feature-01-v1", "home.feature-01", "public/images/honhyeol-template4/home/feature-01.webp"],
  ["hym-t4-feature-02-v1", "home.feature-02", "public/images/honhyeol-template4/home/feature-02.webp"],
  ["hym-t4-feature-03-v1", "home.feature-03", "public/images/honhyeol-template4/home/feature-03.webp"],
  ["hym-t4-feature-04-v1", "home.feature-04", "public/images/honhyeol-template4/home/feature-04.webp"],
  ["hym-t4-feature-05-v1", "home.feature-05", "public/images/honhyeol-template4/home/feature-05.webp"],
  ["hym-t4-feature-06-v1", "home.feature-06", "public/images/honhyeol-template4/home/feature-06.webp"],
  ["hym-t4-feature-07-v1", "home.feature-07", "public/images/honhyeol-template4/home/feature-07.webp"],
  ["hym-t4-feature-08-v1", "home.feature-08", "public/images/honhyeol-template4/home/feature-08.webp"],
  ["hym-t4-category-01-v1", "home.category-01", "public/images/honhyeol-template4/home/category-01.webp"],
  ["hym-t4-category-02-v1", "home.category-02", "public/images/honhyeol-template4/home/category-02.webp"],
  ["hym-t4-category-03-v1", "home.category-03", "public/images/honhyeol-template4/home/category-03.webp"],
  ["hym-t4-category-04-v1", "home.category-04", "public/images/honhyeol-template4/home/category-04.webp"],
  ["hym-t4-category-05-v1", "home.category-05", "public/images/honhyeol-template4/home/category-05.webp"],
  ["hym-t4-home-contact-v1", "home.contact", "public/images/honhyeol-template4/home/contact.webp"],
  ["hym-t4-home-region-search-v1", "home.region-search", "public/images/honhyeol-template4/home/region-search.webp"],
  ["hym-t4-blog-note-01-v1", "blog.note-01", "public/images/honhyeol-template4/blog/note-01.webp"],
  ["hym-t4-blog-note-02-v1", "blog.note-02", "public/images/honhyeol-template4/blog/note-02.webp"],
];

for (const [assetId, slot, activeOutput] of editorialPlan) {
  const reused = reuseEditorial.get(assetId);
  const sourceRelative = reused
    ? reused.destinationRelative
    : `${CAMPAIGN}/generated-originals/editorial/${assetId}.png`;
  const sourceBytes = await readFile(path.join(ROOT, sourceRelative));
  const metadata = await sharp(sourceBytes).metadata();
  if (!metadata.width || !metadata.height || metadata.format !== "png") throw new Error(`EDITORIAL_SOURCE_INVALID:${assetId}`);
  if (reused) {
    if (reused.destinationSha256 !== sha256(sourceBytes)) throw new Error(`EDITORIAL_REUSE_CHAIN_INVALID:${assetId}`);
    jobs.push({ assetId, jobClass: "editorial", sourceClass: "reused", slot, sourceRelative, sourceSha256: sha256(sourceBytes), width: metadata.width, height: metadata.height, activeOutput, provenance: { relativePath: REUSE_PROVENANCE, sha256: reuseDocument.sha256, sourcePlatform: reused.sourcePlatform, sourceRelative: reused.sourceRelative, sourceSha256: reused.sourceSha256 }, styling: "source-approved-mirror-selfie" });
  } else {
    const receiptRelative = `${CAMPAIGN}/receipts/generated/${assetId}.json`;
    const receipt = await readJson(receiptRelative);
    if (receipt.value.status !== "GENERATED_AND_COPIED" || receipt.value.projectRelative !== sourceRelative || receipt.value.projectSha256 !== sha256(sourceBytes)) {
      throw new Error(`EDITORIAL_GENERATION_CHAIN_INVALID:${assetId}`);
    }
    jobs.push({ assetId, jobClass: "editorial", sourceClass: "new", slot, sourceRelative, sourceSha256: sha256(sourceBytes), width: metadata.width, height: metadata.height, activeOutput, provenance: { relativePath: receiptRelative, sha256: receipt.sha256, prompt: receipt.value.prompt }, styling: "restrained-everyday-fashion" });
  }
}

const counts = {
  totalPhotographs: jobs.length,
  regional: jobs.filter((job) => job.jobClass === "regional").length,
  editorial: jobs.filter((job) => job.jobClass === "editorial").length,
  reused: jobs.filter((job) => job.sourceClass === "reused").length,
  new: jobs.filter((job) => job.sourceClass === "new").length,
  newMildlySexy: jobs.filter((job) => job.sourceClass === "new" && job.styling === "tasteful-fitted-fashion").length,
};
if (counts.totalPhotographs !== 148 || counts.regional !== 130 || counts.editorial !== 18 || counts.reused !== 74 || counts.new !== 74 || counts.newMildlySexy !== 18) {
  throw new Error(`CAMPAIGN_COUNTS_INVALID:${JSON.stringify(counts)}`);
}

const campaign = {
  schemaVersion: "honhyeol-template4-mirror-selfie-campaign/v1",
  campaign: "honhyeol-template4-mirror-selfie-v1",
  status: "READY_FOR_ROOT_VISUAL_REVIEW",
  platform: { name: "혼혈마사지", id: "honhyeol-massage", template: "Template4" },
  counts,
  reuseProvenance: { relativePath: REUSE_PROVENANCE, sha256: reuseDocument.sha256, sourceDistribution: reuseDocument.value.sourceDistribution },
  visualContract: { subject: "one clearly adult woman, without ethnicity targeting", mirror: "clean physical mirror and coherent reflection clearly visible", phone: "offset where feasible so adult facial features remain visible", crop: "desktop/tablet/mobile crop-safe", safety: "fully clothed and non-explicit; no lingerie, cleavage-focused or fetish framing, text, logo, watermark, bed, bathroom, copied identity, duplicate reflection, or malformed anatomy" },
  distributionContract: { regionalRoutes: 1291, regionalAssets: 130, maxReuse: 10, exactReuseDistribution: { "9": 9, "10": 121 }, parentChildCollisions: 0, siblingCollisions: 0 },
  jobs,
};
await writeNewOrExact(CAMPAIGN_OUTPUT, Buffer.from(`${JSON.stringify(campaign, null, 2)}\n`));
console.log(JSON.stringify({ counts, output: CAMPAIGN_OUTPUT }, null, 2));
