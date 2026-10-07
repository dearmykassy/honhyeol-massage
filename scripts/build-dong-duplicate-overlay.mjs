import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const LEDGER_FILE = path.join(ROOT, "src/data/dong-duplicate-pages.generated.json");
const ARTIFACT_ROOT = path.join(ROOT, "artifacts/honhyul-dong-duplicates-20261007");
const SITEMAP_FILE = path.join(OUT, "sitemap.xml");
const RSS_FILE = path.join(OUT, "rss.xml");
const ALLOWED_EXISTING_MUTATIONS = new Set(["/sitemap.xml", "/rss.xml"]);

function sha1(bytes) {
  return createHash("sha1").update(bytes).digest("hex");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function count(value, needle) {
  return value.split(needle).length - 1;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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

async function walk(directory) {
  const files = [];
  for (const name of await readdir(directory)) {
    const absolute = path.join(directory, name);
    const metadata = await stat(absolute);
    if (metadata.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

async function snapshot(directory) {
  const entries = [];
  for (const file of await walk(directory)) {
    const bytes = await readFile(file);
    entries.push({
      path: `/${path.relative(directory, file).split(path.sep).join("/")}`,
      size: bytes.length,
      sha1: sha1(bytes),
    });
  }
  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

const STATIC_CONTROLS = `<script data-honhyul-static-controls>(function(){const b=document.body,q=(s)=>document.querySelector(s),qa=(s)=>[...document.querySelectorAll(s)],panel=q('.search-panel'),scrim=q('.drawer-scrim'),drawer=q('.mobile-drawer'),nav=q('.desktop-nav'),top=q('.scroll-top');function inert(el,on){if(!el)return;el.setAttribute('aria-hidden',String(on));if(on)el.setAttribute('inert','');else el.removeAttribute('inert')}function search(on){panel?.classList.toggle('is-open',on);inert(panel,!on);b.classList.toggle('search-active',on||drawer?.classList.contains('is-open'))}function menu(on){drawer?.classList.toggle('is-open',on);scrim?.classList.toggle('is-open',on);inert(drawer,!on);scrim?.setAttribute('aria-hidden',String(!on));b.classList.toggle('search-active',on||panel?.classList.contains('is-open'))}qa('.mobile-search-open,.round-search').forEach(x=>x.addEventListener('click',()=>search(true)));q('.search-close')?.addEventListener('click',()=>search(false));qa('.mobile-menu-open,.grid-button').forEach(x=>x.addEventListener('click',()=>menu(true)));q('.mobile-menu-close')?.addEventListener('click',()=>menu(false));scrim?.addEventListener('click',()=>menu(false));q('.notice-close')?.addEventListener('click',()=>{q('.notice-bar')?.remove();b.classList.add('notice-closed')});top?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));addEventListener('keydown',e=>{if(e.key==='Escape'){search(false);menu(false)}});function scroll(){const on=scrollY>480;nav?.classList.toggle('scrolled',on);top?.classList.toggle('is-visible',on)}addEventListener('scroll',scroll,{passive:true});scroll()})();</script>`;
const FACE_SAFE_STYLE = `<style data-honhyul-duplicate-face-safe>@media(max-width:767px){[class$="__hero"]{background-position:right top!important}}</style>`;

function stripFrameworkScripts(html) {
  return html
    .replace(/<link\b(?=[^>]*\bas="script")[^>]*\/?>(?:<\/link>)?/giu, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "");
}

function replaceExactly(html, oldValue, newValue, label, minimum = 1) {
  const occurrences = count(html, oldValue);
  if (occurrences < minimum) {
    throw new Error(`HONHYUL_DONG_DUPLICATE_REPLACEMENT_MISSING:${label}:${occurrences}`);
  }
  return html.replaceAll(oldValue, newValue);
}

function renderDuplicate(sourceHtml, record) {
  let html = stripFrameworkScripts(sourceHtml);
  const oldTitle = escapeHtml(record.sourcePage.title);
  const oldDescription = escapeHtml(record.sourcePage.description);
  const oldH1 = escapeHtml(record.sourcePage.h1);
  const oldKeywords = escapeHtml(record.sourcePage.metaKeywords.join(","));
  const oldCanonical = new URL(record.baseRoute, "https://honhyul.kr").href;
  const oldRouteNoSlash = record.baseRoute.replace(/\/$/u, "");
  const newRouteNoSlash = record.route.replace(/\/$/u, "");

  html = replaceExactly(html, oldTitle, escapeHtml(record.title), "title", 3);
  html = replaceExactly(html, oldDescription, escapeHtml(record.description), "description", 3);
  html = replaceExactly(html, oldKeywords, escapeHtml(record.metaKeywords.join(",")), "keywords", 1);
  html = replaceExactly(html, oldCanonical, record.canonical, "canonical", 2);
  html = replaceExactly(
    html,
    `<h1 id="region-title" data-region-copy-id="opening:h1">${oldH1}</h1>`,
    `<h1 id="region-title" data-region-copy-id="opening:h1">${escapeHtml(record.h1)}</h1>`,
    "h1",
    1,
  );
  html = replaceExactly(
    html,
    `data-region-route="${oldRouteNoSlash}"`,
    `data-region-route="${newRouteNoSlash}"`,
    "route-marker",
    1,
  );
  html = html.replace("</head>", `${FACE_SAFE_STYLE}<!-- honhyul-dong-duplicate-static-v1 --></head>`);
  html = html.replace("</body>", `${STATIC_CONTROLS}</body>`);
  return html;
}

function sitemapRecords(records) {
  return records.map((record) => [
    "<url>",
    `<loc>${escapeXml(record.canonical)}</loc>`,
    `<lastmod>${new Date(record.publishedAt).toISOString()}</lastmod>`,
    "</url>",
  ].join("\n")).join("\n");
}

function rssItems(records) {
  return records.map((record) => [
    "    <item>",
    `      <title>${escapeXml(record.title)}</title>`,
    `      <link>${escapeXml(record.canonical)}</link>`,
    `      <description>${escapeXml(record.description)}</description>`,
    "      <category>지역 안내</category>",
    `      <pubDate>${new Date(record.publishedAt).toUTCString()}</pubDate>`,
    `      <guid isPermaLink="true">${escapeXml(record.canonical)}</guid>`,
    "    </item>",
  ].join("\n")).join("\n");
}

const ledger = JSON.parse(await readFile(LEDGER_FILE, "utf8"));
if (ledger.status !== "PREVIEW_READY_NOT_DEPLOYED" || ledger.records.length !== 4_565) {
  throw new Error("HONHYUL_DONG_DUPLICATE_LEDGER_INVALID");
}

const before = await snapshot(OUT);
const beforeByPath = new Map(before.map((entry) => [entry.path, entry]));
const sourceCache = new Map();
let writtenBytes = 0;

for (const record of ledger.records) {
  let sourceHtml = sourceCache.get(record.baseRoute);
  if (!sourceHtml) {
    sourceHtml = await readFile(routeFile(record.baseRoute), "utf8");
    sourceCache.set(record.baseRoute, sourceHtml);
  }
  const html = renderDuplicate(sourceHtml, record);
  const target = routeFile(record.route);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
  writtenBytes += Buffer.byteLength(html);
}

let sitemap = await readFile(SITEMAP_FILE, "utf8");
if (count(sitemap, "<url>") !== 1_299 || ledger.records.some((record) => sitemap.includes(record.canonical))) {
  throw new Error("HONHYUL_DONG_DUPLICATE_SITEMAP_BASE_INVALID");
}
sitemap = sitemap.replace("</urlset>", `${sitemapRecords(ledger.records)}\n</urlset>`);
await writeFile(SITEMAP_FILE, sitemap, "utf8");

let rss = await readFile(RSS_FILE, "utf8");
if (count(rss, "<item>") !== 2 || ledger.records.some((record) => rss.includes(record.canonical))) {
  throw new Error("HONHYUL_DONG_DUPLICATE_RSS_BASE_INVALID");
}
const latestRfc822 = new Date(ledger.records[0].publishedAt).toUTCString();
rss = rss.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/u, `<lastBuildDate>${latestRfc822}</lastBuildDate>`);
rss = rss.replace("    <item>", `${rssItems(ledger.records)}\n    <item>`);
await writeFile(RSS_FILE, rss, "utf8");

const after = await snapshot(OUT);
const afterByPath = new Map(after.map((entry) => [entry.path, entry]));
const mutatedExisting = before
  .filter((entry) => afterByPath.get(entry.path)?.sha1 !== entry.sha1)
  .map((entry) => entry.path)
  .sort();
const removedExisting = before.filter((entry) => !afterByPath.has(entry.path)).map((entry) => entry.path);
const added = after.filter((entry) => !beforeByPath.has(entry.path));
const expectedAdded = new Set(ledger.records.map((record) => `/${path.relative(OUT, routeFile(record.route)).split(path.sep).join("/")}`));
const unexpectedAdded = added.filter((entry) => !expectedAdded.has(entry.path)).map((entry) => entry.path);
const missingAdded = [...expectedAdded].filter((file) => !afterByPath.has(file));

if (JSON.stringify(mutatedExisting) !== JSON.stringify([...ALLOWED_EXISTING_MUTATIONS].sort())) {
  throw new Error(`HONHYUL_DONG_DUPLICATE_EXISTING_MUTATION:${mutatedExisting.join(",")}`);
}
if (removedExisting.length > 0) throw new Error(`HONHYUL_DONG_DUPLICATE_EXISTING_REMOVED:${removedExisting[0]}`);
if (unexpectedAdded.length > 0) throw new Error(`HONHYUL_DONG_DUPLICATE_UNEXPECTED_ADDITION:${unexpectedAdded[0]}`);
if (missingAdded.length > 0) throw new Error(`HONHYUL_DONG_DUPLICATE_MISSING_ADDITION:${missingAdded[0]}`);
if (count(sitemap, "<url>") !== 5_864) throw new Error("HONHYUL_DONG_DUPLICATE_SITEMAP_COUNT_INVALID");
if (count(rss, "<item>") !== 4_567) throw new Error("HONHYUL_DONG_DUPLICATE_RSS_COUNT_INVALID");

await mkdir(ARTIFACT_ROOT, { recursive: true });
const receipt = {
  schemaVersion: "honhyul-dong-duplicate-overlay-build-receipt/v1",
  status: "PASS",
  deploymentStatus: "NOT_DEPLOYED_OWNER_REVIEW_REQUIRED",
  sourceDeployId: ledger.source.netlifyDeployId,
  sourceGitCommit: ledger.source.gitCommit,
  existingFilesBefore: before.length,
  existingFilesAfter: before.length,
  existingMutations: mutatedExisting,
  removedExisting,
  addedFiles: added.length,
  expectedAddedFiles: expectedAdded.size,
  generatedHtmlBytes: writtenBytes,
  sitemapUrlCount: count(sitemap, "<url>"),
  rssItemCount: count(rss, "<item>"),
  ledgerRecordDigest: ledger.recordDigest,
  outputManifestSha256: sha256(Buffer.from(after.map((entry) => `${entry.path}\t${entry.sha1}\t${entry.size}`).join("\n"))),
};
await writeFile(
  path.join(ARTIFACT_ROOT, "overlay-build-receipt.json"),
  `${JSON.stringify(receipt, null, 2)}\n`,
  "utf8",
);
process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
