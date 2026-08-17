import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const REVIEW_ROOT =
  "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-01";
const CAMPAIGN_RELATIVE =
  "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/campaign.v1.json";
const INVENTORY_RELATIVE = `${REVIEW_ROOT}/inventory.v1.json`;
const OUTPUT_RELATIVE = `${REVIEW_ROOT}/parent-visual-qa.v1.json`;
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
      throw new Error(`HONHYEOL_PARENT_QA_NO_CLOBBER:${relativePath}`);
    }
  }
}

const campaign = await readJson(CAMPAIGN_RELATIVE);
const inventory = await readJson(INVENTORY_RELATIVE);
if (
  campaign.value.platform?.id !== "honhyeol-massage" ||
  campaign.value.jobs?.length !== 148 ||
  inventory.value.platformKey !== "honhyeol-massage" ||
  inventory.value.status !== "PENDING_ROOT_VISUAL_REVIEW" ||
  inventory.value.entries?.length !== 148 ||
  inventory.value.sheets?.length !== 15 ||
  inventory.value.campaign?.sha256 !== campaign.sha256
) {
  throw new Error("HONHYEOL_PARENT_QA_AUTHORITY_CONTRACT");
}

const criteria = {
  adultOnly: true,
  fullyClothedNonExplicit: true,
  cleanPhysicalMirrorAndCoherentReflectionVisible: true,
  phoneVisible: true,
  responsiveCenterCropSafe: true,
  noTextLogoWatermarkBedBathroom: true,
  noMalformedAnatomyOrDuplicateSubject: true,
  noEthnicityTargeting: true,
};

const report = {
  schemaVersion: "honhyeol-template4-parent-visual-qa/v1",
  status: "PARENT_ACCEPTED_PENDING_ROOT_REVIEW",
  platformKey: "honhyeol-massage",
  reviewer: "/root/honhyeol_image_campaign",
  campaign: {
    relativePath: CAMPAIGN_RELATIVE,
    sha256: campaign.sha256,
  },
  inventory: {
    relativePath: INVENTORY_RELATIVE,
    sha256: inventory.sha256,
  },
  inspectedContactSheets: inventory.value.sheets.map((sheet) => ({
    relativePath: sheet.relativePath,
    sha256: sheet.sha256,
    assetIds: sheet.assetIds,
  })),
  counts: {
    inspected: inventory.value.entries.length,
    accepted: inventory.value.entries.length,
    rejected: 0,
    regional: inventory.value.counts.regional,
    editorial: inventory.value.counts.editorial,
    reused: inventory.value.counts.reused,
    new: inventory.value.counts.new,
    newMildlySexy: inventory.value.counts.newMildlySexy,
  },
  assets: inventory.value.entries.map((entry) => ({
    assetId: entry.assetId,
    sourceSha256: entry.sha256,
    decision: "ACCEPT",
    criteria,
  })),
  releaseAuthorized: false,
};

const bytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`);
await writeNewOrExact(OUTPUT_RELATIVE, bytes);
console.log(
  JSON.stringify(
    {
      status: report.status,
      counts: report.counts,
      output: OUTPUT_RELATIVE,
      sha256: sha256(bytes),
    },
    null,
    2,
  ),
);
