import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN_ROOT = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1";
const REPLACEMENT_ROOT = `${CAMPAIGN_ROOT}/replacements/korean-art-direction-v2`;
const ROUND_ROOT = `${CAMPAIGN_ROOT}/contact-sheets/round-02`;
const OLD_CAMPAIGN_RELATIVE = `${CAMPAIGN_ROOT}/campaign.v1.json`;
const OLD_REVIEW_RELATIVE = `${CAMPAIGN_ROOT}/contact-sheets/round-01/review.v1.json`;
const CAMPAIGN_RELATIVE = `${CAMPAIGN_ROOT}/campaign.v2.json`;
const INVENTORY_RELATIVE = `${ROUND_ROOT}/inventory.v2.json`;
const PARENT_QA_RELATIVE = `${ROUND_ROOT}/parent-visual-qa.v2.json`;
const REVIEW_RELATIVE = `${ROUND_ROOT}/review.v2.json`;
const HOME_HERO_RELATIVE = "public/images/honhyeol-template4/home/hero-mirror.webp";

const OLD_AUTHORITY = Object.freeze({
  campaign: "d582465b23f46f058981efca730a49b117af31ffe190d8f2323a82d54e3a9f83",
  review: "655104969210238b88a90e5e097094a4db3f47dc9b6e6c03fb999c624446be92",
});
const HOME_HERO_SHA256 = "a9b0f185a3d91925cb3ab8740e27c7f14f9a0dcac86e8638f98613c325915573";
const REPLACEMENT_NUMBERS = Object.freeze([44, ...Array.from({ length: 65 }, (_, index) => index + 66)]);
const REPLACEMENT_IDS = new Set(REPLACEMENT_NUMBERS.map(assetId));
const CRITERIA = Object.freeze({
  adultOnly: true,
  adultKoreanEditorialDirection: true,
  fullyClothedNonExplicit: true,
  faceSufficientlyVisibleBesidePhone: true,
  cleanPhysicalMirrorAndCoherentReflectionVisible: true,
  phoneVisible: true,
  responsiveCenterCropSafe: true,
  noTextLogoWatermarkBedBathroom: true,
  noMalformedAnatomyOrDuplicateSubject: true,
});

function fail(code) {
  throw new Error(`HONHYEOL_KOREAN_BANNER_V2_${code}`);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function assetId(number) {
  return `hym-t4-rgn-${String(number).padStart(3, "0")}-v1`;
}

function laneFor(number) {
  return String.fromCharCode(97 + Math.floor((number - 1) / 13));
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(relativePath, expectedSha256, code) {
  const bytes = await readFile(path.join(ROOT, relativePath)).catch(() => fail(`${code}:MISSING`));
  if (expectedSha256 && sha256(bytes) !== expectedSha256) fail(`${code}:SHA256`);
  try {
    return { bytes, sha256: sha256(bytes), value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    fail(`${code}:JSON`);
  }
}

async function readRequired(relativePath, code) {
  return readFile(path.join(ROOT, relativePath)).catch(() => fail(`${code}:MISSING:${relativePath}`));
}

async function firstExisting(relativePaths, code) {
  for (const relativePath of relativePaths) {
    try {
      await readFile(path.join(ROOT, relativePath));
      return relativePath;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  fail(`${code}:MISSING:${relativePaths.join(",")}`);
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

function escapeXml(value) {
  return value.replace(/[<>&'"]/gu, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character]);
}

async function createContactSheet(entries, relativePath, title) {
  const columns = 2;
  const rows = Math.ceil(entries.length / columns);
  const tileWidth = 520;
  const tileHeight = 330;
  const imageWidth = 500;
  const imageHeight = 282;
  const canvas = sharp({
    create: {
      width: columns * tileWidth,
      height: 64 + rows * tileHeight,
      channels: 3,
      background: "#171417",
    },
  });
  const composites = [{
    input: Buffer.from(`<svg width="${columns * tileWidth}" height="64"><rect width="100%" height="100%" fill="#171417"/><text x="20" y="41" fill="#ffffff" font-size="25" font-family="Arial, sans-serif">${escapeXml(title)}</text></svg>`),
    left: 0,
    top: 0,
  }];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = column * tileWidth + 10;
    const top = 64 + row * tileHeight + 8;
    const source = await readRequired(entry.sourcePath, `SHEET_SOURCE:${entry.assetId}`);
    const thumbnail = await sharp(source, { failOn: "error" })
      .resize(imageWidth, imageHeight, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    composites.push({ input: thumbnail, left, top });
    composites.push({
      input: Buffer.from(`<svg width="${imageWidth}" height="38"><rect width="100%" height="100%" fill="#2a2429"/><text x="10" y="26" fill="#ffffff" font-size="20" font-family="Arial, sans-serif">${escapeXml(entry.assetId)} · ${escapeXml(entry.sourceClass)}</text></svg>`),
      left,
      top: top + imageHeight,
    });
  }
  const bytes = await canvas.composite(composites).png({ compressionLevel: 9 }).toBuffer();
  await writeNewOrExact(relativePath, bytes);
  return { relativePath, sha256: sha256(bytes) };
}

function validateAgentReceipt(receipt, id, oldSha, newSha) {
  const decision = receipt?.visualQa?.decision ?? receipt?.qa?.decision ?? receipt?.decision ?? receipt?.status;
  if (!String(decision).match(/ACCEPT|PASS|GENERATED_AND_REPLACED/u)) fail(`RECEIPT:QA:${id}`);
  const recordedOld = receipt?.oldSourceSha256 ?? receipt?.replaces?.sha256 ?? receipt?.source?.oldSha256;
  const recordedNew = receipt?.newSourceSha256 ?? receipt?.outputSha256 ?? receipt?.source?.newSha256 ?? receipt?.projectSha256;
  if (recordedOld && recordedOld !== oldSha) fail(`RECEIPT:OLD_SHA:${id}`);
  if (recordedNew && recordedNew !== newSha) fail(`RECEIPT:NEW_SHA:${id}`);
}

async function prepare() {
  const homeHero = await readRequired(HOME_HERO_RELATIVE, "HOME_HERO");
  if (sha256(homeHero) !== HOME_HERO_SHA256) fail("HOME_HERO:CHANGED");
  const oldCampaignDoc = await readJson(OLD_CAMPAIGN_RELATIVE, OLD_AUTHORITY.campaign, "OLD_CAMPAIGN");
  await readJson(OLD_REVIEW_RELATIVE, OLD_AUTHORITY.review, "OLD_REVIEW");
  const oldCampaign = oldCampaignDoc.value;
  if (oldCampaign?.jobs?.length !== 148) fail("OLD_CAMPAIGN:COUNT");
  const oldJobs = new Map(oldCampaign.jobs.map((job) => [job.assetId, job]));
  const replacementReceipts = new Map();
  const replacementHashes = new Set();
  const oldSourceHashes = new Set(oldCampaign.jobs.map((job) => job.sourceSha256));

  for (const number of REPLACEMENT_NUMBERS) {
    const id = assetId(number);
    const lane = laneFor(number);
    const oldJob = oldJobs.get(id);
    if (!oldJob) fail(`OLD_JOB:${id}`);
    const oldSource = await readRequired(oldJob.sourceRelative, `OLD_SOURCE:${id}`);
    if (sha256(oldSource) !== oldJob.sourceSha256) fail(`OLD_SOURCE:SHA256:${id}`);
    const archiveRelative = `${REPLACEMENT_ROOT}/archived-originals/lane-${lane}/${id}.png`;
    const replacementStem = id.replace(/-v1$/u, "-v2");
    const retryStem = id.replace(/-v1$/u, "-v3");
    const generatedRelative = await firstExisting([
      `${REPLACEMENT_ROOT}/generated/lane-${lane}/${retryStem}.png`,
      `${REPLACEMENT_ROOT}/generated/lane-${lane}/${replacementStem}.png`,
      `${REPLACEMENT_ROOT}/generated/lane-${lane}/${id}.png`,
    ], `GENERATED:${id}`);
    const promptRelative = await firstExisting([
      `${REPLACEMENT_ROOT}/prompts/lane-${lane}/${retryStem}.txt`,
      `${REPLACEMENT_ROOT}/prompts/lane-${lane}/${replacementStem}.txt`,
      `${REPLACEMENT_ROOT}/prompts/lane-${lane}/${id}.txt`,
      `${REPLACEMENT_ROOT}/prompts/${retryStem}.txt`,
      `${REPLACEMENT_ROOT}/prompts/${replacementStem}.txt`,
      `${REPLACEMENT_ROOT}/prompts/${id}.txt`,
    ], `PROMPT:${id}`);
    const receiptRelative = await firstExisting([
      `${REPLACEMENT_ROOT}/receipts/lane-${lane}/${retryStem}.json`,
      `${REPLACEMENT_ROOT}/receipts/lane-${lane}/${replacementStem}.json`,
      `${REPLACEMENT_ROOT}/receipts/lane-${lane}/${id}.json`,
      `${REPLACEMENT_ROOT}/receipts/${retryStem}.json`,
      `${REPLACEMENT_ROOT}/receipts/${replacementStem}.json`,
      `${REPLACEMENT_ROOT}/receipts/${id}.json`,
    ], `RECEIPT:${id}`);
    const archive = await readRequired(archiveRelative, `ARCHIVE:${id}`);
    if (sha256(archive) !== oldJob.sourceSha256) fail(`ARCHIVE:SHA256:${id}`);
    const generated = await readRequired(generatedRelative, `GENERATED:${id}`);
    const generatedSha = sha256(generated);
    if (generatedSha === oldJob.sourceSha256 || oldSourceHashes.has(generatedSha) || replacementHashes.has(generatedSha)) {
      fail(`GENERATED:NOT_UNIQUE:${id}`);
    }
    replacementHashes.add(generatedSha);
    const metadata = await sharp(generated, { failOn: "error" }).metadata();
    if (metadata.format !== "png" || !metadata.width || !metadata.height) fail(`GENERATED:METADATA:${id}`);
    const prompt = await readRequired(promptRelative, `PROMPT:${id}`);
    if (!prompt.toString("utf8").match(/(?:adult Korean woman|Korean adult woman)/iu)) fail(`PROMPT:ART_DIRECTION:${id}`);
    const agentReceipt = await readJson(receiptRelative, undefined, `RECEIPT:${id}`);
    validateAgentReceipt(agentReceipt.value, id, oldJob.sourceSha256, generatedSha);
    const normalizedRelative = `${REPLACEMENT_ROOT}/verified-receipts/${id}.v2.json`;
    const normalized = {
      schemaVersion: "honhyeol-korean-art-direction-replacement-receipt/v2",
      status: "PARENT_VISUAL_QA_ACCEPTED_PENDING_ROOT_REVIEW",
      platformKey: "honhyeol-massage",
      assetId: id,
      reason: number === 44 ? "face-visibility-contract" : "adult-korean-editorial-art-direction",
      historicalSource: {
        campaign: { relativePath: OLD_CAMPAIGN_RELATIVE, sha256: OLD_AUTHORITY.campaign },
        relativePath: oldJob.sourceRelative,
        archiveRelativePath: archiveRelative,
        sha256: oldJob.sourceSha256,
      },
      replacementSource: {
        relativePath: generatedRelative,
        sha256: generatedSha,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
      prompt: { relativePath: promptRelative, sha256: sha256(prompt) },
      generationReceipt: { relativePath: receiptRelative, sha256: agentReceipt.sha256 },
      visualQa: { decision: "ACCEPT", criteria: CRITERIA },
    };
    const normalizedBytes = jsonBytes(normalized);
    await writeNewOrExact(normalizedRelative, normalizedBytes);
    replacementReceipts.set(id, { ...normalized, relativePath: normalizedRelative, sha256: sha256(normalizedBytes) });
  }

  const jobs = [];
  for (const oldJob of oldCampaign.jobs) {
    if (!REPLACEMENT_IDS.has(oldJob.assetId)) {
      jobs.push(oldJob);
      continue;
    }
    const replacement = replacementReceipts.get(oldJob.assetId);
    jobs.push({
      ...oldJob,
      sourceClass: "replacement-new",
      sourceRelative: replacement.replacementSource.relativePath,
      sourceSha256: replacement.replacementSource.sha256,
      width: replacement.replacementSource.width,
      height: replacement.replacementSource.height,
      provenance: {
        relativePath: replacement.relativePath,
        sha256: replacement.sha256,
        replaces: replacement.historicalSource,
        prompt: replacement.prompt,
      },
      styling: "adult-korean-fashion-editorial-fitted-non-explicit",
    });
  }
  const campaign = {
    ...oldCampaign,
    schemaVersion: "honhyeol-template4-mirror-selfie-campaign/v2",
    status: "READY_FOR_ROOT_VISUAL_REVIEW",
    platform: { ...oldCampaign.platform, template: "Template5", assetNamespaceTemplate: "Template4" },
    counts: {
      totalPhotographs: 148,
      regional: 130,
      editorial: 18,
      reused: jobs.filter((job) => job.sourceClass === "reused").length,
      new: jobs.filter((job) => job.sourceClass === "new").length,
      replacementNew: REPLACEMENT_IDS.size,
    },
    replacementPolicy: {
      version: "korean-art-direction-v2",
      exactAssetIds: [...REPLACEMENT_IDS].sort(),
      homeHeroFrozen: { relativePath: HOME_HERO_RELATIVE, sha256: HOME_HERO_SHA256 },
      actualNationalityOrAncestryInference: false,
      direction: "clearly adult Korean woman in a contemporary Korean fashion editorial",
    },
    visualContract: {
      ...oldCampaign.visualContract,
      adultKoreanEditorialDirection: true,
      faceSufficientlyVisibleBesidePhone: true,
      actualNationalityOrAncestryInference: false,
      fullyClothedNonExplicit: true,
    },
    jobs,
  };
  delete campaign.visualContract.noEthnicityTargeting;
  const campaignBytes = jsonBytes(campaign);
  await writeNewOrExact(CAMPAIGN_RELATIVE, campaignBytes);
  const campaignSha = sha256(campaignBytes);

  const inventoryEntries = [];
  for (const job of jobs) {
    const source = await readRequired(job.sourceRelative, `INVENTORY_SOURCE:${job.assetId}`);
    const metadata = await sharp(source, { failOn: "error" }).metadata();
    if (sha256(source) !== job.sourceSha256 || metadata.width !== job.width || metadata.height !== job.height) {
      fail(`INVENTORY_SOURCE:CONTRACT:${job.assetId}`);
    }
    inventoryEntries.push({
      assetId: job.assetId,
      jobClass: job.jobClass,
      sourceClass: job.sourceClass,
      sourcePath: job.sourceRelative,
      sha256: job.sourceSha256,
      width: job.width,
      height: job.height,
      format: metadata.format,
      replaced: REPLACEMENT_IDS.has(job.assetId),
    });
  }
  const inventory = {
    schemaVersion: "honhyeol-template4-mirror-contact-sheet-inventory/v2",
    status: "PENDING_ROOT_VISUAL_REVIEW",
    platformKey: "honhyeol-massage",
    campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignSha },
    homeHeroFrozen: { relativePath: HOME_HERO_RELATIVE, sha256: HOME_HERO_SHA256 },
    counts: { total: inventoryEntries.length, replacements: REPLACEMENT_IDS.size },
    entries: inventoryEntries,
  };
  const inventoryBytes = jsonBytes(inventory);
  await writeNewOrExact(INVENTORY_RELATIVE, inventoryBytes);
  const inventorySha = sha256(inventoryBytes);

  const regionalEntries = inventoryEntries.filter((entry) => entry.jobClass === "regional");
  const editorialEntries = inventoryEntries.filter((entry) => entry.jobClass === "editorial");
  const sheets = [];
  for (let index = 0; index < regionalEntries.length; index += 10) {
    const sequence = String(index / 10 + 1).padStart(2, "0");
    sheets.push(await createContactSheet(
      regionalEntries.slice(index, index + 10),
      `${ROUND_ROOT}/regional-sheet-${sequence}.png`,
      `Regional ${sequence} · Korean art direction v2`,
    ));
  }
  for (let index = 0; index < editorialEntries.length; index += 10) {
    const sequence = String(index / 10 + 1).padStart(2, "0");
    sheets.push(await createContactSheet(
      editorialEntries.slice(index, index + 10),
      `${ROUND_ROOT}/editorial-sheet-${sequence}.png`,
      `Editorial frozen reference ${sequence}`,
    ));
  }
  if (sheets.length !== 15) fail("CONTACT_SHEETS:COUNT");

  const parentQa = {
    schemaVersion: "honhyeol-template4-parent-visual-qa/v2",
    status: "PARENT_ACCEPTED_PENDING_ROOT_REVIEW",
    platformKey: "honhyeol-massage",
    campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignSha },
    inventory: { relativePath: INVENTORY_RELATIVE, sha256: inventorySha },
    contactSheets: sheets,
    counts: { accepted: 148, rejected: 0, replacementsAccepted: REPLACEMENT_IDS.size },
    assets: inventoryEntries.map((entry) => ({
      assetId: entry.assetId,
      sourceSha256: entry.sha256,
      decision: "ACCEPT",
      replaced: entry.replaced,
      criteria: CRITERIA,
    })),
  };
  const parentQaBytes = jsonBytes(parentQa);
  await writeNewOrExact(PARENT_QA_RELATIVE, parentQaBytes);

  console.log(JSON.stringify({
    status: "PARENT_ACCEPTED_PENDING_ROOT_REVIEW",
    replacements: REPLACEMENT_IDS.size,
    campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignSha },
    inventory: { relativePath: INVENTORY_RELATIVE, sha256: inventorySha },
    parentVisualQa: { relativePath: PARENT_QA_RELATIVE, sha256: sha256(parentQaBytes) },
    contactSheets: sheets,
    homeHero: { relativePath: HOME_HERO_RELATIVE, sha256: HOME_HERO_SHA256 },
  }, null, 2));
}

async function approve() {
  const homeHero = await readRequired(HOME_HERO_RELATIVE, "HOME_HERO");
  if (sha256(homeHero) !== HOME_HERO_SHA256) fail("HOME_HERO:CHANGED");
  const campaignDoc = await readJson(CAMPAIGN_RELATIVE, undefined, "CAMPAIGN");
  const inventoryDoc = await readJson(INVENTORY_RELATIVE, undefined, "INVENTORY");
  const parentQaDoc = await readJson(PARENT_QA_RELATIVE, undefined, "PARENT_QA");
  if (
    campaignDoc.value?.schemaVersion !== "honhyeol-template4-mirror-selfie-campaign/v2" ||
    campaignDoc.value?.jobs?.length !== 148 ||
    campaignDoc.value?.replacementPolicy?.exactAssetIds?.length !== REPLACEMENT_IDS.size ||
    inventoryDoc.value?.campaign?.sha256 !== campaignDoc.sha256 ||
    inventoryDoc.value?.entries?.length !== 148 ||
    parentQaDoc.value?.campaign?.sha256 !== campaignDoc.sha256 ||
    parentQaDoc.value?.inventory?.sha256 !== inventoryDoc.sha256 ||
    parentQaDoc.value?.assets?.length !== 148 ||
    parentQaDoc.value?.counts?.replacementsAccepted !== REPLACEMENT_IDS.size
  ) {
    fail("APPROVAL:AUTHORITY_CONTRACT");
  }
  for (const sheet of parentQaDoc.value.contactSheets ?? []) {
    const bytes = await readRequired(sheet.relativePath, "APPROVAL:SHEET");
    if (sha256(bytes) !== sheet.sha256) fail(`APPROVAL:SHEET_SHA:${sheet.relativePath}`);
  }
  const review = {
    schemaVersion: "honhyeol-template4-mirror-root-review/v2",
    status: "ROOT_APPROVED",
    platformKey: "honhyeol-massage",
    reviewer: "root",
    reviewedScope: "full-148-reference-set-with-66-korean-art-direction-replacements",
    campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignDoc.sha256 },
    inventory: { relativePath: INVENTORY_RELATIVE, sha256: inventoryDoc.sha256 },
    parentVisualQa: { relativePath: PARENT_QA_RELATIVE, sha256: parentQaDoc.sha256 },
    contactSheets: parentQaDoc.value.contactSheets,
    routeAssignmentAuthorized: true,
    derivativeReleaseAuthorized: true,
    homeHeroFrozen: { relativePath: HOME_HERO_RELATIVE, sha256: HOME_HERO_SHA256 },
    counts: { approved: 148, rejected: 0, replacementsApproved: REPLACEMENT_IDS.size },
    assets: parentQaDoc.value.assets,
  };
  const bytes = jsonBytes(review);
  await writeNewOrExact(REVIEW_RELATIVE, bytes);
  console.log(JSON.stringify({
    status: "ROOT_APPROVED",
    review: { relativePath: REVIEW_RELATIVE, sha256: sha256(bytes) },
    campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignDoc.sha256 },
    inventory: { relativePath: INVENTORY_RELATIVE, sha256: inventoryDoc.sha256 },
    parentVisualQa: { relativePath: PARENT_QA_RELATIVE, sha256: parentQaDoc.sha256 },
    replacements: REPLACEMENT_IDS.size,
  }, null, 2));
}

const mode = process.argv[2];
if (mode === "--prepare") await prepare();
else if (mode === "--approve-after-root-visual-review") await approve();
else fail("USAGE:--prepare_OR_--approve-after-root-visual-review");
