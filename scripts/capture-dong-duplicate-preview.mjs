#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const originArgument = process.argv.find((argument) => argument.startsWith("--origin="));
const externalOrigin = originArgument ? new URL(originArgument.slice("--origin=".length)) : null;
if (externalOrigin && !["http:", "https:"].includes(externalOrigin.protocol)) {
  throw new Error("HONHYUL_VISUAL_ORIGIN_PROTOCOL_INVALID");
}
const qaMode = externalOrigin ? "live" : "local";
const ARTIFACT_ROOT = path.join(ROOT, `artifacts/honhyul-dong-duplicates-20261007/visual-qa/${qaMode}`);
const LEDGER_FILE = path.join(ROOT, "src/data/dong-duplicate-pages.generated.json");
const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".ico", "image/x-icon"],
  [".xml", "application/xml"],
  [".txt", "text/plain; charset=utf-8"],
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function createServer(root) {
  const resolvedRoot = path.resolve(root);
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");
      let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      if (!relative || relative.endsWith("/")) relative += "index.html";
      const file = path.resolve(resolvedRoot, relative);
      if (!file.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error("path escaped output root");
      const bytes = await readFile(file);
      response.writeHead(200, {
        "content-type": CONTENT_TYPES.get(path.extname(file)) || "application/octet-stream",
        "cache-control": "no-store",
      });
      response.end(bytes);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("not found");
    }
  });
}

const ledgerBytes = await readFile(LEDGER_FILE);
const ledger = JSON.parse(ledgerBytes);
if (ledger.records.length !== 4_565) throw new Error("HONHYUL_VISUAL_LEDGER_INVALID");
const selectorDigest = sha256(`${ledger.recordDigest}\0honhyul-dong-duplicate-visual-qa-v1`);
const selectedIndex = Number(BigInt(`0x${selectorDigest.slice(0, 16)}`) % BigInt(ledger.records.length));
const selected = ledger.records[selectedIndex];
const server = externalOrigin ? null : createServer(OUT);
if (server) await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const baseOrigin = externalOrigin?.href || `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of [
    { id: "desktop", width: 1440, height: 900 },
    { id: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const failedResponses = [];
    page.on("response", (response) => {
      if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
    });
    const url = new URL(selected.route, `${baseOrigin}/`).href;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.evaluate(async () => {
      await Promise.race([
        document.fonts?.ready || Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 5_000)),
      ]);
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    const scrollTrace = [];
    let position = 0;
    let lastHeight = 0;
    for (let pass = 0; pass < 160; pass += 1) {
      const state = await page.evaluate(({ targetY, viewportHeight }) => {
        const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        const maxY = Math.max(0, documentHeight - viewportHeight);
        window.scrollTo(0, Math.min(targetY, maxY));
        return { y: Math.round(window.scrollY), documentHeight, maxY };
      }, { targetY: position, viewportHeight: viewport.height });
      scrollTrace.push({ y: state.y, documentHeight: state.documentHeight });
      await new Promise((resolve) => setTimeout(resolve, 35));
      if (state.y >= state.maxY && state.documentHeight === lastHeight) break;
      lastHeight = state.documentHeight;
      position = Math.min(state.maxY, state.y + Math.floor(viewport.height * 0.7));
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const metrics = await page.evaluate(({ viewportId, expectedH1 }) => {
      const tolerance = 2;
      const visible = (element) => {
        if (!element) return false;
        if (element.closest('[inert], [aria-hidden="true"]')) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "1") > 0.01 && rect.width > 0 && rect.height > 0;
      };
      const box = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      };
      const intersects = (left, right) => left && right &&
        Math.min(left.right, right.right) - Math.max(left.left, right.left) > tolerance &&
        Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top) > tolerance;
      const contains = (outer, inner) => outer && inner &&
        inner.left >= outer.left - tolerance && inner.right <= outer.right + tolerance &&
        inner.top >= outer.top - tolerance && inner.bottom <= outer.bottom + tolerance;
      const all = [...document.querySelectorAll("body *")].filter(visible);
      const overflowElements = all.map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          left: rect.left,
          right: rect.right,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          allowed: ["auto", "scroll"].includes(style.overflowX),
        };
      }).filter((entry) => !entry.allowed && (
        entry.left < -tolerance ||
        entry.right > document.documentElement.clientWidth + tolerance ||
        entry.scrollWidth > entry.clientWidth + tolerance
      )).slice(0, 50);

      const cards = [...document.querySelectorAll('[class$="__detailCard"], [class$="__priceCard"], [class$="__directoryCard"]')]
        .filter(visible)
        .map((card, index) => {
          const cardBox = box(card);
          const escapedChildren = [...card.children].filter(visible).map(box).filter((child) => !contains(cardBox, child));
          return { index, className: card.className, box: cardBox, escapedChildren: escapedChildren.length };
        });
      const cardOverlaps = [];
      for (let left = 0; left < cards.length; left += 1) {
        for (let right = left + 1; right < cards.length; right += 1) {
          if (cards[left].className === cards[right].className && intersects(cards[left].box, cards[right].box)) {
            cardOverlaps.push([left, right]);
          }
        }
      }

      const sections = [...document.querySelectorAll('[class$="__information"], [class$="__contact"], [class$="__directory"], .site-footer')]
        .filter(visible)
        .map((element) => ({ className: element.className, box: box(element) }));
      const sectionOverlaps = [];
      for (let index = 0; index < sections.length - 1; index += 1) {
        if (intersects(sections[index].box, sections[index + 1].box)) sectionOverlaps.push([index, index + 1]);
      }

      const headings = [...document.querySelectorAll("h1, h2, h3")].filter(visible).map((heading) => {
        const rect = box(heading);
        const style = getComputedStyle(heading);
        const fontSize = Number.parseFloat(style.fontSize) || 16;
        const parsedLineHeight = Number.parseFloat(style.lineHeight);
        const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.3;
        return {
          text: heading.textContent.trim(),
          className: heading.className,
          lineCount: Math.max(1, Math.round(rect.height / lineHeight)),
          scrollWidth: heading.scrollWidth,
          clientWidth: heading.clientWidth,
        };
      });
      const directoryGrid = document.querySelector('[class$="__directoryGrid"]');
      const directoryColumns = directoryGrid
        ? getComputedStyle(directoryGrid).gridTemplateColumns.split(/\s+/u).filter(Boolean).length
        : 0;
      const hero = document.querySelector('[class*="__hero"]');
      const header = document.querySelector(".site-header");
      const nav = document.querySelector(".desktop-nav, .mobile-quick-nav");
      const heroStyle = hero ? getComputedStyle(hero) : null;
      return {
        viewportId,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        documentHeight: document.documentElement.scrollHeight,
        h1: document.querySelector("h1")?.textContent.trim() || null,
        h1Matches: document.querySelector("h1")?.textContent.trim() === expectedH1,
        overflowElements,
        cardCount: cards.length,
        escapedCardChildren: cards.filter((card) => card.escapedChildren > 0),
        cardOverlaps,
        sections,
        sectionOverlaps,
        headings,
        directoryColumns,
        headerHeroOverlap: intersects(box(header), box(hero)) || intersects(box(nav), box(hero)),
        heroBackgroundImage: heroStyle?.backgroundImage || null,
        heroBackgroundPosition: heroStyle?.backgroundPosition || null,
        staticControls: document.querySelectorAll("script[data-honhyul-static-controls]").length,
      };
    }, { viewportId: viewport.id, expectedH1: selected.h1 });

    const failures = [];
    if (!metrics.h1Matches) failures.push("h1-mismatch");
    if (metrics.documentWidth > metrics.viewportWidth + 1 || metrics.overflowElements.length > 0) failures.push("horizontal-overflow");
    if (metrics.escapedCardChildren.length > 0) failures.push("card-descendant-outside-card");
    if (metrics.cardOverlaps.length > 0) failures.push("card-card-overlap");
    if (metrics.sectionOverlaps.length > 0) failures.push("section-overlap");
    if (metrics.headerHeroOverlap) failures.push("header-content-overlap");
    if (!metrics.heroBackgroundImage || metrics.heroBackgroundImage === "none") failures.push("hero-image-missing");
    const faceSafePositions = String(metrics.heroBackgroundPosition || "")
      .split(",")
      .map((value) => value.trim());
    if (viewport.id === "mobile" && (
      faceSafePositions.length === 0 ||
      faceSafePositions.some((value) => value !== "100% 0%")
    )) {
      failures.push(`mobile-face-safe-position:${metrics.heroBackgroundPosition}`);
    }
    if (metrics.staticControls !== 1) failures.push("static-controls-missing");
    if (failedResponses.length > 0) failures.push(`failed-responses:${failedResponses.length}`);
    if (viewport.id === "mobile" && metrics.directoryColumns !== 0 && metrics.directoryColumns !== 2) {
      failures.push(`mobile-directory-columns:${metrics.directoryColumns}`);
    }
    const headingLimit = viewport.id === "desktop" ? 3 : 4;
    if (metrics.headings.some((heading) => heading.scrollWidth > heading.clientWidth + 1 || heading.lineCount > headingLimit)) {
      failures.push("heading-clipped-or-excessive-wrap");
    }

    await mkdir(ARTIFACT_ROOT, { recursive: true });
    const screenshotFile = path.join(ARTIFACT_ROOT, `honhyul-dong-duplicate-${viewport.id}-full.png`);
    await page.screenshot({ path: screenshotFile, fullPage: true });
    const screenshotBytes = await readFile(screenshotFile);
    results.push({
      viewport,
      url,
      screenshotFile,
      screenshotSha256: sha256(screenshotBytes),
      scrollTrace,
      failedResponses,
      metrics,
      failures,
      status: failures.length === 0 ? "PASS" : "FAIL",
    });
    await page.close();
  }
} finally {
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
}

const failures = results.flatMap((result) => result.failures.map((failure) => ({ viewport: result.viewport.id, failure })));
const receipt = {
  schemaVersion: `honhyul-dong-duplicate-${qaMode}-visual-qa/v1`,
  contractId: "platform-representative-region-visual-qa-v1",
  status: failures.length === 0 ? "PASS" : "FAIL",
  deploymentStatus: externalOrigin ? "DEPLOYED_LIVE_VERIFIED" : "NOT_DEPLOYED_OWNER_REVIEW_REQUIRED",
  projectId: "honhyul-dong-duplicates-20261007",
  ledgerSha256: sha256(ledgerBytes),
  selectorDigest,
  selectedIndex,
  selectedRoute: selected.route,
  selectedCanonical: selected.canonical,
  results,
  failures,
  checkedAt: new Date().toISOString(),
};
await writeFile(path.join(ARTIFACT_ROOT, "receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({
  status: receipt.status,
  deploymentStatus: receipt.deploymentStatus,
  selectedRoute: receipt.selectedRoute,
  screenshots: results.map((result) => ({
    viewport: result.viewport.id,
    file: result.screenshotFile,
    sha256: result.screenshotSha256,
    failures: result.failures,
  })),
}, null, 2)}\n`);
if (receipt.status !== "PASS") process.exitCode = 1;
