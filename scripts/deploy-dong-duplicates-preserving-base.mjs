#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const LEDGER_FILE = path.join(ROOT, "src/data/dong-duplicate-pages.generated.json");
const RECEIPT_FILE = path.join(
  ROOT,
  "artifacts/honhyul-dong-duplicates-20261007/netlify-preserving-base-deploy.json",
);
const SITE_ID = "1fce086f-77dd-4acc-abab-72ceec2b1f4a";
const BASE_DEPLOY_ID = "6a84a13d8ec0be000836b3bd";
const EXPECTED_BASE_FILE_COUNT = 7_087;
const EXPECTED_DUPLICATE_COUNT = 4_565;
const publish = process.argv.includes("--publish");
const resumeArgument = process.argv.find((argument) => argument.startsWith("--resume-deploy="));
const resumeDeployId = resumeArgument?.slice("--resume-deploy=".length) || null;
if (resumeDeployId && !/^[a-f\d]{24}$/u.test(resumeDeployId)) throw new Error("RESUME_DEPLOY_ID_INVALID");

function sha1(bytes) {
  return createHash("sha1").update(bytes).digest("hex");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizedRouteFile(route) {
  const decoded = decodeURIComponent(route).replace(/^\/+|\/+$/gu, "");
  return `${decoded}/index.html`;
}

async function readNetlifyToken() {
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN;
  const configPath = path.join(os.homedir(), "Library/Preferences/netlify/config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const token = config.users?.[config.userId]?.auth?.token;
  if (typeof token !== "string" || token.length < 20) throw new Error("NETLIFY_AUTH_TOKEN_UNAVAILABLE");
  return token;
}

const token = await readNetlifyToken();

async function api(apiPath, options = {}) {
  const response = await fetch(`https://api.netlify.com/api/v1${apiPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.body && !(options.body instanceof Uint8Array)
        ? { "Content-Type": "application/json" }
        : { "Content-Type": "application/octet-stream" }),
      ...(options.headers || {}),
    },
    body: options.body && !(options.body instanceof Uint8Array)
      ? JSON.stringify(options.body)
      : options.body,
  });
  if (!response.ok) {
    const message = (await response.text()).slice(0, 1_000);
    throw new Error(`NETLIFY_API_${response.status}:${message}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function pool(items, concurrency, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

const [site, baseFiles, ledgerBytes] = await Promise.all([
  api(`/sites/${SITE_ID}`),
  api(`/sites/${SITE_ID}/files`),
  readFile(LEDGER_FILE),
]);
const ledger = JSON.parse(ledgerBytes);

if (site.published_deploy?.id !== BASE_DEPLOY_ID) {
  throw new Error(`BASE_DEPLOY_CHANGED:${site.published_deploy?.id || "missing"}`);
}
if (!Array.isArray(baseFiles) || baseFiles.length !== EXPECTED_BASE_FILE_COUNT) {
  throw new Error(`BASE_FILE_COUNT_MISMATCH:${baseFiles?.length}`);
}
if (baseFiles.some((file) => file.deploy_id !== BASE_DEPLOY_ID)) {
  throw new Error("BASE_FILE_PROVENANCE_MISMATCH");
}
if (!Array.isArray(ledger.records) || ledger.records.length !== EXPECTED_DUPLICATE_COUNT) {
  throw new Error(`DUPLICATE_LEDGER_COUNT_MISMATCH:${ledger.records?.length}`);
}

const manifest = new Map(baseFiles.map((file) => [file.path.replace(/^\//u, ""), file.sha]));
const baseManifestDigest = sha256(Buffer.from(JSON.stringify(
  [...manifest.entries()].sort(([left], [right]) => left.localeCompare(right)),
)));
const localBySha = new Map();
const addedPagePaths = [];
const referencedAssets = new Set();

for (const record of ledger.records) {
  const deployPath = normalizedRouteFile(record.route);
  if (manifest.has(deployPath)) throw new Error(`DUPLICATE_ROUTE_ALREADY_EXISTS:${deployPath}`);
  const localPath = path.join(OUT, deployPath);
  const bytes = await readFile(localPath);
  const digest = sha1(bytes);
  manifest.set(deployPath, digest);
  localBySha.set(digest, { deployPath, bytes });
  addedPagePaths.push(deployPath);

  const html = bytes.toString("utf8");
  for (const match of html.matchAll(/\bsrc=["']([^"']+)["']/gu)) {
    if (match[1].startsWith("/")) referencedAssets.add(decodeURIComponent(new URL(match[1], "https://honhyul.kr").pathname));
  }
  for (const match of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gu)) {
    if (match[1].startsWith("/")) referencedAssets.add(decodeURIComponent(new URL(match[1], "https://honhyul.kr").pathname));
  }
}

const assetCollisions = [];
const addedAssetPaths = [];
for (const publicPath of [...referencedAssets].sort()) {
  const deployPath = publicPath.replace(/^\//u, "");
  const localPath = path.join(OUT, deployPath);
  if (!existsSync(localPath) || !(await stat(localPath)).isFile()) {
    throw new Error(`REFERENCED_ASSET_MISSING:${publicPath}`);
  }
  const bytes = await readFile(localPath);
  const digest = sha1(bytes);
  const baseDigest = manifest.get(deployPath);
  if (baseDigest && baseDigest !== digest) {
    assetCollisions.push({ deployPath, baseDigest, localDigest: digest });
    continue;
  }
  if (!baseDigest) {
    manifest.set(deployPath, digest);
    localBySha.set(digest, { deployPath, bytes });
    addedAssetPaths.push(deployPath);
  }
}
if (assetCollisions.length > 0) {
  throw new Error(`REFERENCED_ASSET_COLLISION:${JSON.stringify(assetCollisions.slice(0, 10))}`);
}

const replacedPaths = [];
for (const deployPath of ["sitemap.xml", "rss.xml"]) {
  const bytes = await readFile(path.join(OUT, deployPath));
  const digest = sha1(bytes);
  manifest.set(deployPath, digest);
  localBySha.set(digest, { deployPath, bytes });
  replacedPaths.push(deployPath);
}

const manifestObject = Object.fromEntries([...manifest.entries()].sort(([left], [right]) => left.localeCompare(right)));
const manifestDigest = sha256(Buffer.from(JSON.stringify(Object.entries(manifestObject))));
const plan = {
  schemaVersion: "honhyul-netlify-preserving-base-plan/v1",
  status: "PASS",
  publishRequested: publish,
  siteId: SITE_ID,
  baseDeployId: BASE_DEPLOY_ID,
  baseFileCount: baseFiles.length,
  baseManifestDigest,
  duplicateLedgerSha256: sha256(ledgerBytes),
  duplicatePagesAdded: addedPagePaths.length,
  referencedAssets: referencedAssets.size,
  assetsAdded: addedAssetPaths.length,
  replacedPaths,
  finalFileCount: manifest.size,
  finalManifestDigest: manifestDigest,
};

if (!publish) {
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  process.exit(0);
}

const created = resumeDeployId
  ? await api(`/sites/${SITE_ID}/deploys/${resumeDeployId}`)
  : await api(`/sites/${SITE_ID}/deploys?title=${encodeURIComponent("Add five duplicate pages per operated dong")}`, {
    method: "POST",
    body: {
      draft: false,
    },
  });

let deploy;
if (resumeDeployId) {
  if (!["prepared", "uploading", "uploaded", "processing"].includes(created.state)) {
    throw new Error(`RESUME_DEPLOY_STATE_INVALID:${created.state}`);
  }
  deploy = created;
} else {
  await mkdir(path.dirname(RECEIPT_FILE), { recursive: true });
  await writeFile(RECEIPT_FILE, `${JSON.stringify({
    ...plan,
    schemaVersion: "honhyul-netlify-preserving-base-deploy-in-progress/v1",
    deploymentStatus: "CREATED",
    deployId: created.id,
    checkedAt: new Date().toISOString(),
  }, null, 2)}\n`, "utf8");

  deploy = await api(`/sites/${SITE_ID}/deploys/${created.id}`, {
    method: "PUT",
    body: {
      files: manifestObject,
      async: true,
      draft: false,
      framework: "next.js",
      framework_version: "16.3.0",
    },
  });
}
const diffDeadline = Date.now() + 10 * 60_000;
while (["new", "preparing", "prepared"].includes(deploy.state) && Date.now() < diffDeadline) {
  await new Promise((resolve) => setTimeout(resolve, 1_500));
  deploy = await api(`/sites/${SITE_ID}/deploys/${created.id}`);
  if (["uploading", "uploaded", "processing", "ready", "error"].includes(deploy.state)) break;
}
if (deploy.state === "error") throw new Error(`NETLIFY_DEPLOY_ERROR:${deploy.error_message || "unknown"}`);

const required = Array.isArray(deploy.required) ? deploy.required : [];
const unresolved = required.filter((digest) => !localBySha.has(digest));
if (unresolved.length > 0) {
  throw new Error(`NETLIFY_REQUIRED_BASE_BLOB_MISSING:${unresolved.length}`);
}

let uploaded = 0;
await pool(required, 10, async (digest) => {
  const file = localBySha.get(digest);
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await api(`/deploys/${created.id}/files/${encodeURI(file.deployPath)}?size=${file.bytes.length}`, {
        method: "PUT",
        body: new Uint8Array(file.bytes),
      });
      uploaded += 1;
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 750 * (attempt + 1)));
    }
  }
  throw lastError;
});

const readyDeadline = Date.now() + 15 * 60_000;
while (Date.now() < readyDeadline) {
  deploy = await api(`/sites/${SITE_ID}/deploys/${created.id}`);
  if (deploy.state === "ready") break;
  if (deploy.state === "error") throw new Error(`NETLIFY_DEPLOY_ERROR:${deploy.error_message || "unknown"}`);
  await new Promise((resolve) => setTimeout(resolve, 1_500));
}
if (deploy.state !== "ready") throw new Error(`NETLIFY_DEPLOY_NOT_READY:${deploy.state}`);

const receipt = {
  ...plan,
  schemaVersion: "honhyul-netlify-preserving-base-deploy/v1",
  deploymentStatus: "READY",
  deployId: deploy.id,
  deployUrl: deploy.deploy_ssl_url || deploy.deploy_url,
  stableUrl: deploy.ssl_url || deploy.url,
  requiredBlobs: required.length,
  uploadedBlobs: uploaded,
  publishedAt: deploy.published_at,
  checkedAt: new Date().toISOString(),
};
await writeFile(RECEIPT_FILE, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
