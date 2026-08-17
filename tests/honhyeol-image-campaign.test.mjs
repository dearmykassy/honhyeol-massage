import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  ACTIVE_REGION_NODES,
  getDirectChildren,
  getParentNode,
} from "../src/lib/regions.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/campaign.v2.json";
const INVENTORY = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-02/inventory.v2.json";
const PARENT_QA = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-02/parent-visual-qa.v2.json";
const REVIEW = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/contact-sheets/round-02/review.v2.json";
const REUSE = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1/reuse-provenance.v2.json";
const FOCAL = "src/data/regional-image-focal-points.template4.json";
const MANIFEST = "src/data/regional-image-assignments.template4.generated.json";
const REGIONAL_RECEIPT = "artifacts/image-release/honhyeol-massage-template4-regional-release.v2.json";
const EDITORIAL_RECEIPT = "artifacts/image-release/honhyeol-massage-template4-editorial-release.v1.json";
const REGIONAL_PUBLIC_ROOT = "public/assets/honhyeol-massage/template4-regional";

const AUTHORITY = {
  campaign: "faebb1fafc00e21f7fa68631d5aa0ff8a78beb70810d3a15d9c850a533442e1d",
  inventory: "6c47178bd2115a268394f4b6f2aa7545d4a1cbed4b4d71892420f26664d501ce",
  parentQa: "3d5f8e8c91afbe1e9b786606954650de7e328148dae5a59ef19208e08eb34ab4",
  review: "92ed8e09051bac486ecd2b5cbe6648606aea74b6dd8ad73f826ce12afbb08b00",
};
const HOME_HERO = "public/images/honhyeol-template4/home/hero-mirror.webp";
const HOME_HERO_SHA256 = "a9b0f185a3d91925cb3ab8740e27c7f14f9a0dcac86e8638f98613c325915573";
const REPLACEMENT_IDS = new Set([
  "hym-t4-rgn-044-v1",
  ...Array.from({ length: 65 }, (_, index) => `hym-t4-rgn-${String(index + 66).padStart(3, "0")}-v1`),
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

async function fileSha(relativePath) {
  return sha256(await readFile(path.join(ROOT, relativePath)));
}

describe("혼혈마사지 Template4 image release", () => {
  it("binds the exact 148 approved assets and 66 Korean-art-direction replacements to immutable review authority", async () => {
    expect(await fileSha(CAMPAIGN)).toBe(AUTHORITY.campaign);
    expect(await fileSha(INVENTORY)).toBe(AUTHORITY.inventory);
    expect(await fileSha(PARENT_QA)).toBe(AUTHORITY.parentQa);
    expect(await fileSha(REVIEW)).toBe(AUTHORITY.review);

    const [campaign, inventory, parentQa, review, reuse] = await Promise.all([
      readJson(CAMPAIGN),
      readJson(INVENTORY),
      readJson(PARENT_QA),
      readJson(REVIEW),
      readJson(REUSE),
    ]);
    expect(campaign.counts).toEqual({
      totalPhotographs: 148,
      regional: 130,
      editorial: 18,
      reused: 73,
      new: 9,
      replacementNew: 66,
    });
    expect(campaign.schemaVersion).toBe("honhyeol-template4-mirror-selfie-campaign/v2");
    expect(campaign.platform.template).toBe("Template5");
    expect(campaign.platform.assetNamespaceTemplate).toBe("Template4");
    expect(new Set(campaign.jobs.map((job) => job.assetId)).size).toBe(148);
    expect(campaign.jobs.filter((job) => job.jobClass === "regional")).toHaveLength(130);
    expect(campaign.jobs.filter((job) => job.jobClass === "editorial")).toHaveLength(18);
    expect(campaign.jobs.filter((job) => job.sourceClass === "reused")).toHaveLength(73);
    expect(campaign.jobs.filter((job) => job.sourceClass === "new")).toHaveLength(9);
    expect(campaign.jobs.filter((job) => job.sourceClass === "replacement-new")).toHaveLength(66);
    expect(new Set(campaign.replacementPolicy.exactAssetIds)).toEqual(REPLACEMENT_IDS);
    expect(campaign.replacementPolicy.actualNationalityOrAncestryInference).toBe(false);
    expect(campaign.replacementPolicy.homeHeroFrozen).toEqual({
      relativePath: HOME_HERO,
      sha256: HOME_HERO_SHA256,
    });
    expect(inventory.entries).toHaveLength(148);
    expect(new Set(inventory.entries.map((entry) => entry.sha256)).size).toBe(148);
    expect(parentQa.assets).toHaveLength(148);
    expect(parentQa.assets.every((entry) => entry.decision === "ACCEPT")).toBe(true);
    expect(review.assets).toHaveLength(148);
    expect(review.assets.every((entry) => entry.decision === "ACCEPT")).toBe(true);
    expect(review.counts).toEqual({ approved: 148, rejected: 0, replacementsApproved: 66 });
    expect(review.routeAssignmentAuthorized).toBe(true);
    expect(review.derivativeReleaseAuthorized).toBe(true);
    expect(review.homeHeroFrozen.sha256).toBe(HOME_HERO_SHA256);
    expect(await fileSha(HOME_HERO)).toBe(HOME_HERO_SHA256);
    expect(reuse.counts).toEqual({ total: 74, regional: 65, editorial: 9 });
    expect(reuse.sourceDistribution).toEqual({ "feeling-hometai": 36, "geonmae-banhada": 38 });
  });

  it("releases 390 regional derivatives, 130 provenance files and collision-free 1,291-route assignments", async () => {
    const [manifest, focal, receipt] = await Promise.all([
      readJson(MANIFEST),
      readJson(FOCAL),
      readJson(REGIONAL_RECEIPT),
    ]);
    expect(manifest.schemaVersion).toBe("honhyeol-massage-regional-image-assignments/v1");
    expect(manifest.platformKey).toBe("honhyeol-massage");
    expect(manifest.status).toBe("ROOT_APPROVED_RELEASED");
    expect(manifest.distribution).toEqual({
      routes: 1291,
      assets: 130,
      maxReuse: 10,
      assetsAtTen: 121,
      assetsAtNine: 9,
      parentChildCollisions: 0,
      siblingCollisions: 0,
    });
    expect(Object.keys(manifest.routes)).toHaveLength(1291);
    expect(focal.schemaVersion).toBe("honhyeol-massage-template4-regional-focal-points/v1");
    expect(focal.platformKey).toBe("honhyeol-massage");
    expect(focal.overrides).toHaveLength(6);
    expect(receipt.schemaVersion).toBe("honhyeol-massage-template4-regional-image-release-receipt/v2");
    expect(receipt.releasedFiles).toEqual({ webp: 390, provenance: 130 });
    expect(receipt.assignmentManifest.sha256).toBe(await fileSha(MANIFEST));
    expect(new Set(receipt.replacementRelease.assetIds)).toEqual(REPLACEMENT_IDS);
    expect(receipt.replacementRelease.assets).toBe(66);
    expect(receipt.replacementRelease.homeHeroFrozen.sha256).toBe(HOME_HERO_SHA256);

    const usage = new Map();
    for (const node of ACTIVE_REGION_NODES) {
      const assignment = manifest.routes[node.path];
      expect(assignment).toBeTruthy();
      expect(assignment.assetId).toMatch(/^hym-t4-rgn-\d{3}-v1$/u);
      usage.set(assignment.assetId, (usage.get(assignment.assetId) ?? 0) + 1);
      const parent = getParentNode(node);
      if (parent) expect(manifest.routes[parent.path].assetId).not.toBe(assignment.assetId);
      const childAssets = getDirectChildren(node).map((child) => manifest.routes[child.path].assetId);
      expect(new Set(childAssets).size).toBe(childAssets.length);
    }
    expect(usage.size).toBe(130);
    expect([...usage.values()].filter((count) => count === 10)).toHaveLength(121);
    expect([...usage.values()].filter((count) => count === 9)).toHaveLength(9);

    const assetDirectories = (await readdir(path.join(ROOT, REGIONAL_PUBLIC_ROOT), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(assetDirectories).toHaveLength(130);
    let webpCount = 0;
    for (const assetId of assetDirectories) {
      const files = (await readdir(path.join(ROOT, REGIONAL_PUBLIC_ROOT, assetId))).sort();
      expect(files).toEqual(["desktop.webp", "mobile.webp", "provenance.json", "tablet.webp"]);
      const provenance = await readJson(`${REGIONAL_PUBLIC_ROOT}/${assetId}/provenance.json`);
      expect(provenance.platformKey).toBe("honhyeol-massage");
      for (const [profile, expected] of Object.entries({
        desktop: [1600, 900],
        tablet: [1200, 675],
        mobile: [768, 600],
      })) {
        const relative = `${REGIONAL_PUBLIC_ROOT}/${assetId}/${profile}.webp`;
        const bytes = await readFile(path.join(ROOT, relative));
        const metadata = await sharp(bytes).metadata();
        expect([metadata.width, metadata.height, metadata.format]).toEqual([...expected, "webp"]);
        expect(provenance.outputs[profile].sha256).toBe(sha256(bytes));
        webpCount += 1;
      }
    }
    expect(webpCount).toBe(390);
  });

  it("releases the 18 campaign-declared editorial WebPs without active legacy identity", async () => {
    const [campaign, editorialReceipt, manifest, focal, regionalReceipt] = await Promise.all([
      readJson(CAMPAIGN),
      readJson(EDITORIAL_RECEIPT),
      readJson(MANIFEST),
      readJson(FOCAL),
      readJson(REGIONAL_RECEIPT),
    ]);
    const editorialJobs = campaign.jobs.filter((job) => job.jobClass === "editorial");
    expect(editorialReceipt.outputs).toHaveLength(18);
    expect(editorialReceipt.releasedFiles).toEqual({ webp: 18 });
    const receiptById = new Map(editorialReceipt.outputs.map((entry) => [entry.assetId, entry]));
    for (const job of editorialJobs) {
      const receiptEntry = receiptById.get(job.assetId);
      expect(receiptEntry.output.relativePath).toBe(job.activeOutput);
      const bytes = await readFile(path.join(ROOT, job.activeOutput));
      const metadata = await sharp(bytes).metadata();
      expect([metadata.width, metadata.height, metadata.format]).toEqual([job.width, job.height, "webp"]);
      expect(receiptEntry.output.sha256).toBe(sha256(bytes));
    }

    const releasedText = JSON.stringify({ manifest, focal, regionalReceipt, editorialReceipt });
    expect(releasedText).not.toMatch(/geonmae-banhada|geonma-template4|gmb-t4/u);
  });
});
