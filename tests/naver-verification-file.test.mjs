import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..");
const VERIFICATION_FILE = "naverb0a214252ba37de1f892ee8845be0250.html";
const EXPECTED_BODY = `naver-site-verification: ${VERIFICATION_FILE}\n`;

describe("Naver ownership verification file", () => {
  it("keeps the exact root path and plain-text body", () => {
    expect(
      readFileSync(path.join(ROOT, "public", VERIFICATION_FILE), "utf8"),
    ).toBe(EXPECTED_BODY);
  });
});
