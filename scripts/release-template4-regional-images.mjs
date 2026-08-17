import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getRegionalImageAssetId } from "../src/lib/regional-image-assignment.ts";
import {
  ACTIVE_REGION_NODES,
  getDirectChildren,
  getParentNode,
} from "../src/lib/regions.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN_RELATIVE = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/campaign.v2.json";
const INVENTORY_RELATIVE = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-02/inventory.v2.json";
const PARENT_QA_RELATIVE = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-02/parent-visual-qa.v2.json";
const REVIEW_RELATIVE = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-02/review.v2.json";
const OLD_CAMPAIGN_RELATIVE = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/campaign.v1.json";
const FOCAL_RELATIVE = "src/data/regional-image-focal-points.template4.json";
const MANIFEST_RELATIVE = "src/data/regional-image-assignments.template4.generated.json";
const REGIONAL_RECEIPT_RELATIVE = "artifacts/image-release/honhyeol-massage-template4-regional-release.v2.json";
const EDITORIAL_RECEIPT_RELATIVE = "artifacts/image-release/honhyeol-massage-template4-editorial-release.v1.json";
const REGIONAL_PUBLIC_ROOT = "public/assets/honhyeol-massage/template4-regional";

const AUTHORITY_SHA256 = Object.freeze({
  campaign: "faebb1fafc00e21f7fa68631d5aa0ff8a78beb70810d3a15d9c850a533442e1d",
  inventory: "6c47178bd2115a268394f4b6f2aa7545d4a1cbed4b4d71892420f26664d501ce",
  parentQa: "3d5f8e8c91afbe1e9b786606954650de7e328148dae5a59ef19208e08eb34ab4",
  review: "92ed8e09051bac486ecd2b5cbe6648606aea74b6dd8ad73f826ce12afbb08b00",
});
const OLD_CAMPAIGN_SHA256 = "d582465b23f46f058981efca730a49b117af31ffe190d8f2323a82d54e3a9f83";
const OLD_MANIFEST_SHA256 = "a7b8e5e64f43af4ec2e3d0362969018d5fe4288dcdda106994882778fb492142";
const HOME_HERO_RELATIVE = "public/images/honhyeol-template4/home/hero-mirror.webp";
const HOME_HERO_SHA256 = "a9b0f185a3d91925cb3ab8740e27c7f14f9a0dcac86e8638f98613c325915573";
const REPLACEMENT_IDS = new Set([
  "hym-t4-rgn-044-v1",
  ...Array.from({ length: 65 }, (_, index) => `hym-t4-rgn-${String(index + 66).padStart(3, "0")}-v1`),
]);

const EXPECTED = Object.freeze({
  totalAssets: 148,
  regionalAssets: 130,
  editorialAssets: 18,
  reusedAssets: 73,
  newAssets: 9,
  replacementAssets: 66,
  routes: 1291,
});

const PROFILES = Object.freeze({
  desktop: Object.freeze({ width: 1600, height: 900 }),
  tablet: Object.freeze({ width: 1200, height: 675 }),
  mobile: Object.freeze({ width: 768, height: 600 }),
});

function fail(code) {
  throw new Error(`HONHYEOL_T4_IMAGE_RELEASE_${code}`);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(relativePath, expectedSha256, code) {
  const bytes = await readFile(path.join(ROOT, relativePath)).catch(() => fail(`${code}:MISSING`));
  if (sha256(bytes) !== expectedSha256) fail(`${code}:SHA256`);
  try {
    return { bytes, sha256: expectedSha256, value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    fail(`${code}:JSON`);
  }
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

async function writeAuthorizedReplacement(relativePath, bytes, expectedExistingSha256) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  let existing;
  try {
    existing = await readFile(absolutePath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  if (!existing) {
    await writeFile(absolutePath, bytes, { flag: "wx" });
    return;
  }
  if (existing.equals(bytes)) return;
  if (sha256(existing) !== expectedExistingSha256) fail(`REPLACEMENT_PREIMAGE:${relativePath}`);
  await writeFile(absolutePath, bytes, { flag: "w" });
}

async function writeAssignmentManifest(bytes, currentCampaignSha256) {
  const absolutePath = path.join(ROOT, MANIFEST_RELATIVE);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  let existing;
  try {
    existing = await readFile(absolutePath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  if (!existing) {
    await writeFile(absolutePath, bytes, { flag: "wx" });
    return;
  }
  if (existing.equals(bytes)) return;
  const existingSha256 = sha256(existing);
  let existingManifest;
  try {
    existingManifest = JSON.parse(existing.toString("utf8"));
  } catch {
    fail("ASSIGNMENT_MANIFEST:JSON");
  }
  if (
    existingSha256 !== OLD_MANIFEST_SHA256 &&
    existingManifest?.authority?.campaign?.sha256 !== currentCampaignSha256
  ) {
    fail("ASSIGNMENT_MANIFEST:PREIMAGE");
  }
  await writeFile(absolutePath, bytes, { flag: "w" });
}

function exactSet(left, right) {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

function validateCounts(counts) {
  return (
    counts?.totalPhotographs === EXPECTED.totalAssets &&
    counts?.regional === EXPECTED.regionalAssets &&
    counts?.editorial === EXPECTED.editorialAssets &&
    counts?.reused === EXPECTED.reusedAssets &&
    counts?.new === EXPECTED.newAssets &&
    counts?.replacementNew === EXPECTED.replacementAssets
  );
}

function validateReviewCriteria(entry) {
  const expectedKeys = [
    "adultOnly",
    "adultKoreanEditorialDirection",
    "fullyClothedNonExplicit",
    "faceSufficientlyVisibleBesidePhone",
    "cleanPhysicalMirrorAndCoherentReflectionVisible",
    "phoneVisible",
    "responsiveCenterCropSafe",
    "noTextLogoWatermarkBedBathroom",
    "noMalformedAnatomyOrDuplicateSubject",
  ];
  return (
    entry?.decision === "ACCEPT" &&
    expectedKeys.every((key) => entry.criteria?.[key] === true) &&
    Object.keys(entry.criteria ?? {}).length === expectedKeys.length
  );
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function calculateFocalCoverExtraction({
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  xPermille,
  yPermille,
}) {
  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;
  let width;
  let height;
  if (sourceAspect > targetAspect) {
    height = sourceHeight;
    width = Math.min(sourceWidth, Math.round(sourceHeight * targetAspect));
  } else {
    width = sourceWidth;
    height = Math.min(sourceHeight, Math.round(sourceWidth / targetAspect));
  }
  const requestedCenterX = sourceWidth * xPermille / 1000;
  const requestedCenterY = sourceHeight * yPermille / 1000;
  const left = Math.round(clamp(requestedCenterX - width / 2, 0, sourceWidth - width));
  const top = Math.round(clamp(requestedCenterY - height / 2, 0, sourceHeight - height));
  return { left, top, width, height };
}

function publicPath(relativePath) {
  return `/${relativePath.replace(/^public\//u, "")}`;
}

function assertNoLegacyIdentity(value, code) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (/geonmae-banhada|geonma-template4|gmb-t4/u.test(text)) fail(`${code}:LEGACY_IDENTITY`);
}

const campaignDoc = await readJson(CAMPAIGN_RELATIVE, AUTHORITY_SHA256.campaign, "CAMPAIGN");
const inventoryDoc = await readJson(INVENTORY_RELATIVE, AUTHORITY_SHA256.inventory, "INVENTORY");
const parentQaDoc = await readJson(PARENT_QA_RELATIVE, AUTHORITY_SHA256.parentQa, "PARENT_QA");
const reviewDoc = await readJson(REVIEW_RELATIVE, AUTHORITY_SHA256.review, "ROOT_REVIEW");
const focalBytes = await readFile(path.join(ROOT, FOCAL_RELATIVE)).catch(() => fail("FOCAL:MISSING"));
let focal;
try {
  focal = JSON.parse(focalBytes.toString("utf8"));
} catch {
  fail("FOCAL:JSON");
}
const focalSha256 = sha256(focalBytes);

const campaign = campaignDoc.value;
const inventory = inventoryDoc.value;
const parentQa = parentQaDoc.value;
const review = reviewDoc.value;

if (
  campaign?.schemaVersion !== "honhyeol-template4-mirror-selfie-campaign/v2" ||
  campaign?.status !== "READY_FOR_ROOT_VISUAL_REVIEW" ||
  campaign?.platform?.id !== "honhyeol-massage" ||
  campaign?.platform?.template !== "Template5" ||
  campaign?.platform?.assetNamespaceTemplate !== "Template4" ||
  !validateCounts(campaign?.counts) ||
  campaign?.jobs?.length !== EXPECTED.totalAssets ||
  campaign?.replacementPolicy?.exactAssetIds?.length !== EXPECTED.replacementAssets ||
  campaign?.replacementPolicy?.homeHeroFrozen?.sha256 !== HOME_HERO_SHA256 ||
  inventory?.schemaVersion !== "honhyeol-template4-mirror-contact-sheet-inventory/v2" ||
  inventory?.status !== "PENDING_ROOT_VISUAL_REVIEW" ||
  inventory?.platformKey !== "honhyeol-massage" ||
  inventory?.campaign?.sha256 !== AUTHORITY_SHA256.campaign ||
  inventory?.entries?.length !== EXPECTED.totalAssets ||
  parentQa?.schemaVersion !== "honhyeol-template4-parent-visual-qa/v2" ||
  parentQa?.status !== "PARENT_ACCEPTED_PENDING_ROOT_REVIEW" ||
  parentQa?.platformKey !== "honhyeol-massage" ||
  parentQa?.campaign?.sha256 !== AUTHORITY_SHA256.campaign ||
  parentQa?.inventory?.sha256 !== AUTHORITY_SHA256.inventory ||
  parentQa?.assets?.length !== EXPECTED.totalAssets ||
  review?.schemaVersion !== "honhyeol-template4-mirror-root-review/v2" ||
  review?.status !== "ROOT_APPROVED" ||
  review?.platformKey !== "honhyeol-massage" ||
  review?.reviewer !== "root" ||
  review?.campaign?.sha256 !== AUTHORITY_SHA256.campaign ||
  review?.inventory?.sha256 !== AUTHORITY_SHA256.inventory ||
  review?.parentVisualQa?.sha256 !== AUTHORITY_SHA256.parentQa ||
  review?.routeAssignmentAuthorized !== true ||
  review?.derivativeReleaseAuthorized !== true ||
  review?.assets?.length !== EXPECTED.totalAssets ||
  review?.counts?.approved !== EXPECTED.totalAssets ||
  review?.counts?.rejected !== 0 ||
  review?.counts?.replacementsApproved !== EXPECTED.replacementAssets ||
  review?.homeHeroFrozen?.sha256 !== HOME_HERO_SHA256
) {
  fail("AUTHORITY_CONTRACT");
}

const replacementSet = new Set(campaign.replacementPolicy.exactAssetIds);
if (
  replacementSet.size !== REPLACEMENT_IDS.size ||
  [...REPLACEMENT_IDS].some((assetId) => !replacementSet.has(assetId))
) {
  fail("REPLACEMENT_SET");
}
const homeHero = await readFile(path.join(ROOT, HOME_HERO_RELATIVE)).catch(() => fail("HOME_HERO:MISSING"));
if (sha256(homeHero) !== HOME_HERO_SHA256) fail("HOME_HERO:CHANGED");

for (const sheet of review.contactSheets ?? []) {
  const bytes = await readFile(path.join(ROOT, sheet.relativePath)).catch(() => fail(`CONTACT_SHEET:MISSING:${sheet.relativePath}`));
  if (sha256(bytes) !== sheet.sha256) fail(`CONTACT_SHEET:SHA256:${sheet.relativePath}`);
}
if ((review.contactSheets ?? []).length !== 15) fail("CONTACT_SHEET:COUNT");

const jobsById = new Map(campaign.jobs.map((job) => [job.assetId, job]));
const inventoryById = new Map(inventory.entries.map((entry) => [entry.assetId, entry]));
const parentQaById = new Map(parentQa.assets.map((entry) => [entry.assetId, entry]));
const reviewById = new Map(review.assets.map((entry) => [entry.assetId, entry]));
const campaignIds = new Set(jobsById.keys());
if (
  jobsById.size !== EXPECTED.totalAssets ||
  inventoryById.size !== EXPECTED.totalAssets ||
  parentQaById.size !== EXPECTED.totalAssets ||
  reviewById.size !== EXPECTED.totalAssets ||
  !exactSet(campaignIds, new Set(inventoryById.keys())) ||
  !exactSet(campaignIds, new Set(parentQaById.keys())) ||
  !exactSet(campaignIds, new Set(reviewById.keys()))
) {
  fail("APPROVED_ASSET_SET");
}

for (const job of campaign.jobs) {
  const inventoryEntry = inventoryById.get(job.assetId);
  const parentQaEntry = parentQaById.get(job.assetId);
  const reviewEntry = reviewById.get(job.assetId);
  if (
    !inventoryEntry ||
    inventoryEntry.sourcePath !== job.sourceRelative ||
    inventoryEntry.sha256 !== job.sourceSha256 ||
    inventoryEntry.width !== job.width ||
    inventoryEntry.height !== job.height ||
    parentQaEntry?.sourceSha256 !== job.sourceSha256 ||
    reviewEntry?.sourceSha256 !== job.sourceSha256 ||
    !validateReviewCriteria(parentQaEntry) ||
    !validateReviewCriteria(reviewEntry)
  ) {
    fail(`APPROVED_ASSET:${job.assetId}`);
  }
  const source = await readFile(path.join(ROOT, job.sourceRelative)).catch(() => fail(`SOURCE:MISSING:${job.assetId}`));
  if (sha256(source) !== job.sourceSha256) fail(`SOURCE:SHA256:${job.assetId}`);
  const metadata = await sharp(source, { failOn: "error" }).metadata();
  if (metadata.width !== job.width || metadata.height !== job.height || metadata.format !== inventoryEntry.format) {
    fail(`SOURCE:METADATA:${job.assetId}`);
  }
}

const regionalJobs = campaign.jobs.filter((job) => job.jobClass === "regional");
const editorialJobs = campaign.jobs.filter((job) => job.jobClass === "editorial");
if (regionalJobs.length !== EXPECTED.regionalAssets || editorialJobs.length !== EXPECTED.editorialAssets) {
  fail("JOB_CLASS_COUNTS");
}

const oldCampaignDoc = await readJson(OLD_CAMPAIGN_RELATIVE, OLD_CAMPAIGN_SHA256, "OLD_CAMPAIGN");
const oldJobsById = new Map(oldCampaignDoc.value.jobs.map((job) => [job.assetId, job]));
const currentProvenance = new Map();
for (const job of regionalJobs) {
  const oldJob = oldJobsById.get(job.assetId);
  if (!oldJob) fail(`OLD_CAMPAIGN:JOB:${job.assetId}`);
  const provenanceRelative = `${REGIONAL_PUBLIC_ROOT}/${job.assetId}/provenance.json`;
  const provenanceBytes = await readFile(path.join(ROOT, provenanceRelative))
    .catch(() => fail(`PREIMAGE_PROVENANCE:MISSING:${job.assetId}`));
  let provenance;
  try {
    provenance = JSON.parse(provenanceBytes.toString("utf8"));
  } catch {
    fail(`PREIMAGE_PROVENANCE:JSON:${job.assetId}`);
  }
  const authorityCampaignSha = provenance?.authority?.campaign?.sha256;
  const isOld = authorityCampaignSha === OLD_CAMPAIGN_SHA256;
  const isCurrent = authorityCampaignSha === campaignDoc.sha256;
  const expectedSourceSha = isOld ? oldJob.sourceSha256 : job.sourceSha256;
  if ((!isOld && !isCurrent) || provenance?.source?.sha256 !== expectedSourceSha) {
    fail(`PREIMAGE_PROVENANCE:AUTHORITY:${job.assetId}`);
  }
  for (const profile of Object.keys(PROFILES)) {
    const output = provenance?.outputs?.[profile];
    const expectedPath = `/${REGIONAL_PUBLIC_ROOT.replace(/^public\//u, "")}/${job.assetId}/${profile}.webp`;
    if (output?.publicPath !== expectedPath || typeof output?.sha256 !== "string") {
      fail(`PREIMAGE_PROVENANCE:OUTPUT:${job.assetId}:${profile}`);
    }
    const outputRelative = `${REGIONAL_PUBLIC_ROOT}/${job.assetId}/${profile}.webp`;
    const outputBytes = await readFile(path.join(ROOT, outputRelative))
      .catch(() => fail(`PREIMAGE_OUTPUT:MISSING:${job.assetId}:${profile}`));
    if (sha256(outputBytes) !== output.sha256) fail(`PREIMAGE_OUTPUT:SHA256:${job.assetId}:${profile}`);
  }
  currentProvenance.set(job.assetId, {
    bytes: provenanceBytes,
    sha256: sha256(provenanceBytes),
    value: provenance,
    authority: isOld ? "v1" : "v2",
  });
}

if (
  focal?.schemaVersion !== "honhyeol-massage-template4-regional-focal-points/v1" ||
  focal?.status !== "ROOT_REVIEW_BOUND_RELEASE_CONFIG" ||
  focal?.platformKey !== "honhyeol-massage" ||
  focal?.profile !== "mobile" ||
  focal?.coordinateScale !== 1000 ||
  focal?.derivative?.width !== PROFILES.mobile.width ||
  focal?.derivative?.height !== PROFILES.mobile.height ||
  focal?.derivative?.fit !== "cover" ||
  focal?.defaultFocalPoint?.xPermille !== 500 ||
  focal?.defaultFocalPoint?.yPermille !== 500 ||
  !Array.isArray(focal.overrides)
) {
  fail("FOCAL:CONTRACT");
}
assertNoLegacyIdentity(focal, "FOCAL");
const regionalIds = new Set(regionalJobs.map((job) => job.assetId));
const focalOverrides = new Map();
for (const entry of focal.overrides) {
  if (
    !regionalIds.has(entry.assetId) ||
    focalOverrides.has(entry.assetId) ||
    !Number.isInteger(entry.xPermille) ||
    !Number.isInteger(entry.yPermille) ||
    entry.xPermille < 0 || entry.xPermille > 1000 ||
    entry.yPermille < 0 || entry.yPermille > 1000
  ) {
    fail(`FOCAL:OVERRIDE:${entry.assetId}`);
  }
  focalOverrides.set(entry.assetId, { xPermille: entry.xPermille, yPermille: entry.yPermille });
}

const regionalRelease = new Map();
for (const job of regionalJobs) {
  const inventoryEntry = inventoryById.get(job.assetId);
  const source = await readFile(path.join(ROOT, job.sourceRelative));
  const focalPoint = focalOverrides.get(job.assetId) ?? focal.defaultFocalPoint;
  const outputs = {};

  for (const [profile, dimensions] of Object.entries(PROFILES)) {
    const relativePath = `${REGIONAL_PUBLIC_ROOT}/${job.assetId}/${profile}.webp`;
    let pipeline = sharp(source, { failOn: "error" });
    let crop;
    if (profile === "mobile") {
      crop = calculateFocalCoverExtraction({
        sourceWidth: inventoryEntry.width,
        sourceHeight: inventoryEntry.height,
        targetWidth: dimensions.width,
        targetHeight: dimensions.height,
        ...focalPoint,
      });
      pipeline = pipeline
        .extract(crop)
        .resize(dimensions.width, dimensions.height, { fit: "fill" });
    } else {
      pipeline = pipeline.resize(dimensions.width, dimensions.height, {
        fit: "cover",
        position: "centre",
      });
    }
    const result = await pipeline
      .webp({ quality: 86, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    if (result.info.width !== dimensions.width || result.info.height !== dimensions.height || result.info.format !== "webp") {
      fail(`DERIVATIVE:METADATA:${job.assetId}:${profile}`);
    }
    const existingOutputSha256 = currentProvenance.get(job.assetId).value.outputs[profile].sha256;
    if (REPLACEMENT_IDS.has(job.assetId)) {
      await writeAuthorizedReplacement(relativePath, result.data, existingOutputSha256);
    } else {
      await writeNewOrExact(relativePath, result.data);
    }
    outputs[profile] = {
      publicPath: publicPath(relativePath),
      sha256: sha256(result.data),
      width: result.info.width,
      height: result.info.height,
      bytes: result.data.length,
      crop: profile === "mobile"
        ? { mode: "asset-focal-cover", focalPoint, extraction: crop }
        : { mode: "center-cover" },
    };
  }

  const provenanceRelative = `${REGIONAL_PUBLIC_ROOT}/${job.assetId}/provenance.json`;
  const provenance = {
    schemaVersion: "honhyeol-massage-template4-regional-image-provenance/v1",
    status: "ROOT_APPROVED_RELEASED",
    platformKey: "honhyeol-massage",
    assetId: job.assetId,
    sourceClass: job.sourceClass,
    styling: job.styling,
    lane: job.lane,
    authority: {
      campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignDoc.sha256 },
      inventory: { relativePath: INVENTORY_RELATIVE, sha256: inventoryDoc.sha256 },
      parentVisualQa: { relativePath: PARENT_QA_RELATIVE, sha256: parentQaDoc.sha256 },
      rootReview: { relativePath: REVIEW_RELATIVE, sha256: reviewDoc.sha256, reviewer: "root" },
    },
    focalCropMetadata: { relativePath: FOCAL_RELATIVE, sha256: focalSha256, focalPoint },
    source: {
      relativePath: job.sourceRelative,
      sha256: job.sourceSha256,
      width: job.width,
      height: job.height,
      format: inventoryEntry.format,
    },
    outputs,
  };
  assertNoLegacyIdentity(provenance, `PROVENANCE:${job.assetId}`);
  await writeAuthorizedReplacement(
    provenanceRelative,
    jsonBytes(provenance),
    currentProvenance.get(job.assetId).sha256,
  );
  regionalRelease.set(job.assetId, { outputs, provenanceRelative });
}

if (regionalRelease.size !== EXPECTED.regionalAssets || ACTIVE_REGION_NODES.length !== EXPECTED.routes) {
  fail("REGIONAL_RELEASE_COUNTS");
}

const routes = {};
const usage = new Map([...regionalRelease.keys()].map((assetId) => [assetId, 0]));
for (const node of ACTIVE_REGION_NODES) {
  const assetId = getRegionalImageAssetId(node);
  const released = regionalRelease.get(assetId);
  if (!released) fail(`ROUTE:UNRELEASED_ASSET:${node.path}`);
  usage.set(assetId, (usage.get(assetId) ?? 0) + 1);
  routes[node.path] = {
    assetId,
    sources: Object.fromEntries(
      Object.entries(released.outputs).map(([profile, output]) => [profile, output.publicPath]),
    ),
    provenance: publicPath(released.provenanceRelative),
  };
}

let parentChildCollisions = 0;
let siblingCollisions = 0;
for (const node of ACTIVE_REGION_NODES) {
  const parent = getParentNode(node);
  if (parent && routes[parent.path]?.assetId === routes[node.path]?.assetId) parentChildCollisions += 1;
  const childAssets = getDirectChildren(node).map((child) => routes[child.path]?.assetId);
  siblingCollisions += childAssets.length - new Set(childAssets).size;
}
const usageCounts = [...usage.values()].sort((left, right) => left - right);
const assetsAtNine = usageCounts.filter((count) => count === 9).length;
const assetsAtTen = usageCounts.filter((count) => count === 10).length;
if (
  Object.keys(routes).length !== EXPECTED.routes ||
  usageCounts.length !== EXPECTED.regionalAssets ||
  usageCounts.at(-1) !== 10 ||
  assetsAtNine !== 9 ||
  assetsAtTen !== 121 ||
  parentChildCollisions !== 0 ||
  siblingCollisions !== 0
) {
  fail("ROUTE:DISTRIBUTION");
}

const distribution = {
  routes: EXPECTED.routes,
  assets: EXPECTED.regionalAssets,
  maxReuse: 10,
  assetsAtTen,
  assetsAtNine,
  parentChildCollisions,
  siblingCollisions,
};
const manifest = {
  schemaVersion: "honhyeol-massage-regional-image-assignments/v1",
  status: "ROOT_APPROVED_RELEASED",
  platformKey: "honhyeol-massage",
  authority: {
    campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignDoc.sha256 },
    inventory: { relativePath: INVENTORY_RELATIVE, sha256: inventoryDoc.sha256 },
    parentVisualQa: { relativePath: PARENT_QA_RELATIVE, sha256: parentQaDoc.sha256 },
    rootReview: { relativePath: REVIEW_RELATIVE, sha256: reviewDoc.sha256, reviewer: "root" },
  },
  derivativeProfiles: PROFILES,
  focalCropMetadata: {
    relativePath: FOCAL_RELATIVE,
    sha256: focalSha256,
    overrideAssets: focalOverrides.size,
  },
  distribution,
  routes,
};
assertNoLegacyIdentity(manifest, "ASSIGNMENT_MANIFEST");
const manifestBytes = jsonBytes(manifest);
await writeAssignmentManifest(manifestBytes, campaignDoc.sha256);

const regionalReceipt = {
  schemaVersion: "honhyeol-massage-template4-regional-image-release-receipt/v2",
  status: "ROOT_APPROVED_RELEASED",
  platformKey: "honhyeol-massage",
  assignmentManifest: { relativePath: MANIFEST_RELATIVE, sha256: sha256(manifestBytes) },
  authority: manifest.authority,
  focalCropMetadata: manifest.focalCropMetadata,
  distribution,
  releasedFiles: {
    webp: EXPECTED.regionalAssets * Object.keys(PROFILES).length,
    provenance: EXPECTED.regionalAssets,
  },
  replacementRelease: {
    assetIds: [...REPLACEMENT_IDS].sort(),
    assets: REPLACEMENT_IDS.size,
    homeHeroFrozen: { relativePath: HOME_HERO_RELATIVE, sha256: HOME_HERO_SHA256 },
  },
  sourceAssets: regionalJobs.map((job) => ({
    assetId: job.assetId,
    sourceSha256: job.sourceSha256,
    provenance: regionalRelease.get(job.assetId).provenanceRelative,
  })),
};
assertNoLegacyIdentity(regionalReceipt, "REGIONAL_RECEIPT");
await writeNewOrExact(REGIONAL_RECEIPT_RELATIVE, jsonBytes(regionalReceipt));

const editorialReceiptBytes = await readFile(path.join(ROOT, EDITORIAL_RECEIPT_RELATIVE))
  .catch(() => fail("EDITORIAL_RECEIPT:MISSING"));
let editorialReceipt;
try {
  editorialReceipt = JSON.parse(editorialReceiptBytes.toString("utf8"));
} catch {
  fail("EDITORIAL_RECEIPT:JSON");
}
if (
  editorialReceipt?.schemaVersion !== "honhyeol-massage-template4-editorial-image-release-receipt/v1" ||
  editorialReceipt?.status !== "ROOT_APPROVED_RELEASED" ||
  editorialReceipt?.outputs?.length !== EXPECTED.editorialAssets
) {
  fail("EDITORIAL_RECEIPT:CONTRACT");
}
for (const output of editorialReceipt.outputs) {
  const bytes = await readFile(path.join(ROOT, output.output.relativePath))
    .catch(() => fail(`EDITORIAL:FROZEN_MISSING:${output.assetId}`));
  if (sha256(bytes) !== output.output.sha256) fail(`EDITORIAL:FROZEN_SHA256:${output.assetId}`);
}

console.log(JSON.stringify({
  status: "ROOT_APPROVED_RELEASED",
  authority: AUTHORITY_SHA256,
  regional: {
    assets: EXPECTED.regionalAssets,
    webp: EXPECTED.regionalAssets * Object.keys(PROFILES).length,
    provenance: EXPECTED.regionalAssets,
    routes: EXPECTED.routes,
    distribution,
    manifestSha256: sha256(manifestBytes),
  },
  editorial: {
    assets: EXPECTED.editorialAssets,
    webp: EXPECTED.editorialAssets,
    status: "FROZEN_UNCHANGED_FROM_V1",
  },
}, null, 2));
