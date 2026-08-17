import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/rss.xml/route";
import { BLOG_POSTS, getBlogPostPath } from "@/data/blog-posts";
import { RSS_PATH, SITE_ORIGIN } from "@/lib/metadata";
import { createRssXml, escapeXml, RSS_FEED_ITEMS } from "@/lib/rss";

function itemBlocks(xml: string): string[] {
  return [...xml.matchAll(/<item>[\s\S]*?<\/item>/gu)].map((match) => match[0]);
}

describe("RSS 2.0 feed", () => {
  it("escapes XML metacharacters deterministically", () => {
    expect(escapeXml(`A&B <C> "D" 'E'`)).toBe(
      "A&amp;B &lt;C&gt; &quot;D&quot; &apos;E&apos;",
    );
  });

  it("contains exactly the canonical indexable blog posts with stable GUIDs", () => {
    const expectedUrls = BLOG_POSTS.map((post) =>
      new URL(getBlogPostPath(post), SITE_ORIGIN).href,
    ).sort();
    expect(RSS_FEED_ITEMS).toHaveLength(2);
    expect(RSS_FEED_ITEMS.map((item) => item.link)).toEqual(expectedUrls);
    expect(RSS_FEED_ITEMS.map((item) => item.guid)).toEqual(expectedUrls);
    expect(new Set(RSS_FEED_ITEMS.map((item) => item.guid)).size).toBe(2);
  });

  it("publishes the complete post body and honest source dates", () => {
    const xml = createRssXml();
    const blocks = itemBlocks(xml);
    expect(blocks).toHaveLength(BLOG_POSTS.length);
    for (const post of BLOG_POSTS) {
      const link = new URL(getBlogPostPath(post), SITE_ORIGIN).href;
      const block = blocks.find((candidate) => candidate.includes(`<link>${link}</link>`));
      expect(block).toBeDefined();
      expect(block).toContain(`<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`);
      expect(block).toContain(escapeXml(post.intro));
      for (const section of post.sections) {
        expect(block).toContain(escapeXml(section.heading));
        for (const paragraph of section.paragraphs) {
          expect(block).toContain(escapeXml(paragraph));
        }
      }
      for (const entry of post.checklist) expect(block).toContain(escapeXml(entry));
    }
  });

  it("serves a small static RSS document with the correct media type", async () => {
    const response = GET();
    const xml = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new TextEncoder().encode(xml).byteLength).toBeLessThan(10 * 1024 * 1024);
    expect(xml).toContain(`<atom:link href="${new URL(RSS_PATH, SITE_ORIGIN).href}" rel="self" type="application/rss+xml" />`);
    const netlify = readFileSync("netlify.toml", "utf8");
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    expect(netlify).toContain('for = "/rss.xml"');
    expect(netlify).toContain('Content-Type = "application/rss+xml; charset=utf-8"');
    expect(layout).toContain('rel="alternate"');
    expect(layout).toContain('type="application/rss+xml"');
    expect(layout).toContain('href={`${SITE_ORIGIN}/rss.xml`}');
  });
});
