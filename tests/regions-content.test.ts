import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BROAD_DETAIL_SECTION_IDS,
  COMPACT_DETAIL_SECTION_IDS,
  createRegionContent,
  isBroadDetailRegion,
  REGION_KEYWORD_SUFFIXES,
} from "@/lib/content";
import {
  ACTIVE_REGION_NODES,
  ACTIVE_ROOT_KEYS,
  getDirectChildren,
  getKeywordRegionLabel,
  getParentNode,
  getSearchRegionLabel,
  shortenRegionSearchName,
} from "@/lib/regions";
import {
  getRegionalImageAssetId,
  getRegionalImageAssetNumber,
  getRegionalImageAssetPath,
  REGIONAL_IMAGE_ASSET_COUNT,
} from "@/lib/regional-image-assignment";
import { createRegionPageModel } from "@/lib/region-page-model";

const FORBIDDEN_BRANDS = [
  "필링홈타이",
  "랑테라피",
  "마사지봄",
  "마사지러브",
  "콜미토닥이",
  "건마에반하다",
  "GEONMAE BANHADA",
  "geonmae-banhada",
  "gmb-t4",
] as const;

const FORBIDDEN_COPY = [
  ...FORBIDDEN_BRANDS,
  "한눈에",
  "차분하게",
  "부담 없이",
  "맞춤",
  "여유롭게",
  "특별한",
  "섬세한",
  "나만의",
  "프리미엄",
  "최고",
  "완벽",
  "즉시",
  "도착 예정",
  "도착 시간",
  "도착시간",
  "배정 완료",
  "출발 완료",
  "위치 지도",
  "세부 매장 권역",
  "이용이 많은 장소",
  "주요 서비스 권역",
  "인기",
  "후기",
  "리뷰",
  "평점",
  "지역별 이용량",
  "이동 시간",
  "이동시간",
  "실제 지역 그래프",
  "대표 페이지",
  "행정동 원장",
  "행정동 정보",
  "시을",
  "구을",
  "도을",
  "동를",
  "읍를",
  "면를",
  "분수",
] as const;

const BROAD_ROUTE_SHA256 = "bc78efbc93abacd5dca4aea0e06897343d9858ea8d5efb85c1fd9733fe436771";

function normalizeRegionalCopy(
  value: string,
  node: (typeof ACTIVE_REGION_NODES)[number],
): string {
  const regionLabels = [
    node.qualifiedName,
    node.displayName,
    getSearchRegionLabel(node),
    getKeywordRegionLabel(node),
  ]
    .filter((label, index, labels) => label.length > 0 && labels.indexOf(label) === index)
    .sort((left, right) => right.length - left.length);

  return regionLabels
    .reduce((copy, label) => copy.replaceAll(label, "{지역}"), value)
    .replaceAll("혼혈마사지", "{브랜드}")
    .replace(/\s+/gu, " ")
    .trim();
}

function maximumFrequency(values: readonly string[]): number {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Math.max(...counts.values());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function hasFinalConsonant(value: string): boolean {
  const codePoint = value.trim().codePointAt(value.trim().length - 1);
  return codePoint !== undefined && codePoint >= 0xac00 && codePoint <= 0xd7a3
    ? (codePoint - 0xac00) % 28 !== 0
    : false;
}

describe("MassageBom-equivalent regional graph", () => {
  it("keeps the exact source snapshots and canonical 1,291-route set", () => {
    const snapshots = [
      ["capital-regions.generated.json", "0242e5d86894321cba66b7f747675115520d856c7aaada870869e19f247500d2"],
      ["service-city-regions.generated.json", "72a318974585509632ba229307a954d01c40adcb8d98ff4ba6fbd1f1655f0d3d"],
    ] as const;

    for (const [fileName, expectedSha256] of snapshots) {
      const bytes = readFileSync(path.join(process.cwd(), "src/data", fileName));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(expectedSha256);
    }

    const sortedRouteSet = ACTIVE_REGION_NODES.map((node) => node.path).sort().join("\n");
    expect(createHash("sha256").update(sortedRouteSet).digest("hex")).toBe(
      "8a80b8a8d68fd6e1f0db9e4c662c82d3dafd24b7a70a532fe8f71b0d16d8c29d",
    );
  });

  it("keeps the exact hierarchy and direct-child links", () => {
    expect(ACTIVE_ROOT_KEYS).toHaveLength(11);
    expect(ACTIVE_REGION_NODES).toHaveLength(1291);
    expect(new Set(ACTIVE_REGION_NODES.map((node) => node.path)).size).toBe(1291);
    expect(ACTIVE_REGION_NODES.filter((node) => node.kind === "root")).toHaveLength(11);
    expect(ACTIVE_REGION_NODES.filter((node) => node.kind === "hub")).toHaveLength(127);
    expect(ACTIVE_REGION_NODES.filter((node) => node.kind === "representative")).toHaveLength(1153);
    expect(
      ACTIVE_REGION_NODES.filter((node) => node.kind !== "representative")
        .every((node) => getDirectChildren(node).length > 0),
    ).toBe(true);
  });

  it("assigns 130 branded assets without parent or sibling collisions", () => {
    const usage = new Map<number, number>();
    for (const node of ACTIVE_REGION_NODES) {
      const asset = getRegionalImageAssetNumber(node);
      usage.set(asset, (usage.get(asset) ?? 0) + 1);
      expect(getRegionalImageAssetId(node)).toMatch(/^hym-t4-rgn-\d{3}-v1$/u);
      expect(getRegionalImageAssetPath(node)).toMatch(
        /^\/assets\/honhyeol-massage\/template4-regional\/hym-t4-rgn-\d{3}-v1\/desktop\.webp$/u,
      );

      const parent = getParentNode(node);
      if (parent) expect(asset).not.toBe(getRegionalImageAssetNumber(parent));
      const childAssets = getDirectChildren(node).map((child) => {
        const childNode = ACTIVE_REGION_NODES.find((candidate) => candidate.path === child.path);
        expect(childNode).toBeDefined();
        return getRegionalImageAssetNumber(childNode!);
      });
      expect(new Set(childAssets).size).toBe(childAssets.length);
    }

    expect(usage.size).toBe(REGIONAL_IMAGE_ASSET_COUNT);
    const distribution = [...usage.values()].reduce(
      (counts, count) => counts.set(count, (counts.get(count) ?? 0) + 1),
      new Map<number, number>(),
    );
    expect(distribution.get(10)).toBe(121);
    expect(distribution.get(9)).toBe(9);
  });
});

describe("broad-detail classifier", () => {
  const broad = ACTIVE_REGION_NODES.filter(isBroadDetailRegion);
  const compact = ACTIVE_REGION_NODES.filter((node) => !isBroadDetailRegion(node));

  it("locks the exact owner-approved rule and 41-route set", () => {
    for (const node of ACTIVE_REGION_NODES) {
      expect(isBroadDetailRegion(node)).toBe(node.kind === "root" || /시$/u.test(node.displayName));
    }
    expect(broad).toHaveLength(41);
    expect(compact).toHaveLength(1250);
    expect(broad.filter((node) => node.kind === "root")).toHaveLength(11);
    expect(broad.filter((node) => node.kind !== "root" && /시$/u.test(node.displayName))).toHaveLength(30);
    expect(broad.every((node) => !/[구군동읍면]$/u.test(node.displayName))).toBe(true);

    const routeSet = broad.map((node) => node.path).sort().join("\n");
    expect(createHash("sha256").update(routeSet).digest("hex")).toBe(BROAD_ROUTE_SHA256);
  });

  it("gives broad and compact routes their exact allowed section sets", () => {
    for (const node of broad) {
      const content = createRegionContent(node);
      expect(content.detailMode).toBe("broad");
      expect(content.sections.map((section) => section.id)).toEqual(BROAD_DETAIL_SECTION_IDS);
      expect(content.sections).toHaveLength(9);
    }
    for (const node of compact) {
      const content = createRegionContent(node);
      expect(content.detailMode).toBe("compact");
      expect(content.sections.map((section) => section.id)).toEqual(COMPACT_DETAIL_SECTION_IDS);
      expect(content.sections).toHaveLength(COMPACT_DETAIL_SECTION_IDS.length);
    }
  });
});

describe("Honhyeol Massage regional copy and metadata", () => {
  const records = ACTIVE_REGION_NODES.map((node) => ({ node, content: createRegionContent(node) }));

  it("emits unique titles, descriptions and H1s for every route", () => {
    expect(new Set(records.map(({ content }) => content.title)).size).toBe(1291);
    expect(new Set(records.map(({ content }) => content.description)).size).toBe(1291);
    expect(new Set(records.map(({ content }) => content.h1)).size).toBe(1291);
  });

  it("emits the required eight-keyword family", () => {
    for (const { node, content } of records) {
      const label = getKeywordRegionLabel(node);
      expect(content.keywords).toEqual(REGION_KEYWORD_SUFFIXES.map((suffix) => `${label}${suffix}`));
      expect(new Set(content.keywords).size).toBe(8);
    }
  });

  it("uses concise customer search names in all three regional meta fields", () => {
    const examples = new Map([
      ["서울특별시", "서울"],
      ["인천광역시", "인천"],
      ["경기도", "경기"],
      ["제주특별자치도", "제주"],
      ["수원시", "수원"],
      ["천안시", "천안"],
    ]);
    for (const [official, concise] of examples) {
      expect(shortenRegionSearchName(official)).toBe(concise);
    }

    const forbiddenBeforeService =
      /(?:특별자치도|특별자치시|특별시|광역시|도|시)\s*(?=출장마사지|출장안마|출장타이마사지|출장스웨디시|출장홈타이)/u;
    for (const { node, content } of records) {
      const searchLabel = getSearchRegionLabel(node);
      const keywordLabel = getKeywordRegionLabel(node);
      const metaSurface = [content.title, content.description, ...content.keywords].join("\n");

      expect(content.title).toContain(keywordLabel);
      expect(content.description).toContain(searchLabel);
      expect(content.keywords.every((keyword) => keyword.startsWith(keywordLabel))).toBe(true);
      expect(metaSurface).not.toMatch(forbiddenBeforeService);
      expect(content.h1).toContain(node.qualifiedName);
    }
  });

  it("keeps every route's visible hooks, headings and paragraphs unique", () => {
    const hooks = records.flatMap(({ content }) => content.hooks);
    const headings = records.flatMap(({ content }) => content.sections.map((section) => section.heading));
    const paragraphs = records.flatMap(({ content }) => content.sections.flatMap((section) => section.paragraphs));

    expect(hooks).toHaveLength(2582);
    expect(new Set(hooks).size).toBe(2582);
    expect(headings).toHaveLength(14119);
    expect(new Set(headings).size).toBe(14119);
    expect(paragraphs).toHaveLength(28238);
    expect(new Set(paragraphs).size).toBe(28238);
  });

  it("gives every compact route a substantial factual regional body", () => {
    const compact = records.filter(({ node }) => !isBroadDetailRegion(node));
    for (const { content } of compact) {
      expect(content.sections).toHaveLength(COMPACT_DETAIL_SECTION_IDS.length);
      expect(content.sections.flatMap((section) => section.paragraphs)).toHaveLength(22);
      for (const section of content.sections) {
        expect(section.paragraphs[0]).not.toBe(section.paragraphs[1]);
      }
      expect(
        content.sections.flatMap((section) => section.paragraphs).join("").length,
      ).toBeGreaterThanOrEqual(1050);
    }
  });

  it("keeps normalized compact paragraph slots below the 128-page reuse cap", () => {
    const compact = records.filter(({ node }) => !isBroadDetailRegion(node));
    for (let sectionIndex = 0; sectionIndex < COMPACT_DETAIL_SECTION_IDS.length; sectionIndex += 1) {
      for (let paragraphIndex = 0; paragraphIndex < 2; paragraphIndex += 1) {
        const normalized = compact.map(({ node, content }) =>
          normalizeRegionalCopy(content.sections[sectionIndex].paragraphs[paragraphIndex], node),
        );
        expect(maximumFrequency(normalized)).toBeLessThanOrEqual(128);
      }
    }
  });

  it("keeps every normalized full-page signature distinct", () => {
    const signatures = records.map(({ node, content }) =>
      normalizeRegionalCopy(
        [content.description, ...content.hooks, ...content.sections.flatMap((section) => section.paragraphs)].join("\u001f"),
        node,
      ),
    );
    expect(new Set(signatures).size).toBe(1291);
  });

  it("rejects unsupported local claims, hype and other platform brands", () => {
    for (const { node, content } of records) {
      const model = createRegionPageModel(node);
      expect(model.semanticAdjacencyAudit.duplicateCount).toBe(0);
      const customerCopy = normalizeRegionalCopy(
        JSON.stringify({ content, rendered: model.renderedSurface }),
        node,
      );
      for (const phrase of FORBIDDEN_COPY) expect(customerCopy).not.toContain(phrase);
    }
  });

  it("uses valid Korean particles immediately after generated region names", () => {
    for (const { node, content } of records) {
      const visible = [
        content.title,
        content.description,
        content.h1,
        ...content.hooks,
        ...content.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
      ].join("\n");
      const labels = [node.qualifiedName, node.displayName]
        .filter((label, index, all) => all.indexOf(label) === index)
        .sort((left, right) => right.length - left.length);
      for (const label of labels) {
        const allowed = hasFinalConsonant(label)
          ? new Set(["은", "이", "을", "과"])
          : new Set(["는", "가", "를", "와"]);
        for (const match of visible.matchAll(new RegExp(`${escapeRegExp(label)}([은는이가을를과와])`, "gu"))) {
          expect(allowed.has(match[1]), `${node.path}: ${match[0]}`).toBe(true);
        }
      }
    }
  });

  it("renders the region directory after all content sections", () => {
    const component = readFileSync(path.join(process.cwd(), "src/components/RegionExperience.tsx"), "utf8");
    expect(component.lastIndexOf("<RegionGallery")).toBeGreaterThan(component.lastIndexOf("<section"));
  });

  it("keeps unsupported claims and source-brand residue out of customer copy files", () => {
    const customerCopyFiles = [
      "src/app/areas/page.tsx",
      "src/app/blog/page.tsx",
      "src/app/blog/[slug]/page.tsx",
      "src/app/guide/page.tsx",
      "src/app/layout.tsx",
      "src/app/notice/page.tsx",
      "src/app/page.tsx",
      "src/app/pricing/page.tsx",
      "src/components/RegionExperience.tsx",
      "src/components/RegionGallery.tsx",
      "src/components/RegionSearch.tsx",
      "src/components/SiteFooter.tsx",
      "src/components/SiteHeader.tsx",
      "src/data/blog-posts.ts",
      "src/lib/content.ts",
      "src/lib/region-page-model.ts",
      "src/lib/site-content.ts",
    ];

    for (const fileName of customerCopyFiles) {
      const source = readFileSync(path.join(process.cwd(), fileName), "utf8");
      for (const phrase of FORBIDDEN_COPY) expect(source).not.toContain(phrase);
    }
  });
});
