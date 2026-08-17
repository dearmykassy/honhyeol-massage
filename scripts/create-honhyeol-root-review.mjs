import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const REVIEW_ROOT =
  "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-01";
const CAMPAIGN_RELATIVE =
  "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/campaign.v1.json";
const INVENTORY_RELATIVE = `${REVIEW_ROOT}/inventory.v1.json`;
const PARENT_QA_RELATIVE = `${REVIEW_ROOT}/parent-visual-qa.v1.json`;
const OUTPUT_RELATIVE = `${REVIEW_ROOT}/review.v1.json`;
const EXPECTED = {
  campaign:
    "d582465b23f46f058981efca730a49b117af31ffe190d8f2323a82d54e3a9f83",
  inventory:
    "136eb26debcafda9dbae15fa499d84dc771c7887afc90b04bfb04605aff3a0bf",
  parentQa:
    "f7ce8d631505997e79a3a60d1b4a2a06237b50541b1c03f11cfa20411ccb05b2",
};
const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

async function readJson(relativePath) {
  const bytes = await readFile(path.join(ROOT, relativePath));
  return {
    bytes,
    sha256: sha256(bytes),
    value: JSON.parse(bytes.toString("utf8")),
  };
}

async function writeNewOrExact(relativePath, bytes) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await writeFile(absolutePath, bytes, { flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existing = await readFile(absolutePath);
    if (!existing.equals(bytes)) {
      throw new Error(`HONHYEOL_ROOT_REVIEW_NO_CLOBBER:${relativePath}`);
    }
  }
}

if (!process.argv.includes("--approve-reviewed-assets")) {
  throw new Error("HONHYEOL_ROOT_REVIEW_EXPLICIT_APPROVAL_FLAG_REQUIRED");
}

const campaign = await readJson(CAMPAIGN_RELATIVE);
const inventory = await readJson(INVENTORY_RELATIVE);
const parentQa = await readJson(PARENT_QA_RELATIVE);
if (
  campaign.sha256 !== EXPECTED.campaign ||
  inventory.sha256 !== EXPECTED.inventory ||
  parentQa.sha256 !== EXPECTED.parentQa ||
  inventory.value.campaign?.sha256 !== campaign.sha256 ||
  parentQa.value.campaign?.sha256 !== campaign.sha256 ||
  parentQa.value.inventory?.sha256 !== inventory.sha256 ||
  campaign.value.jobs?.length !== 148 ||
  inventory.value.entries?.length !== 148 ||
  parentQa.value.assets?.length !== 148 ||
  parentQa.value.assets.some((entry) => entry.decision !== "ACCEPT")
) {
  throw new Error("HONHYEOL_ROOT_REVIEW_AUTHORITY_CONTRACT");
}

const entriesById = new Map(
  inventory.value.entries.map((entry) => [entry.assetId, entry]),
);
const assets = parentQa.value.assets.map((entry) => {
  const inventoryEntry = entriesById.get(entry.assetId);
  if (!inventoryEntry || inventoryEntry.sha256 !== entry.sourceSha256) {
    throw new Error(`HONHYEOL_ROOT_REVIEW_SOURCE:${entry.assetId}`);
  }
  return {
    assetId: entry.assetId,
    sourceSha256: entry.sourceSha256,
    decision: "ACCEPT",
    criteria: entry.criteria,
  };
});

const review = {
  schemaVersion: "honhyeol-template4-mirror-root-review/v1",
  status: "ROOT_APPROVED",
  platformKey: "honhyeol-massage",
  reviewer: "root",
  reviewScope: "regional 130 + editorial 18 exact active assets",
  campaign: {
    relativePath: CAMPAIGN_RELATIVE,
    sha256: campaign.sha256,
  },
  inventory: {
    relativePath: INVENTORY_RELATIVE,
    sha256: inventory.sha256,
  },
  parentVisualQa: {
    relativePath: PARENT_QA_RELATIVE,
    sha256: parentQa.sha256,
  },
  contactSheets: inventory.value.sheets.map((sheet) => ({
    relativePath: sheet.relativePath,
    sha256: sheet.sha256,
  })),
  counts: {
    approved: assets.length,
    rejected: 0,
    regional: 130,
    editorial: 18,
    reused: 74,
    new: 74,
    newMildlySexy: 18,
  },
  assets,
  routeAssignmentAuthorized: true,
  derivativeReleaseAuthorized: true,
};

const bytes = Buffer.from(`${JSON.stringify(review, null, 2)}\n`);
await writeNewOrExact(OUTPUT_RELATIVE, bytes);
console.log(
  JSON.stringify(
    {
      status: review.status,
      approved: assets.length,
      output: OUTPUT_RELATIVE,
      sha256: sha256(bytes),
    },
    null,
    2,
  ),
);
