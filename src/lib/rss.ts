import { BLOG_POSTS, getBlogPostPath, type BlogPost } from "@/data/blog-posts";
import { RSS_PATH, SITE_NAME, SITE_ORIGIN } from "@/lib/metadata";

export type RssFeedItem = {
  title: string;
  link: string;
  guid: string;
  category: string;
  description: string;
  publishedAt: string;
  modifiedAt: string;
};

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function getFullPostText(post: BlogPost): string {
  const sections = post.sections.flatMap((section) => [
    section.heading,
    ...section.paragraphs,
  ]);
  return [
    post.intro,
    ...sections,
    "전화 문의 전에 확인할 항목",
    ...post.checklist,
  ].join("\n\n");
}

export const RSS_FEED_ITEMS: readonly RssFeedItem[] = BLOG_POSTS.map((post) => {
  const link = new URL(getBlogPostPath(post), SITE_ORIGIN).href;
  return {
    title: post.title,
    link,
    guid: link,
    category: post.category,
    description: getFullPostText(post),
    publishedAt: post.publishedAt,
    modifiedAt: post.modifiedAt,
  };
}).sort(
  (left, right) =>
    Date.parse(right.modifiedAt) - Date.parse(left.modifiedAt) ||
    left.link.localeCompare(right.link),
);

function toRfc822(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`HONHYEOL_RSS_INVALID_DATE:${value}`);
  return date.toUTCString();
}

function renderItem(item: RssFeedItem): string {
  return [
    "    <item>",
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${escapeXml(item.link)}</link>`,
    `      <description>${escapeXml(item.description)}</description>`,
    `      <category>${escapeXml(item.category)}</category>`,
    `      <pubDate>${escapeXml(toRfc822(item.publishedAt))}</pubDate>`,
    `      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>`,
    "    </item>",
  ].join("\n");
}

export function createRssXml(items: readonly RssFeedItem[] = RSS_FEED_ITEMS): string {
  if (items.length === 0) throw new Error("HONHYEOL_RSS_EMPTY");
  const lastBuildDate = items.reduce((latest, item) =>
    Date.parse(item.modifiedAt) > Date.parse(latest) ? item.modifiedAt : latest,
  items[0].modifiedAt);
  const feedUrl = new URL(RSS_PATH, SITE_ORIGIN).href;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${SITE_NAME} 최신 안내`)}</title>`,
    `    <link>${escapeXml(new URL("/", SITE_ORIGIN).href)}</link>`,
    `    <description>${escapeXml(`${SITE_NAME}가 발행한 이용 안내와 준비 항목`)}</description>`,
    "    <language>ko-KR</language>",
    `    <lastBuildDate>${escapeXml(toRfc822(lastBuildDate))}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...items.map(renderItem),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
