import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

const BRAND_ASSETS = [
  ["orbit-mark-v1.png", 1254, "3e662711ed94b03a064f68802fd27c38fea5a7cb76bfbb7006392db2f3989564"],
  ["orbit-mark-v1-32.png", 32, "22f169ba6208d8eeaddc8eedbad4d191306ff57aa6b09d9b1079aee7dea829e4"],
  ["orbit-mark-v1-192.png", 192, "dad3fa94ac286c657cca27ec4cee691282849e8a8b86a8f1ef33d82d21b13553"],
  ["orbit-mark-v1-512.png", 512, "b3335c8943bd77d545bde0746376fddb65eeec4f86280881a746d23ebd04e347"],
];

const REGION_HASHES = {
  seoul: "c8198550953cb54b0af187a4f6f4a1a5f9361e0d3e370fc2c6b5ec7f002397b0",
  incheon: "e55d341937634f6d6fb1f6ae74003feeb46fb66e7dd84abe12f2cf32d3c6327d",
  gyeonggi: "2ecaea44693012f9c1b3c07fab28f8be8702f81800a7eef016430d0e4bac2ed4",
  cheonan: "99abb3084046dd9de038d935bea2e6f0d992898ccac08522f65bb34c9e54f19d",
  asan: "e78eee4c66b863e3ca2018662b2a37f9d21b7723783af80e7186fcda0cdc4a2a",
  daejeon: "e2019888f96b02c4778fc5738cb9726573716d4ce6ffa7e7762113bf6d02a851",
  daegu: "336c22fa0b88a523122cddc2b75ef2bcceb6719bf8b3490779260b3384203811",
  gumi: "9dc19cbfc6f7d846555f0b5981ceaad0683395604410be9adf181547b0713bc5",
};

describe("Honhyeol independent brand and homepage region imagery", () => {
  it("uses one transparent non-heart orbital mark for header, footer and icons", async () => {
    const brandDirectory = path.join(ROOT, "public/images/honhyeol-template5/brand");
    const provenance = JSON.parse(readFileSync(path.join(brandDirectory, "provenance.v1.json"), "utf8"));
    const css = readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8");
    const layout = readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");

    expect(provenance.visualQa).toMatchObject({
      transparentBackground: true,
      notHeartShape: true,
      distinctFromGeonmaeBanhada: true,
    });
    for (const [name, size, digest] of BRAND_ASSETS) {
      const file = path.join(brandDirectory, name);
      const metadata = await sharp(file).metadata();
      expect(sha256(file), name).toBe(digest);
      expect(metadata.format, name).toBe("png");
      expect(metadata.width, name).toBe(size);
      expect(metadata.height, name).toBe(size);
      expect(metadata.hasAlpha, name).toBe(true);
    }
    expect(css).toContain('/images/honhyeol-template5/brand/orbit-mark-v1.png');
    expect(css).not.toContain('/images/honhyeol-template4/brand/mark.png');
    expect(layout).toContain('/images/honhyeol-template5/brand/orbit-mark-v1-32.png');
    expect(layout).toContain('/images/honhyeol-template5/brand/orbit-mark-v1-192.png');
    expect(layout).toContain('/images/honhyeol-template5/brand/orbit-mark-v1-512.png');
  });

  it("maps the first eight homepage cards to the approved city assets only", async () => {
    const directory = path.join(ROOT, "public/images/honhyeol-template5/home-regions/v1");
    const provenance = JSON.parse(readFileSync(path.join(directory, "provenance.json"), "utf8"));
    const page = readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");

    expect(provenance.byteIdentical).toBe(true);
    expect(provenance.assets.map(({ rootKey }) => rootKey)).toEqual(Object.keys(REGION_HASHES));
    for (const [key, digest] of Object.entries(REGION_HASHES)) {
      const file = path.join(directory, `${key}.webp`);
      const metadata = await sharp(file).metadata();
      expect(sha256(file), key).toBe(digest);
      expect(metadata.format, key).toBe("webp");
      expect(metadata.width, key).toBe(1200);
      expect(metadata.height, key).toBe(720);
      expect(page).toContain(`/images/honhyeol-template5/home-regions/v1/${key}.webp`);
    }
    expect(page).not.toContain("/images/honhyeol-template4/home/feature-");
    expect(page).toContain("/images/honhyeol-template5/home-regions/v1/provenance.json");
  });
});
