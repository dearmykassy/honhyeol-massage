import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");
const PRODUCTION_ORIGIN = "https://honhyul.kr";
const EXPECTED_PUBLIC_PAGES = 1299;
const EXPECTED_REGION_PAGES = 1291;
const EXPECTED_REGIONAL_ASSETS = 130;
const EXPECTED_REGIONAL_WEBPS = 390;
const EXPECTED_RSS_ITEMS = 2;

function fail(code) {
  throw new Error(`HONHYEOL_BUILT_OUTPUT_${code}`);
}

async function walk(directory) {
  const output = [];
  for (const name of await readdir(directory)) {
    const absolute = path.join(directory, name);
    const metadata = await stat(absolute);
    if (metadata.isDirectory()) output.push(...await walk(absolute));
    else output.push(absolute);
  }
  return output;
}

const files = await walk(OUT);
const htmlFiles = files.filter((file) => path.basename(file) === "index.html");
const publicHtml = htmlFiles.filter((file) => !file.includes("/_not-found/") && !file.includes("/404/"));
const regionHtml = publicHtml.filter((file) => file.includes("/areas/") && file !== path.join(OUT, "areas", "index.html"));

if (publicHtml.length !== EXPECTED_PUBLIC_PAGES) fail(`PUBLIC_PAGE_COUNT:${publicHtml.length}`);
if (regionHtml.length !== EXPECTED_REGION_PAGES) fail(`REGION_PAGE_COUNT:${regionHtml.length}`);

const metadataChecks = {
  title: /<title>[^<]+<\/title>/u,
  description: /<meta name="description" content="[^"]+"\/>/u,
  keywords: /<meta name="keywords" content="[^"]+"\/>/u,
  canonical: new RegExp(`<link rel="canonical" href="${PRODUCTION_ORIGIN.replaceAll(".", "\\.")}\/[^"]*"\\/>`, "u"),
  openGraphTitle: /<meta property="og:title" content="[^"]+"\/>/u,
  openGraphDescription: /<meta property="og:description" content="[^"]+"\/>/u,
  openGraphUrl: /<meta property="og:url" content="[^"]+"\/>/u,
  twitterTitle: /<meta name="twitter:title" content="[^"]+"\/>/u,
  twitterDescription: /<meta name="twitter:description" content="[^"]+"\/>/u,
  robots: /<meta name="robots" content="index, follow"\/>/u,
};
const forbiddenBrands = /필링홈타이|랑테라피|마사지봄|마사지러브|콜미토닥이|건마에반하다|GEONMAE BANHADA|geonmae-banhada|gmb-t4/u;
const unsupportedLocalClaims = /위치 지도|세부 매장 권역|이용이 많은 장소|주요 서비스 권역|지역별 이용량|인기|후기|리뷰|평점|도착\s*시간|도착 예정|(?:^|[^\p{L}])이동\s*시간/u;

for (const file of publicHtml) {
  const html = await readFile(file, "utf8");
  for (const [field, pattern] of Object.entries(metadataChecks)) {
    if (!pattern.test(html)) fail(`META_${field.toUpperCase()}:${path.relative(OUT, file)}`);
  }
  if (forbiddenBrands.test(html)) fail(`OLD_BRAND:${path.relative(OUT, file)}`);
  if (unsupportedLocalClaims.test(html)) fail(`UNSUPPORTED_LOCAL_CLAIM:${path.relative(OUT, file)}`);
}

const sitemap = await readFile(path.join(OUT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]);
if (sitemapUrls.length !== EXPECTED_PUBLIC_PAGES || new Set(sitemapUrls).size !== EXPECTED_PUBLIC_PAGES) {
  fail(`SITEMAP_COUNT:${sitemapUrls.length}:${new Set(sitemapUrls).size}`);
}
if (sitemapUrls.some((url) => !url.startsWith(`${PRODUCTION_ORIGIN}/`))) fail("SITEMAP_HOST");

const robots = await readFile(path.join(OUT, "robots.txt"), "utf8");
if (
  !robots.includes("Allow: /") ||
  robots.includes("Disallow: /") ||
  !robots.includes(`Host: ${PRODUCTION_ORIGIN}`) ||
  !robots.includes(`${PRODUCTION_ORIGIN}/sitemap.xml`)
) fail("ROBOTS");

const rss = await readFile(path.join(OUT, "rss.xml"), "utf8");
if (Buffer.byteLength(rss, "utf8") >= 10 * 1024 * 1024) fail("RSS_SIZE");
const rssItems = [...rss.matchAll(/<item>[\s\S]*?<\/item>/gu)].map((match) => match[0]);
const rssLinks = rssItems.map((item) => item.match(/<link>([^<]+)<\/link>/u)?.[1]);
const rssGuids = rssItems.map((item) => item.match(/<guid isPermaLink="true">([^<]+)<\/guid>/u)?.[1]);
const expectedRssLinks = [
  `${PRODUCTION_ORIGIN}/blog/jibeseo-masaji-badeul-su-issnayo/`,
  `${PRODUCTION_ORIGIN}/blog/masaji-shop-gagi-himdeul-ttae/`,
].sort();
if (
  rssItems.length !== EXPECTED_RSS_ITEMS ||
  new Set(rssLinks).size !== EXPECTED_RSS_ITEMS ||
  rssLinks.some((url) => !url?.startsWith(`${PRODUCTION_ORIGIN}/blog/`)) ||
  JSON.stringify([...rssLinks].sort()) !== JSON.stringify(expectedRssLinks) ||
  JSON.stringify(rssGuids) !== JSON.stringify(rssLinks) ||
  rssItems.some((item) => !/<description>[^<]{200,}<\/description>/u.test(item)) ||
  rssItems.some((item) => !/<pubDate>[^<]+ GMT<\/pubDate>/u.test(item)) ||
  !rss.includes(`atom:link href="${PRODUCTION_ORIGIN}/rss.xml"`)
) fail("RSS");

const manifest = JSON.parse(await readFile(
  path.join(ROOT, "src/data/regional-image-assignments.template4.generated.json"),
  "utf8",
));
if (
  manifest.status !== "ROOT_APPROVED_RELEASED" ||
  manifest.distribution?.routes !== EXPECTED_REGION_PAGES ||
  manifest.distribution?.assets !== EXPECTED_REGIONAL_ASSETS ||
  Object.keys(manifest.routes ?? {}).length !== EXPECTED_REGION_PAGES
) {
  fail("REGIONAL_IMAGE_MANIFEST");
}

const releasedRoot = path.join(OUT, "assets/honhyeol-massage/template4-regional");
const releasedFiles = await walk(releasedRoot);
const webps = releasedFiles.filter((file) => file.endsWith(".webp"));
if (webps.length !== EXPECTED_REGIONAL_WEBPS) fail(`REGIONAL_WEBP_COUNT:${webps.length}`);
if (releasedFiles.some((file) => /geonmae-banhada|gmb-t4/u.test(file))) fail("REGIONAL_ASSET_RESIDUE");

console.log(JSON.stringify({
  status: "PASS",
  publicPages: publicHtml.length,
  regionPages: regionHtml.length,
  sitemapUrls: sitemapUrls.length,
  rssItems: rssItems.length,
  regionalAssets: manifest.distribution.assets,
  regionalWebps: webps.length,
}));
