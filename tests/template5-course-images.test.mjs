import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const IMAGE_DIRECTORY = path.join(ROOT, "public/images/honhyeol-template5/courses/v1");
const RECEIPT_PATH = path.join(
  ROOT,
  "artifacts/image-campaign/honhyeol-template5-course-cards-v1/release-receipt.v1.json",
);

const EXPECTED = [
  {
    course: "타이마사지",
    slug: "thai",
    pngSha256: "f81952db892953c99dfc0f73738c38856f9cda7c474ff26cb8620baa663e5e8c",
    webpSha256: "c4656c427e9130bc77c2856ccfcc5da3226982f16230ea2e104525190166dec2",
  },
  {
    course: "아로마마사지",
    slug: "aroma",
    pngSha256: "40173b1c578f94d0467805ecfed4dc97b03b9019aa375f5894cde45b1eed533f",
    webpSha256: "d5a88c85efdcc5c5c991fb673b9bb705a5766e5d86f7f617d6845256a64ffe1e",
  },
  {
    course: "힐링마사지",
    slug: "healing",
    pngSha256: "ae00ef02ff49755127d9b1612f022fce75776f1f536d9b13f028568d056085d5",
    webpSha256: "da03168f5b52c65156b8f831bf2ed028063d3beed4efb551cade7df7edfc3e6c",
  },
  {
    course: "스페셜마사지",
    slug: "special",
    pngSha256: "64573c8f9f233a47825d7d09094354ef27f0ae5ed4766a9f11fc07c8be576588",
    webpSha256: "2691d5891eb50ce65907bbb582b2322c697e4b5c590a787749d3557d63a178a2",
  },
  {
    course: "남성전용",
    slug: "men",
    pngSha256: "67cc18d43741c667bf011d0fc68cef17e2050b272539240581f9e6acfe1f7fe4",
    webpSha256: "5e5af405785a67b20e09e11c64761066cab1310ea9841ad49591b3f2296b22bd",
  },
];

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

describe("Template5 course-card image release", () => {
  it("contains exactly five versioned PNG originals and five optimized WebP files", () => {
    const expectedFiles = EXPECTED.flatMap(({ slug }) => [
      `course-${slug}-v1.png`,
      `course-${slug}-v1.webp`,
    ]).sort();

    expect(readdirSync(IMAGE_DIRECTORY).sort()).toEqual(expectedFiles);
  });

  it("keeps every released file byte-identical to its reviewed hash", async () => {
    for (const asset of EXPECTED) {
      const png = path.join(IMAGE_DIRECTORY, `course-${asset.slug}-v1.png`);
      const webp = path.join(IMAGE_DIRECTORY, `course-${asset.slug}-v1.webp`);

      expect(sha256(png), `${asset.course} PNG`).toBe(asset.pngSha256);
      expect(sha256(webp), `${asset.course} WebP`).toBe(asset.webpSha256);
      expect(statSync(png).size).toBeGreaterThan(statSync(webp).size);

      const metadata = await sharp(webp).metadata();
      expect(metadata.format, `${asset.course} format`).toBe("webp");
      expect(metadata.width, `${asset.course} width`).toBe(960);
      expect(metadata.height, `${asset.course} height`).toBe(1200);
    }
  });

  it("maps the five COURSE_GROUPS slots to the reviewed course images only", () => {
    const source = readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");

    for (const asset of EXPECTED) {
      expect(source).toContain(`/images/honhyeol-template5/courses/v1/course-${asset.slug}-v1.webp`);
    }
    expect(source).not.toContain("/images/honhyeol-template4/home/category-");
  });

  it("records matching provenance, course order, QA and inventory digest", () => {
    const receipt = JSON.parse(readFileSync(RECEIPT_PATH, "utf8"));
    const manifest = readdirSync(IMAGE_DIRECTORY)
      .sort()
      .map((name) => `${name}\0${sha256(path.join(IMAGE_DIRECTORY, name))}\n`)
      .join("");

    expect(receipt.status).toBe("VISUALLY_REVIEWED_RELEASED");
    expect(receipt.outputs.map((output) => output.course)).toEqual(EXPECTED.map((asset) => asset.course));
    expect(receipt.outputs.every((output) => output.visualQa === "PASS")).toBe(true);
    expect(receipt.constraints.noMirrorSelfies).toBe(true);
    expect(receipt.inventory.sha256).toBe(createHash("sha256").update(manifest).digest("hex"));
  });
});
