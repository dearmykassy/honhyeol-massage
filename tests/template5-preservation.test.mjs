import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const FROZEN_FILES = {
  "src/lib/content.ts": "a5c7d26a6ceb3dc6010d7eea0167f62ba136be3b1047f63d06f31d43fd528646",
  "src/lib/metadata.ts": "b2faa996ff3c7814758d2adff878e9dc7335b5f2f058ea35e7599558c6de7bd6",
  "src/lib/site-content.ts": "b603357d97a341e6c51758807c3848ee498df4c5185680d3636c1f1d5d1d2d5b",
  "src/lib/business.ts": "e7aee4fa46ff37d76c50b004c9beb34c7234a61dd94968d4e5eac7272ebbe041",
  "src/lib/regions.ts": "cffe86ea1961bcb268ed4c8d575c982ae64fba5f60bfdd768d0b647553422e4b",
  "src/lib/region-page-model.ts": "babfbe97e672851041e88ae57fa363096fb2e00fcfd0149f784516d86404afaf",
  "src/lib/regional-image-assignment.ts": "a5d86800df7d329e95000cc444cda079944ab31614e65a2c3335152386378ce2",
  "src/lib/region-search.ts": "cdf20b5775edcf70dfc9a3a52a571eb37713e590c4d1aba285b4d02aaf7b1662",
  "src/lib/blog-schema.ts": "0374bca267b926ea72691294d96934d1607051cb156752e6e20cf6c7b9879f72",
  "src/data/blog-posts.ts": "e03ecbc11d7b2a6c50abb6093d7cbf7862a2ae6f0b70711e9b5a22efb321d7e6",
  "src/data/capital-regions.generated.json": "0242e5d86894321cba66b7f747675115520d856c7aaada870869e19f247500d2",
  "src/data/service-city-regions.generated.json": "72a318974585509632ba229307a954d01c40adcb8d98ff4ba6fbd1f1655f0d3d",
  "src/data/service-city-region-redirects.generated.json": "53249fbc2541f96c4ef725797436a56b64cb4bdb6a94ea58c3d32974f0ed8125",
  "src/data/regional-image-focal-points.template4.json": "9a51cd75887030a151a7882fe6dfef1f402d0093745beddc045fb22d0ea71cf1",
  "src/app/sitemap.ts": "2f4bed86232c167510288a4117c8b193951d21a1c3bfe717c53fc9714b510435",
  "src/app/robots.ts": "c753bb2a278c44e141663d6a84411141c7f959933d1e231d99097fe19ff457a6",
};

const FROZEN_TREES = {
  "public/images/honhyeol-template4/home": {
    count: 16,
    digest: "164926af4b473e3b87f84e0e918cd4d6c18e075dbd5b6adc0b0f52f95ef0c8d9",
  },
  "public/images/honhyeol-template4/blog": {
    count: 2,
    digest: "656b2b95e1b595f634f3d9e36573a02d59294d8e99759b675b60af12111fb6e5",
  },
};

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

function treeDigest(relativeDirectory) {
  const absoluteDirectory = path.join(ROOT, relativeDirectory);
  const entries = listFiles(absoluteDirectory)
    .map((file) => ({
      relative: path.relative(absoluteDirectory, file).split(path.sep).join("/"),
      digest: sha256(readFileSync(file)),
    }))
    .sort((left, right) => (left.relative < right.relative ? -1 : left.relative > right.relative ? 1 : 0));
  const manifest = entries.map(({ relative, digest }) => `${relative}\0${digest}\n`).join("");
  return { count: entries.length, digest: sha256(manifest) };
}

describe("Template5 visual-only migration preservation", () => {
  it("keeps region, metadata, search, business and focal-crop sources byte-identical", () => {
    for (const [relative, expected] of Object.entries(FROZEN_FILES)) {
      expect(sha256(readFileSync(path.join(ROOT, relative))), relative).toBe(expected);
    }
  });

  it("keeps every frozen Template4 source and editorial image byte-identical", () => {
    for (const [relative, expected] of Object.entries(FROZEN_TREES)) {
      expect(treeDigest(relative), relative).toEqual(expected);
    }
  });
});
