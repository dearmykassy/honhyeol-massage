import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  COMPACT_DETAIL_SECTION_IDS,
  createRegionContent,
  isBroadDetailRegion,
} from "../src/lib/content.ts";
import {
  ACTIVE_REGION_NODES,
  getKeywordRegionLabel,
  getSearchRegionLabel,
} from "../src/lib/regions.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const CODEX_ROOT = path.resolve(ROOT, "..");
const CUSTOMER_SOURCE_FILES = [
  "src/app/page.tsx",
  "src/app/areas/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/guide/page.tsx",
  "src/app/notice/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/blog/[slug]/page.tsx",
  "src/components/RegionExperience.tsx",
  "src/components/RegionGallery.tsx",
  "src/components/RegionSearch.tsx",
  "src/components/SiteFooter.tsx",
  "src/components/SiteHeader.tsx",
  "src/data/blog-posts.ts",
  "src/lib/content.ts",
  "src/lib/region-customer-copy.ts",
  "src/lib/region-editorial-copy.ts",
  "src/lib/region-seo-copy.ts",
  "src/lib/region-page-model.ts",
  "src/lib/site-content.ts",
];
const COMPARATORS = [
  "geonmae-banhada",
  "feeling-hometai",
  "rang-therapy-seo-release",
  "rang-therapy",
  "massagebom",
  "massage-love",
  "callmetodak",
].filter((name) => existsSync(path.join(CODEX_ROOT, name)));
const BRAND_PATTERN = /혼혈마사지|건마에반하다|필링홈타이|랑테라피|마사지봄|마사지러브|콜미토닥이/gu;
const RUNTIME_COMPARATORS = [
  "geonmae-banhada",
  "feeling-hometai",
  "rang-therapy-seo-release",
].filter((name) => existsSync(path.join(CODEX_ROOT, name, "src/lib/content.ts")));

function extractCustomerLiterals(root) {
  const values = new Set();
  for (const relative of CUSTOMER_SOURCE_FILES) {
    const file = path.join(root, relative);
    if (!existsSync(file)) continue;
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/(["'`])([\s\S]*?)\1/gu)) {
      const value = match[2]
        .replace(/\$\{[^}]+\}/gu, "{값}")
        .replace(BRAND_PATTERN, "{브랜드}")
        .replace(/\\[nrt]/gu, " ")
        .replace(/\s+/gu, " ")
        .trim();
      const hangulCount = (value.match(/[가-힣]/gu) ?? []).length;
      if (hangulCount >= 18 && !value.includes("@/") && !value.includes("/images/")) values.add(value);
    }
  }
  return values;
}

function normalizeRegional(value, node) {
  const labels = [
    node.qualifiedName,
    node.displayName,
    getSearchRegionLabel(node),
    getKeywordRegionLabel(node),
  ]
    .filter((label, index, all) => label.length > 0 && all.indexOf(label) === index)
    .sort((left, right) => right.length - left.length);
  return labels
    .reduce((copy, label) => copy.replaceAll(label, "{지역}"), value)
    .replace(BRAND_PATTERN, "{브랜드}")
    .replace(/\s+/gu, " ")
    .trim();
}

function runtimeContentValues(content) {
  return [
    content.title,
    content.description,
    content.h1,
    ...content.hooks,
    ...content.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
  ];
}

function runtimeRegionalHashes(projectName) {
  const projectRoot = path.join(CODEX_ROOT, projectName);
  const code = `
    import { createHash } from "node:crypto";
    import { createRegionContent } from "./src/lib/content.ts";
    import * as regionLibrary from "./src/lib/regions.ts";
    const { ACTIVE_REGION_NODES } = regionLibrary;
    const brands = /혼혈마사지|건마에반하다|필링홈타이|랑테라피|마사지봄|마사지러브|콜미토닥이/gu;
    function normalize(value, node) {
      const labels = [node.qualifiedName, node.displayName,
        typeof regionLibrary.getSearchRegionLabel === "function" ? regionLibrary.getSearchRegionLabel(node) : "",
        typeof regionLibrary.getKeywordRegionLabel === "function" ? regionLibrary.getKeywordRegionLabel(node) : ""]
        .filter((label, index, all) => label.length > 0 && all.indexOf(label) === index)
        .sort((left, right) => right.length - left.length);
      return labels.reduce((copy, label) => copy.replaceAll(label, "{지역}"), value)
        .replace(brands, "{브랜드}").replace(/\\s+/gu, " ").trim();
    }
    const hashes = new Set();
    for (const node of ACTIVE_REGION_NODES) {
      const content = createRegionContent(node);
      const values = [content.title, content.description, content.h1, ...content.hooks,
        ...content.sections.flatMap((section) => [section.heading, ...section.paragraphs])];
      for (const value of values) {
        const normalized = normalize(value, node);
        if ((normalized.match(/[가-힣]/gu) ?? []).length < 10) continue;
        hashes.add(createHash("sha256").update(normalized).digest("hex"));
      }
    }
    process.stdout.write(JSON.stringify([...hashes]));
  `;
  return new Set(JSON.parse(execFileSync(
    "pnpm",
    ["exec", "tsx", "-e", code],
    { cwd: projectRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  )));
}

function collectStrings(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, output));
  return output;
}

function massageLoveSnapshotHashes() {
  const file = path.join(CODEX_ROOT, "massage-love/src/data/region-content.generated.json");
  if (!existsSync(file)) return new Set();
  const snapshot = JSON.parse(readFileSync(file, "utf8"));
  const nodeByRoute = new Map(ACTIVE_REGION_NODES.map((node) => [node.path, node]));
  const hashes = new Set();
  for (const entry of snapshot.entries ?? []) {
    const node = nodeByRoute.get(entry.route);
    if (!node) continue;
    const extraLabels = [
      entry.commercialName,
      entry.localityLabel,
      ...(entry.regionAliases ?? []),
      ...(entry.keywordPrefixes ?? []),
    ].filter(Boolean).sort((left, right) => right.length - left.length);
    for (const value of collectStrings(entry)) {
      const normalized = extraLabels
        .reduce((copy, label) => copy.replaceAll(label, "{지역}"), normalizeRegional(value, node))
        .replace(/\s+/gu, " ")
        .trim();
      if ((normalized.match(/[가-힣]/gu) ?? []).length < 10) continue;
      hashes.add(createHash("sha256").update(normalized).digest("hex"));
    }
  }
  return hashes;
}

function maxFrequency(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Math.max(...counts.values());
}

const targetLiterals = extractCustomerLiterals(ROOT);
const crossPlatformCollisions = {};
for (const comparator of COMPARATORS) {
  const comparatorLiterals = extractCustomerLiterals(path.join(CODEX_ROOT, comparator));
  crossPlatformCollisions[comparator] = [...targetLiterals]
    .filter((value) => comparatorLiterals.has(value))
    .sort();
}

const records = ACTIVE_REGION_NODES.map((node) => ({ node, content: createRegionContent(node) }));
const compactRecords = records.filter(({ node }) => !isBroadDetailRegion(node));
const regionalParagraphs = records.flatMap(({ content }) =>
  content.sections.flatMap((section) => section.paragraphs),
);
const fullSignatures = records.map(({ node, content }) =>
  normalizeRegional(
    [content.description, ...content.hooks, ...content.sections.flatMap((section) => section.paragraphs)].join("\u001f"),
    node,
  ),
);
const compactSlotMaxima = [];
for (let sectionIndex = 0; sectionIndex < COMPACT_DETAIL_SECTION_IDS.length; sectionIndex += 1) {
  for (let paragraphIndex = 0; paragraphIndex < 2; paragraphIndex += 1) {
    compactSlotMaxima.push(maxFrequency(compactRecords.map(({ node, content }) =>
      normalizeRegional(content.sections[sectionIndex].paragraphs[paragraphIndex], node),
    )));
  }
}

const currentRuntimeCopyByHash = new Map();
for (const { node, content } of records) {
  for (const value of runtimeContentValues(content)) {
    const normalized = normalizeRegional(value, node);
    if ((normalized.match(/[가-힣]/gu) ?? []).length < 10) continue;
    currentRuntimeCopyByHash.set(createHash("sha256").update(normalized).digest("hex"), normalized);
  }
}
const runtimeRegionalCollisions = {};
for (const comparator of RUNTIME_COMPARATORS) {
  const comparatorHashes = runtimeRegionalHashes(comparator);
  const collisions = [...currentRuntimeCopyByHash]
    .filter(([hash]) => comparatorHashes.has(hash))
    .map(([, value]) => value)
    .sort();
  runtimeRegionalCollisions[comparator] = collisions;
}
if (existsSync(path.join(CODEX_ROOT, "massage-love"))) {
  const comparatorHashes = massageLoveSnapshotHashes();
  runtimeRegionalCollisions["massage-love"] = [...currentRuntimeCopyByHash]
    .filter(([hash]) => comparatorHashes.has(hash))
    .map(([, value]) => value)
    .sort();
}

const report = {
  status:
    Object.values(crossPlatformCollisions).every((items) => items.length === 0) &&
    Object.values(runtimeRegionalCollisions).every((items) => items.length === 0)
      ? "PASS"
      : "REVIEW",
  routeCount: records.length,
  broadDetailRoutes: records.filter(({ node }) => isBroadDetailRegion(node)).length,
  compactRoutes: compactRecords.length,
  uniqueTitles: new Set(records.map(({ content }) => content.title)).size,
  uniqueDescriptions: new Set(records.map(({ content }) => content.description)).size,
  uniqueH1s: new Set(records.map(({ content }) => content.h1)).size,
  paragraphCount: regionalParagraphs.length,
  uniqueParagraphs: new Set(regionalParagraphs).size,
  uniqueNormalizedFullSignatures: new Set(fullSignatures).size,
  compactNormalizedSlotMaxReuse: Math.max(...compactSlotMaxima),
  broadRouteSetSha256: createHash("sha256")
    .update(records.filter(({ node }) => isBroadDetailRegion(node)).map(({ node }) => node.path).sort().join("\n"))
    .digest("hex"),
  sourceLiteralThresholdHangulCharacters: 18,
  comparedPlatforms: COMPARATORS,
  crossPlatformExactNormalizedLiteralCollisions: Object.fromEntries(
    Object.entries(crossPlatformCollisions).map(([name, items]) => [name, { count: items.length, examples: items.slice(0, 5) }]),
  ),
  regionalRuntimeBrandAndRegionNormalizedCollisions: Object.fromEntries(
    Object.entries(runtimeRegionalCollisions).map(([name, items]) => [name, { count: items.length, examples: items.slice(0, 5) }]),
  ),
};

console.log(JSON.stringify(report, null, 2));
if (report.status !== "PASS") process.exitCode = 1;
