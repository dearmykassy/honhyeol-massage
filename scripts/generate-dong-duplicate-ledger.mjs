import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createRegionContent } from "../src/lib/content.ts";
import { SITE_NAME, SITE_ORIGIN } from "../src/lib/metadata.ts";
import { ACTIVE_REGION_NODES } from "../src/lib/regions.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "src/data/dong-duplicate-pages.generated.json");
const DEPLOY_ID = "6a84a13d8ec0be000836b3bd";
const SOURCE_COMMIT = "b6fac610b63c3681b2bd7fb8ef10f711f3a371f8";
const PUBLISHED_AT = "2026-10-07T00:00:00+09:00";
const VARIANTS = ["B", "C", "D", "E", "F"];
const NOUN_BY_VARIANT = {
  B: "안마",
  C: "마사지",
  D: "안마",
  E: "마사지",
  F: "안마",
};

// These are the ordinary, owner-approved TNT C keyword assignments. They are
// facts frozen into the ledger; the build never composes or rotates prose.
const H1_KEYWORDS = [
  "프라이빗 홈케어",
  "아로마케어",
  "리커버리 바디케어",
  "스웨디시케어",
  "퍼스널 홈타이",
  "맞춤형 힐링케어",
  "컴포트 전신케어",
  "웰니스 홈케어",
  "소프트 아로마케어",
  "밸런스 바디케어",
  "프리미엄 홈타이",
  "릴랙스케어",
  "컨디션 홈케어",
  "시그니처 전신케어",
  "데일리 바디케어",
  "리프레시 홈타이",
  "클래식 아로마케어",
  "집중케어",
  "휴식 홈케어",
  "마인드 바디케어",
  "로열 스웨디시케어",
  "딥릴랙스 홈케어",
  "퍼스널 아로마케어",
  "맞춤형 바디케어",
  "프라이빗 힐링케어",
  "컴포트 홈타이",
  "웰니스 전신케어",
  "리커버리 홈케어",
  "소프트 바디케어",
  "밸런스 아로마케어",
  "프리미엄 릴랙스케어",
  "시그니처 홈케어",
  "데일리 아로마케어",
  "리프레시 바디케어",
  "클래식 홈타이",
  "컨디션케어",
  "힐링 홈케어",
  "아로마 홈타이",
  "전신 바디케어",
  "휴식 아로마케어",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function currentCommit() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
}

function stripAdministrativeSuffix(token) {
  const match = token.match(/^(.*?)(특별자치도|특별자치시|특별시|광역시|도|시|구|군)$/u);
  if (!match) return token;
  const [, stem, suffix] = match;
  if (["도", "시", "구", "군"].includes(suffix) && [...stem].length === 1) return token;
  return stem;
}

function compactTokens(tokens) {
  const output = [];
  for (const token of tokens.map(stripAdministrativeSuffix).filter(Boolean)) {
    if (output.at(-1) !== token) output.push(token);
  }
  return output;
}

function getSearchDisplayName(node, frequency) {
  if ((frequency.get(node.displayName) ?? 0) === 1) return node.displayName;
  const tokens = node.segments.slice(1);
  if (node.rootKey !== "gyeonggi") {
    const root = {
      seoul: "서울",
      incheon: "인천",
      cheonan: "천안",
      asan: "아산",
      daejeon: "대전",
      daegu: "대구",
      gumi: "구미",
      pohang: "포항",
      busan: "부산",
      jeju: "제주",
    }[node.rootKey];
    if (root) tokens.unshift(root);
  }
  return compactTokens(tokens).join(" ");
}

function chooseKeywords(node, count) {
  const start = Number.parseInt(sha256(`${node.path}|h1-keywords`).slice(0, 8), 16) % H1_KEYWORDS.length;
  const step = 7;
  const output = [];
  for (let offset = 0; output.length < count; offset += 1) {
    const candidate = H1_KEYWORDS[(start + offset * step) % H1_KEYWORDS.length];
    if (!output.includes(candidate)) output.push(candidate);
  }
  return output;
}

function section(content, id) {
  const match = content.sections.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`HONHYUL_DONG_DUPLICATE_DESCRIPTION_SOURCE_MISSING:${id}`);
  return match;
}

function stripEditorialPrefix(value) {
  return value.replace(/^[^:：]{1,24}[:：]\s*/u, "").trim();
}

function copyDescriptionSources(content) {
  return [
    {
      copyId: "opening:hook:0+movement:call-preparation:paragraph:0",
      value: [
        content.hooks[0],
        stripEditorialPrefix(section(content, "call-preparation").paragraphs[0]),
      ].join(" "),
    },
    {
      copyId: "movement:schedule-check:paragraph:0+movement:course-selection:paragraph:1",
      value: [
        stripEditorialPrefix(section(content, "schedule-check").paragraphs[0]),
        stripEditorialPrefix(section(content, "course-selection").paragraphs[1]),
      ].join(" "),
    },
    {
      copyId: "movement:payment-method:paragraph:0+movement:hygiene-reference:paragraph:1",
      value: [
        stripEditorialPrefix(section(content, "payment-method").paragraphs[0]),
        stripEditorialPrefix(section(content, "hygiene-reference").paragraphs[1]),
      ].join(" "),
    },
    {
      copyId: "movement:address-hierarchy:paragraph:1+movement:first-contact-flow:paragraph:0",
      value: [
        stripEditorialPrefix(section(content, "address-hierarchy").paragraphs[1]),
        stripEditorialPrefix(section(content, "first-contact-flow").paragraphs[0]),
      ].join(" "),
    },
    {
      copyId: "movement:course-selection:paragraph:0+movement:change-recheck:paragraph:1",
      value: [
        stripEditorialPrefix(section(content, "course-selection").paragraphs[0]),
        stripEditorialPrefix(section(content, "change-recheck").paragraphs[1]),
      ].join(" "),
    },
  ];
}

function replaceRegionIdentity(value, node, searchDisplayName) {
  return value
    .replaceAll(node.qualifiedName, searchDisplayName)
    .replace(/\s+/gu, " ")
    .trim();
}

function keywordMeta(searchDisplayName, keyword, noun) {
  return [...new Set([
    `${searchDisplayName} 출장마사지`,
    `${searchDisplayName} 출장안마`,
    `${searchDisplayName} 출장 ${keyword} ${noun}`,
    `${searchDisplayName} 출장 ${keyword} 마사지`,
    `${searchDisplayName} 출장 ${keyword} 안마`,
    `${searchDisplayName} 출장홈타이`,
    `${searchDisplayName} 출장스웨디시`,
    `${searchDisplayName} 혼혈마사지`,
  ])];
}

const dongNodes = ACTIVE_REGION_NODES.filter(
  (node) => node.kind === "representative" && node.displayName.endsWith("동"),
);
if (dongNodes.length !== 913) {
  throw new Error(`HONHYUL_DONG_NODE_COUNT_INVALID:${dongNodes.length}`);
}

const frequency = new Map();
for (const node of dongNodes) {
  frequency.set(node.displayName, (frequency.get(node.displayName) ?? 0) + 1);
}

const records = [];
for (const node of dongNodes) {
  const searchDisplayName = getSearchDisplayName(node, frequency);
  const content = createRegionContent(node);
  const keywords = chooseKeywords(node, VARIANTS.length);
  const descriptions = copyDescriptionSources(content);

  for (const [variantIndex, variantId] of VARIANTS.entries()) {
    const h1Keyword = keywords[variantIndex];
    const h1Noun = NOUN_BY_VARIANT[variantId];
    const h1 = `${searchDisplayName} 출장 ${h1Keyword} ${h1Noun}`;
    const descriptionSource = descriptions[variantIndex];
    const description = replaceRegionIdentity(
      descriptionSource.value,
      node,
      searchDisplayName,
    );
    const partnerSlug = `hym-${sha256(`${node.id}|${variantId}`).slice(0, 12)}`;
    const route = `${node.path}/partner/${partnerSlug}/`;
    const canonical = new URL(route, SITE_ORIGIN).href;
    const separator = Number.parseInt(sha256(route).slice(0, 2), 16) % 2 === 0 ? " | " : " - ";
    const title = `${h1}${separator}${SITE_NAME}`;
    const metaKeywords = keywordMeta(searchDisplayName, h1Keyword, h1Noun);
    const identity = {
      baseNodeId: node.id,
      baseRoute: `${node.path}/`,
      variantId,
      partnerSlug,
      route,
      canonical,
      searchDisplayName,
      h1Keyword,
      h1Noun,
      h1,
      title,
      description,
      metaKeywords,
    };

    records.push({
      id: `honhyul-dong-duplicate-${sha256(route).slice(0, 20)}`,
      ...identity,
      provincePolicy: node.rootKey === "gyeonggi" ? "province-omitted" : "not-applicable",
      sourcePage: {
        title: content.title,
        description: content.description,
        h1: content.h1,
        metaKeywords: content.keywords,
      },
      descriptionSource: {
        copyId: descriptionSource.copyId,
        policy: "two-existing-complete-sentences-with-search-region-substitution-only",
      },
      editorialReview: {
        status: "FIRST_PASS_REVIEWED",
        ordinaryLanguage: true,
        exactTntCHeadingForm: true,
        bodyMutation: "H1_ONLY",
      },
      publishedAt: PUBLISHED_AT,
      recordSha256: sha256(JSON.stringify(identity)),
    });
  }
}

const unique = (values) => new Set(values).size === values.length;
if (records.length !== 4_565) throw new Error(`HONHYUL_DONG_DUPLICATE_COUNT_INVALID:${records.length}`);
if (!unique(records.map((record) => record.route))) throw new Error("HONHYUL_DONG_DUPLICATE_ROUTE_COLLISION");
if (!unique(records.map((record) => record.canonical))) throw new Error("HONHYUL_DONG_DUPLICATE_CANONICAL_COLLISION");
if (!unique(records.map((record) => record.title))) throw new Error("HONHYUL_DONG_DUPLICATE_TITLE_COLLISION");
if (!unique(records.map((record) => record.description))) throw new Error("HONHYUL_DONG_DUPLICATE_DESCRIPTION_COLLISION");
if (!unique(records.map((record) => record.h1))) throw new Error("HONHYUL_DONG_DUPLICATE_H1_COLLISION");
if (records.some((record) => record.provincePolicy === "province-omitted" && /경기(?:도)?/u.test(`${record.h1}\n${record.title}\n${record.description}`))) {
  throw new Error("HONHYUL_DONG_DUPLICATE_GYEONGGI_PUBLIC_NAME_RESIDUE");
}
const invalidDescriptions = records.filter(
  (record) => record.description.length < 30 || record.description.length > 180,
);
if (invalidDescriptions.length > 0) {
  throw new Error(`HONHYUL_DONG_DUPLICATE_DESCRIPTION_LENGTH_INVALID:${JSON.stringify(
    invalidDescriptions.slice(0, 10).map((record) => ({
      route: record.route,
      length: record.description.length,
      description: record.description,
    })),
  )}`);
}
if (currentCommit() !== SOURCE_COMMIT) {
  throw new Error(`HONHYUL_DONG_DUPLICATE_SOURCE_COMMIT_MISMATCH:${currentCommit()}`);
}

const recordDigest = sha256(records.map((record) => record.recordSha256).join("\n"));
const ledger = {
  schemaVersion: "honhyul-dong-duplicate-ledger/v1",
  status: "PREVIEW_READY_NOT_DEPLOYED",
  generatedAt: "2026-10-07T01:40:00+09:00",
  source: {
    origin: SITE_ORIGIN,
    siteName: SITE_NAME,
    gitCommit: SOURCE_COMMIT,
    netlifyDeployId: DEPLOY_ID,
    existingPageMutationPolicy: "FORBIDDEN",
    allowedExistingFileChanges: ["/sitemap.xml", "/rss.xml"],
    deploymentRequiresOwnerApproval: true,
  },
  counts: {
    operatedDongNodes: dongNodes.length,
    newPagesPerDong: VARIANTS.length,
    newPages: records.length,
    massageH1PerDong: 2,
    anmaH1PerDong: 3,
  },
  recordDigest,
  records,
};

await mkdir(path.dirname(OUTPUT), { recursive: true });
const bytes = `${JSON.stringify(ledger, null, 2)}\n`;
const previous = await readFile(OUTPUT, "utf8").catch(() => null);
if (previous !== bytes) await writeFile(OUTPUT, bytes, "utf8");
process.stdout.write(`${JSON.stringify({
  status: "PASS",
  output: path.relative(ROOT, OUTPUT),
  dongNodes: dongNodes.length,
  records: records.length,
  recordDigest,
  bytes: Buffer.byteLength(bytes),
}, null, 2)}\n`);
