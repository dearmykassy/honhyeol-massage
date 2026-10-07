#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const LEDGER_FILE = path.join(ROOT, "src/data/dong-duplicate-pages.generated.json");
const DEPLOY_RECEIPT_FILE = path.join(
  ROOT,
  "artifacts/honhyul-dong-duplicates-20261007/netlify-preserving-base-deploy.json",
);
const LIVE_RECEIPT_FILE = path.join(
  ROOT,
  "artifacts/honhyul-dong-duplicates-20261007/live-release-verification.json",
);
const SITE_ID = "1fce086f-77dd-4acc-abab-72ceec2b1f4a";
const STABLE_ORIGIN = "https://honhyul.kr";
const BASE_ORIGIN = "https://6a84a13d8ec0be000836b3bd--honhyul.netlify.app";
const EXPECTED_BASE_FILES = 7_087;
const EXPECTED_DUPLICATES = 4_565;
const EXPECTED_FINAL_FILES = 11_652;
const execFileAsync = promisify(execFile);

function sha1(bytes) {
  return createHash("sha1").update(bytes).digest("hex");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizedRouteFile(route) {
  return `${decodeURIComponent(route).replace(/^\/+|\/+$/gu, "")}/index.html`;
}

function manifestDigest(manifest) {
  return sha256(Buffer.from(JSON.stringify(
    [...manifest.entries()].sort(([left], [right]) => left.localeCompare(right)),
  )));
}

function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
}

function rssLinks(xml) {
  return [...xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/gu)].map((match) => match[1]);
}

async function fetchBytes(url, userAgent = "Mozilla/5.0") {
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "cache-control": "no-cache", "user-agent": userAgent },
  });
  if (response.status !== 200) throw new Error(`LIVE_STATUS_${response.status}:${url}`);
  return Buffer.from(await response.arrayBuffer());
}

const [ledgerBytes, deployReceiptBytes, siteOutput, filesOutput, oldSitemap, oldRss] = await Promise.all([
  readFile(LEDGER_FILE),
  readFile(DEPLOY_RECEIPT_FILE),
  execFileAsync("netlify", ["api", "getSite", "--data", JSON.stringify({ site_id: SITE_ID })], {
    maxBuffer: 32 * 1024 * 1024,
  }),
  execFileAsync("netlify", ["api", "listSiteFiles", "--data", JSON.stringify({ site_id: SITE_ID })], {
    maxBuffer: 32 * 1024 * 1024,
  }),
  fetchBytes(`${BASE_ORIGIN}/sitemap.xml`),
  fetchBytes(`${BASE_ORIGIN}/rss.xml`),
]);
const ledger = JSON.parse(ledgerBytes);
const deployReceipt = JSON.parse(deployReceiptBytes);
const site = JSON.parse(siteOutput.stdout);
const providerFiles = JSON.parse(filesOutput.stdout);

if (deployReceipt.deploymentStatus !== "READY") throw new Error("DEPLOY_RECEIPT_NOT_READY");
if (site.published_deploy?.id !== deployReceipt.deployId) {
  throw new Error(`LIVE_DEPLOY_ID_MISMATCH:${site.published_deploy?.id}`);
}
if (providerFiles.length !== EXPECTED_FINAL_FILES) throw new Error(`LIVE_FILE_COUNT:${providerFiles.length}`);
if (providerFiles.some((file) => file.deploy_id !== deployReceipt.deployId)) {
  throw new Error("LIVE_FILE_DEPLOY_PROVENANCE_MISMATCH");
}
if (ledger.records.length !== EXPECTED_DUPLICATES) throw new Error("LEDGER_COUNT_MISMATCH");

const providerManifest = new Map(providerFiles.map((file) => [file.path.replace(/^\//u, ""), file.sha]));
if (manifestDigest(providerManifest) !== deployReceipt.finalManifestDigest) {
  throw new Error("FINAL_MANIFEST_DIGEST_MISMATCH");
}

for (const record of ledger.records) {
  const deployPath = normalizedRouteFile(record.route);
  const localBytes = await readFile(path.join(OUT, deployPath));
  if (providerManifest.get(deployPath) !== sha1(localBytes)) {
    throw new Error(`DUPLICATE_PROVIDER_SHA_MISMATCH:${deployPath}`);
  }
}
for (const deployPath of ["sitemap.xml", "rss.xml"]) {
  const localBytes = await readFile(path.join(OUT, deployPath));
  if (providerManifest.get(deployPath) !== sha1(localBytes)) {
    throw new Error(`XML_PROVIDER_SHA_MISMATCH:${deployPath}`);
  }
}

const reconstructedBase = new Map(providerManifest);
for (const record of ledger.records) reconstructedBase.delete(normalizedRouteFile(record.route));
reconstructedBase.set("sitemap.xml", sha1(oldSitemap));
reconstructedBase.set("rss.xml", sha1(oldRss));
if (reconstructedBase.size !== EXPECTED_BASE_FILES) {
  throw new Error(`RECONSTRUCTED_BASE_FILE_COUNT:${reconstructedBase.size}`);
}
if (manifestDigest(reconstructedBase) !== deployReceipt.baseManifestDigest) {
  throw new Error("BASE_MANIFEST_NOT_PRESERVED");
}

const [liveSitemap, liveRss, localSitemap, localRss] = await Promise.all([
  fetchBytes(`${STABLE_ORIGIN}/sitemap.xml`),
  fetchBytes(`${STABLE_ORIGIN}/rss.xml`),
  readFile(path.join(OUT, "sitemap.xml")),
  readFile(path.join(OUT, "rss.xml")),
]);
if (!liveSitemap.equals(localSitemap)) throw new Error("LIVE_SITEMAP_BYTES_MISMATCH");
if (!liveRss.equals(localRss)) throw new Error("LIVE_RSS_BYTES_MISMATCH");

const sitemap = liveSitemap.toString("utf8");
const rss = liveRss.toString("utf8");
const sitemapSet = new Set(sitemapUrls(sitemap));
const rssSet = new Set(rssLinks(rss));
if (sitemapSet.size !== 5_864) throw new Error(`LIVE_SITEMAP_COUNT:${sitemapSet.size}`);
if (rssSet.size !== 4_567) throw new Error(`LIVE_RSS_COUNT:${rssSet.size}`);
for (const record of ledger.records) {
  if (!sitemapSet.has(record.canonical)) throw new Error(`SITEMAP_MISSING:${record.canonical}`);
  if (!rssSet.has(record.canonical)) throw new Error(`RSS_MISSING:${record.canonical}`);
}

const sampleIndices = [...new Set(Array.from({ length: 30 }, (_, index) => (
  Math.floor((index * (ledger.records.length - 1)) / 29)
)))];
const sampleResults = [];
for (const index of sampleIndices) {
  const record = ledger.records[index];
  const localBytes = await readFile(path.join(OUT, normalizedRouteFile(record.route)));
  const [ordinary, yeti] = await Promise.all([
    fetchBytes(record.canonical),
    fetchBytes(record.canonical, "Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/spd)"),
  ]);
  if (!ordinary.equals(localBytes) || !yeti.equals(localBytes)) {
    throw new Error(`LIVE_DUPLICATE_BYTES_MISMATCH:${record.route}`);
  }
  sampleResults.push({ index, route: record.route, sha256: sha256(localBytes) });
}

const oldSitemapPaths = sitemapUrls(oldSitemap.toString("utf8")).map((url) => new URL(url).pathname);
const oldSamplePaths = [...new Set(Array.from({ length: 20 }, (_, index) => (
  oldSitemapPaths[Math.floor((index * (oldSitemapPaths.length - 1)) / 19)]
)))];
for (const pathname of oldSamplePaths) {
  const [before, after] = await Promise.all([
    fetchBytes(new URL(pathname, BASE_ORIGIN).href),
    fetchBytes(new URL(pathname, STABLE_ORIGIN).href),
  ]);
  if (!before.equals(after)) throw new Error(`LIVE_BASE_PAGE_CHANGED:${pathname}`);
}

const receipt = {
  schemaVersion: "honhyul-dong-duplicate-live-release-verification/v1",
  status: "PASS",
  siteId: SITE_ID,
  deployId: deployReceipt.deployId,
  stableOrigin: STABLE_ORIGIN,
  baseDeployId: deployReceipt.baseDeployId,
  providerFiles: providerFiles.length,
  finalManifestDigest: manifestDigest(providerManifest),
  reconstructedBaseFiles: reconstructedBase.size,
  reconstructedBaseManifestDigest: manifestDigest(reconstructedBase),
  duplicatePages: ledger.records.length,
  sitemapUrls: sitemapSet.size,
  rssItems: rssSet.size,
  ordinaryAndYetiSamples: sampleResults,
  unchangedBasePageSamples: oldSamplePaths,
  checkedAt: new Date().toISOString(),
};
await mkdir(path.dirname(LIVE_RECEIPT_FILE), { recursive: true });
await writeFile(LIVE_RECEIPT_FILE, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({
  status: receipt.status,
  deployId: receipt.deployId,
  providerFiles: receipt.providerFiles,
  reconstructedBaseFiles: receipt.reconstructedBaseFiles,
  duplicatePages: receipt.duplicatePages,
  sitemapUrls: receipt.sitemapUrls,
  rssItems: receipt.rssItems,
  ordinaryAndYetiSamples: receipt.ordinaryAndYetiSamples.length,
  unchangedBasePageSamples: receipt.unchangedBasePageSamples.length,
}, null, 2)}\n`);
