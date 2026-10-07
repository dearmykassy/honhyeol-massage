import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const LEDGER_FILE = path.join(ROOT, "src/data/dong-duplicate-pages.generated.json");
const RECEIPT_FILE = path.join(ROOT, "artifacts/honhyul-dong-duplicates-20261007/overlay-build-receipt.json");

function fail(code) {
  throw new Error(`HONHYUL_DONG_DUPLICATE_AUDIT_${code}`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function count(value, needle) {
  return value.split(needle).length - 1;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function routeFile(route) {
  const pathname = decodeURIComponent(new URL(route, "https://honhyul.kr").pathname);
  return path.join(OUT, pathname.replace(/^\/+|\/+$/gu, ""), "index.html");
}

function stripScripts(html) {
  return html
    .replace(/<link\b(?=[^>]*\bas="script")[^>]*\/?>(?:<\/link>)?/giu, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "");
}

function normalizedVisibleBody(html, h1, route) {
  const body = stripScripts(html).match(/<body>[\s\S]*<\/body>/u)?.[0];
  if (!body) fail("BODY_MISSING");
  return body
    .replace(
      `<h1 id="region-title" data-region-copy-id="opening:h1">${escapeHtml(h1)}</h1>`,
      '<h1 id="region-title" data-region-copy-id="opening:h1">__H1__</h1>',
    )
    .replace(`data-region-route="${route.replace(/\/$/u, "")}"`, 'data-region-route="__ROUTE__"')
    .replace(/\s+/gu, " ")
    .trim();
}

const ledger = JSON.parse(await readFile(LEDGER_FILE, "utf8"));
const receipt = JSON.parse(await readFile(RECEIPT_FILE, "utf8"));
if (ledger.records.length !== 4_565 || receipt.status !== "PASS") fail("INPUT_INVALID");
if (receipt.deploymentStatus !== "NOT_DEPLOYED_OWNER_REVIEW_REQUIRED") fail("OWNER_REVIEW_GATE_MISSING");
if (receipt.existingMutations.join("\n") !== "/rss.xml\n/sitemap.xml") fail("EXISTING_MUTATION_SCOPE");
if (receipt.removedExisting.length !== 0 || receipt.addedFiles !== 4_565) fail("OVERLAY_FILE_SCOPE");

const sourceCache = new Map();
const titles = new Set();
const descriptions = new Set();
const h1s = new Set();
const routes = new Set();
const perBase = new Map();
let bodyParity = 0;
let metadataParity = 0;

for (const record of ledger.records) {
  const html = await readFile(routeFile(record.route), "utf8");
  let sourceHtml = sourceCache.get(record.baseRoute);
  if (!sourceHtml) {
    sourceHtml = await readFile(routeFile(record.baseRoute), "utf8");
    sourceCache.set(record.baseRoute, sourceHtml);
  }

  const title = escapeHtml(record.title);
  const description = escapeHtml(record.description);
  const h1 = escapeHtml(record.h1);
  const keywords = escapeHtml(record.metaKeywords.join(","));
  if (count(html, `<title>${title}</title>`) !== 1) fail(`TITLE:${record.route}`);
  if (count(html, `<meta name="description" content="${description}"/>`) !== 1) fail(`DESCRIPTION:${record.route}`);
  if (count(html, `<meta name="keywords" content="${keywords}"/>`) !== 1) fail(`KEYWORDS:${record.route}`);
  if (count(html, `<link rel="canonical" href="${record.canonical}"/>`) !== 1) fail(`CANONICAL:${record.route}`);
  if (count(html, `<meta property="og:title" content="${title}"/>`) !== 1) fail(`OG_TITLE:${record.route}`);
  if (count(html, `<meta property="og:description" content="${description}"/>`) !== 1) fail(`OG_DESCRIPTION:${record.route}`);
  if (count(html, `<meta property="og:url" content="${record.canonical}"/>`) !== 1) fail(`OG_URL:${record.route}`);
  if (count(html, `<meta name="twitter:title" content="${title}"/>`) !== 1) fail(`TWITTER_TITLE:${record.route}`);
  if (count(html, `<meta name="twitter:description" content="${description}"/>`) !== 1) fail(`TWITTER_DESCRIPTION:${record.route}`);
  if (count(html, `<h1 id="region-title" data-region-copy-id="opening:h1">${h1}</h1>`) !== 1) fail(`H1:${record.route}`);
  if (count(html, "data-honhyul-static-controls") !== 1) fail(`STATIC_CONTROLS:${record.route}`);
  if (count(html, "data-honhyul-duplicate-face-safe") !== 1) fail(`FACE_SAFE_STYLE:${record.route}`);
  if (/<script\s+src=/iu.test(html) || /self\.__next_f/iu.test(html)) fail(`NEXT_RUNTIME_RESIDUE:${record.route}`);
  if (/<meta[^>]+(?:noindex|none)/iu.test(html)) fail(`NOINDEX:${record.route}`);
  if (record.provincePolicy === "province-omitted" && /경기(?:도)?/u.test(`${record.h1}\n${record.title}\n${record.description}`)) {
    fail(`GYEONGGI_PUBLIC_NAME:${record.route}`);
  }

  const sourceBody = normalizedVisibleBody(sourceHtml, record.sourcePage.h1, record.baseRoute);
  const targetBody = normalizedVisibleBody(html, record.h1, record.route);
  if (sourceBody !== targetBody) fail(`BODY_PARITY:${record.route}`);
  bodyParity += 1;
  metadataParity += 1;

  titles.add(record.title);
  descriptions.add(record.description);
  h1s.add(record.h1);
  routes.add(record.route);
  if (!perBase.has(record.baseRoute)) perBase.set(record.baseRoute, []);
  perBase.get(record.baseRoute).push(record);
}

if (titles.size !== ledger.records.length) fail(`TITLE_UNIQUENESS:${titles.size}`);
if (descriptions.size !== ledger.records.length) fail(`DESCRIPTION_UNIQUENESS:${descriptions.size}`);
if (h1s.size !== ledger.records.length) fail(`H1_UNIQUENESS:${h1s.size}`);
if (routes.size !== ledger.records.length) fail(`ROUTE_UNIQUENESS:${routes.size}`);
if (perBase.size !== 913) fail(`DONG_NODE_COUNT:${perBase.size}`);
for (const [baseRoute, records] of perBase) {
  if (records.length !== 5) fail(`FIVE_PER_DONG:${baseRoute}:${records.length}`);
  if (records.filter((record) => record.h1Noun === "마사지").length !== 2) fail(`MASSAGE_BALANCE:${baseRoute}`);
  if (records.filter((record) => record.h1Noun === "안마").length !== 3) fail(`ANMA_BALANCE:${baseRoute}`);
}

const sitemap = await readFile(path.join(OUT, "sitemap.xml"), "utf8");
const rss = await readFile(path.join(OUT, "rss.xml"), "utf8");
if (count(sitemap, "<url>") !== 5_864) fail("SITEMAP_COUNT");
if (count(rss, "<item>") !== 4_567) fail("RSS_COUNT");
for (const record of ledger.records) {
  if (count(sitemap, `<loc>${record.canonical}</loc>`) !== 1) fail(`SITEMAP_MEMBERSHIP:${record.route}`);
  if (count(rss, `<link>${record.canonical}</link>`) !== 1) fail(`RSS_MEMBERSHIP:${record.route}`);
}

const audit = {
  schemaVersion: "honhyul-dong-duplicate-overlay-audit/v1",
  status: "PASS",
  deploymentStatus: "NOT_DEPLOYED_OWNER_REVIEW_REQUIRED",
  operatedDongNodes: perBase.size,
  newPages: ledger.records.length,
  metadataParity,
  bodyParity,
  uniqueTitles: titles.size,
  uniqueDescriptions: descriptions.size,
  uniqueH1s: h1s.size,
  sitemapUrls: count(sitemap, "<url>"),
  rssItems: count(rss, "<item>"),
  sourcePageHtmlCache: sourceCache.size,
  auditSha256: sha256(JSON.stringify({
    ledgerDigest: ledger.recordDigest,
    outputManifest: receipt.outputManifestSha256,
    metadataParity,
    bodyParity,
  })),
};
process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
