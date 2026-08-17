import { describe, expect, it } from "vitest";
import { metadataContract as areasMetadata } from "@/app/areas/page";
import { metadataContract as blogMetadata } from "@/app/blog/page";
import { metadataContract as guideMetadata } from "@/app/guide/page";
import { metadataContract as noticeMetadata } from "@/app/notice/page";
import { metadataContract as homeMetadata } from "@/app/page";
import { metadataContract as pricingMetadata } from "@/app/pricing/page";
import robots from "@/app/robots";
import sitemap, { FIXED_SITEMAP_PATHS } from "@/app/sitemap";
import { BLOG_POSTS, createBlogMetadata, getBlogPostPath } from "@/data/blog-posts";
import { createRegionContent } from "@/lib/content";
import {
  createRouteMetadataContract,
  DEPLOYMENT_CONTRACT,
  RSS_PATH,
  SITE_NAME,
  SITE_ORIGIN,
  SITEMAP_PATH,
  toNextMetadata,
} from "@/lib/metadata";
import { ACTIVE_REGION_NODES } from "@/lib/regions";

const FIXED_CONTRACTS = [
  homeMetadata,
  areasMetadata,
  pricingMetadata,
  guideMetadata,
  noticeMetadata,
  blogMetadata,
];

describe("metadata fields", () => {
  it("uses the approved production origin and allows indexing", () => {
    expect(SITE_ORIGIN).toBe("https://honhyul.kr");
    expect(DEPLOYMENT_CONTRACT).toEqual({
      deploymentAllowed: true,
      deploymentBlockers: [],
      origin: SITE_ORIGIN,
      sitemapUrl: new URL(SITEMAP_PATH, SITE_ORIGIN).href,
      rssUrl: new URL(RSS_PATH, SITE_ORIGIN).href,
      robots: "index,follow",
    });
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://honhyul.kr/sitemap.xml",
      host: "https://honhyul.kr",
    });
  });

  it("emits title, keywords and description on every fixed page", () => {
    expect(FIXED_CONTRACTS).toHaveLength(FIXED_SITEMAP_PATHS.length);
    for (const contract of FIXED_CONTRACTS) {
      expect(contract.title.trim().length).toBeGreaterThan(10);
      expect(contract.description.trim().length).toBeGreaterThan(30);
      expect(contract.keywords.length).toBeGreaterThanOrEqual(4);
      expect(contract.title).toContain(SITE_NAME);
      expect(contract.canonical.startsWith(SITE_ORIGIN)).toBe(true);

      const emitted = toNextMetadata(contract);
      expect(emitted.description).toBe(contract.description);
      expect(emitted.keywords).toEqual(contract.keywords);
      expect(emitted.alternates).toEqual({ canonical: contract.canonical });
      expect(emitted.openGraph).toMatchObject({
        title: contract.title,
        description: contract.description,
        url: contract.canonical,
      });
      expect(emitted.twitter).toMatchObject({
        title: contract.title,
        description: contract.description,
      });
      expect(emitted.robots).toMatchObject({ index: true, follow: true });
    }
  });

  it("emits the three metadata fields for both blog posts", () => {
    for (const post of BLOG_POSTS) {
      const emitted = createBlogMetadata(post);
      expect(emitted.title).toMatchObject({ absolute: expect.stringContaining(SITE_NAME) });
      expect(emitted.description).toBe(post.description);
      expect(emitted.keywords).toEqual([...post.keywords]);
      expect(emitted.alternates).toEqual({
        canonical: new URL(getBlogPostPath(post), SITE_ORIGIN).href,
      });
      expect(emitted.openGraph).toMatchObject({
        title: expect.stringContaining(SITE_NAME),
        description: post.description,
        url: new URL(getBlogPostPath(post), SITE_ORIGIN).href,
      });
      expect(emitted.twitter).toMatchObject({
        title: expect.stringContaining(SITE_NAME),
        description: post.description,
      });
      expect(emitted.robots).toMatchObject({ index: true, follow: true });
    }
  });

  it("emits unique complete metadata for all 1,291 regional pages", () => {
    const contracts = ACTIVE_REGION_NODES.map((node) => {
      const content = createRegionContent(node);
      return createRouteMetadataContract(
        `${node.path}/`,
        content.title,
        content.description,
        content.keywords,
      );
    });

    expect(new Set(contracts.map((contract) => contract.title)).size).toBe(1291);
    expect(new Set(contracts.map((contract) => contract.description)).size).toBe(1291);
    expect(new Set(contracts.map((contract) => contract.canonical)).size).toBe(1291);
    for (const contract of contracts) {
      expect(contract.title.length).toBeGreaterThanOrEqual(20);
      expect(contract.description.length).toBeGreaterThanOrEqual(70);
      expect(contract.keywords).toHaveLength(8);
      expect(contract.openGraph.title).toBe(contract.title);
      expect(contract.openGraph.description).toBe(contract.description);
      expect(contract.twitter.title).toBe(contract.title);
      expect(contract.twitter.description).toBe(contract.description);
    }
  });

  it("keeps title, description and keyword arrays unique across all 1,299 pages", () => {
    const fixedRecords = FIXED_CONTRACTS.map((contract) => ({
      title: contract.title,
      description: contract.description,
      keywords: JSON.stringify(contract.keywords),
    }));
    const blogRecords = BLOG_POSTS.map((post) => ({
      title: `${post.title} | ${SITE_NAME}`,
      description: post.description,
      keywords: JSON.stringify(post.keywords),
    }));
    const regionRecords = ACTIVE_REGION_NODES.map((node) => {
      const content = createRegionContent(node);
      return {
        title: content.title,
        description: content.description,
        keywords: JSON.stringify(content.keywords),
      };
    });
    const records = [...fixedRecords, ...blogRecords, ...regionRecords];

    expect(records).toHaveLength(1299);
    expect(new Set(records.map((record) => record.title)).size).toBe(1299);
    expect(new Set(records.map((record) => record.description)).size).toBe(1299);
    expect(new Set(records.map((record) => record.keywords)).size).toBe(1299);
  });
});

describe("sitemap", () => {
  it("matches six fixed routes, two posts and every active region exactly", () => {
    const output = sitemap();
    const urls = output.map((entry) => entry.url);
    expect(urls).toHaveLength(1299);
    expect(new Set(urls).size).toBe(1299);

    const expectedPaths = [
      ...FIXED_SITEMAP_PATHS,
      ...BLOG_POSTS.map(getBlogPostPath),
      ...ACTIVE_REGION_NODES.map((node) => `${node.path}/`),
    ];
    expect(new Set(urls)).toEqual(
      new Set(expectedPaths.map((path) => new URL(path, SITE_ORIGIN).href)),
    );
  });
});
