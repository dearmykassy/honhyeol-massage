import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN_ROOT =
  "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1";
const CAMPAIGN_RELATIVE = `${CAMPAIGN_ROOT}/campaign.v1.json`;
const REVIEW_ROOT = `${CAMPAIGN_ROOT}/contact-sheets/round-01`;
const INVENTORY_RELATIVE = `${REVIEW_ROOT}/inventory.v1.json`;
const TILE_WIDTH = 800;
const TILE_HEIGHT = 480;
const SHEET_COLUMNS = 2;
const SHEET_ROWS = 5;

const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

function fail(code) {
  throw new Error(`HONHYEOL_T4_CONTACT_SHEETS_${code}`);
}

async function writeNewOrExact(relativePath, bytes) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await writeFile(absolutePath, bytes, { flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existing = await readFile(absolutePath);
    if (!existing.equals(bytes)) fail(`NO_CLOBBER:${relativePath}`);
  }
}

function labelSvg(entry) {
  const label = `${entry.assetId} · ${entry.jobClass.toUpperCase()} · ${entry.sourceClass.toUpperCase()} · ${entry.sha256.slice(0, 12)}`;
  return Buffer.from(`
    <svg width="${TILE_WIDTH}" height="30" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#111116"/>
      <text x="16" y="21" fill="#ffffff" font-size="15" font-family="Arial, sans-serif">${label}</text>
    </svg>
  `);
}

async function renderTile(entry) {
  const source = await readFile(path.join(ROOT, entry.sourcePath));
  const wide = await sharp(source, { failOn: "error" })
    .resize(TILE_WIDTH, 450, { fit: "cover", position: "centre" })
    .toBuffer();
  const mobile = await sharp(source, { failOn: "error" })
    .resize(180, 140, { fit: "cover", position: "centre" })
    .extend({
      top: 3,
      bottom: 3,
      left: 3,
      right: 3,
      background: "#ffffff",
    })
    .toBuffer();
  return sharp({
    create: {
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
      channels: 3,
      background: "#111116",
    },
  })
    .composite([
      { input: wide, left: 0, top: 0 },
      { input: mobile, left: TILE_WIDTH - 196, top: 294 },
      { input: labelSvg(entry), left: 0, top: 450 },
    ])
    .png()
    .toBuffer();
}

async function renderSheets(entries, prefix) {
  const sheets = [];
  const pageSize = SHEET_COLUMNS * SHEET_ROWS;
  for (let offset = 0; offset < entries.length; offset += pageSize) {
    const page = entries.slice(offset, offset + pageSize);
    const composites = [];
    for (const [tileIndex, entry] of page.entries()) {
      composites.push({
        input: await renderTile(entry),
        left: (tileIndex % SHEET_COLUMNS) * TILE_WIDTH,
        top: Math.floor(tileIndex / SHEET_COLUMNS) * TILE_HEIGHT,
      });
    }
    const bytes = await sharp({
      create: {
        width: SHEET_COLUMNS * TILE_WIDTH,
        height: SHEET_ROWS * TILE_HEIGHT,
        channels: 3,
        background: "#111116",
      },
    })
      .composite(composites)
      .png()
      .toBuffer();
    const pageNumber = Math.floor(offset / pageSize) + 1;
    const relativePath = `${REVIEW_ROOT}/${prefix}-${String(pageNumber).padStart(2, "0")}.png`;
    await writeNewOrExact(relativePath, bytes);
    sheets.push({
      relativePath,
      sha256: sha256(bytes),
      width: SHEET_COLUMNS * TILE_WIDTH,
      height: SHEET_ROWS * TILE_HEIGHT,
      assetIds: page.map((entry) => entry.assetId),
    });
  }
  return sheets;
}

const campaignBytes = await readFile(path.join(ROOT, CAMPAIGN_RELATIVE));
const campaign = JSON.parse(campaignBytes.toString("utf8"));
if (
  campaign.schemaVersion !==
    "honhyeol-template4-mirror-selfie-campaign/v1" ||
  campaign.platform?.id !== "honhyeol-massage" ||
  campaign.status !== "READY_FOR_ROOT_VISUAL_REVIEW" ||
  campaign.jobs?.length !== 148 ||
  campaign.counts?.regional !== 130 ||
  campaign.counts?.editorial !== 18 ||
  campaign.counts?.reused !== 74 ||
  campaign.counts?.new !== 74
) {
  fail("CAMPAIGN_CONTRACT");
}

const entries = [];
const seenHashes = new Set();
for (const job of campaign.jobs) {
  const source = await readFile(path.join(ROOT, job.sourceRelative)).catch(() =>
    fail(`SOURCE_MISSING:${job.assetId}`),
  );
  const sourceSha256 = sha256(source);
  if (sourceSha256 !== job.sourceSha256) fail(`SOURCE_SHA:${job.assetId}`);
  if (seenHashes.has(sourceSha256)) fail(`DUPLICATE_ACTIVE_SOURCE:${job.assetId}`);
  seenHashes.add(sourceSha256);
  const metadata = await sharp(source, { failOn: "error" }).metadata();
  if (
    metadata.format !== "png" ||
    !metadata.width ||
    !metadata.height ||
    metadata.width < 900 ||
    metadata.height < 768
  ) {
    fail(`SOURCE_DIMENSIONS:${job.assetId}`);
  }
  entries.push({
    assetId: job.assetId,
    jobClass: job.jobClass,
    sourceClass: job.sourceClass,
    styling: job.styling,
    sourcePath: job.sourceRelative,
    sha256: sourceSha256,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    slot: job.slot ?? null,
    lane: job.lane ?? null,
  });
}

const regional = entries.filter((entry) => entry.jobClass === "regional");
const editorial = entries.filter((entry) => entry.jobClass === "editorial");
const sheets = [
  ...(await renderSheets(regional, "regional-sheet")),
  ...(await renderSheets(editorial, "editorial-sheet")),
];

const inventory = {
  schemaVersion: "honhyeol-template4-mirror-contact-sheet-inventory/v1",
  status: "PENDING_ROOT_VISUAL_REVIEW",
  platformKey: "honhyeol-massage",
  campaign: {
    relativePath: CAMPAIGN_RELATIVE,
    sha256: sha256(campaignBytes),
  },
  counts: {
    total: entries.length,
    regional: regional.length,
    editorial: editorial.length,
    reused: entries.filter((entry) => entry.sourceClass === "reused").length,
    new: entries.filter((entry) => entry.sourceClass === "new").length,
    newMildlySexy: entries.filter(
      (entry) =>
        entry.sourceClass === "new" &&
        entry.styling === "tasteful-fitted-fashion",
    ).length,
    uniqueSourceHashes: seenHashes.size,
  },
  reviewContract: {
    adultOnly: true,
    fullyClothedNonExplicit: true,
    cleanPhysicalMirrorAndCoherentReflectionVisible: true,
    phoneVisible: true,
    responsiveCenterCropSafe: true,
    noTextLogoWatermarkBedBathroom: true,
    noMalformedAnatomyOrDuplicateSubject: true,
    noEthnicityTargeting: true,
  },
  entries,
  sheets,
};

if (
  inventory.counts.total !== 148 ||
  inventory.counts.regional !== 130 ||
  inventory.counts.editorial !== 18 ||
  inventory.counts.reused !== 74 ||
  inventory.counts.new !== 74 ||
  inventory.counts.newMildlySexy !== 18 ||
  inventory.counts.uniqueSourceHashes !== 148 ||
  sheets.length !== 15
) {
  fail(`INVENTORY_COUNTS:${JSON.stringify(inventory.counts)}`);
}

const inventoryBytes = Buffer.from(`${JSON.stringify(inventory, null, 2)}\n`);
await writeNewOrExact(INVENTORY_RELATIVE, inventoryBytes);
console.log(
  JSON.stringify(
    {
      status: inventory.status,
      counts: inventory.counts,
      sheets: sheets.length,
      inventory: INVENTORY_RELATIVE,
      inventorySha256: sha256(inventoryBytes),
    },
    null,
    2,
  ),
);
