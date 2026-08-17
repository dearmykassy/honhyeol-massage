import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN = "artifacts/image-campaign/honhyeol-template4-mirror-selfie-v1";
const GENERATED_ROOT = "/Users/ssm/.codex/generated_images/01a00dab-b50b-7682-800a-858cffec93bc";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function writeNewOrExact(relativePath, bytes) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await writeFile(absolutePath, bytes, { flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existing = await readFile(absolutePath);
    if (!existing.equals(bytes)) throw new Error(`GENERATION_RECEIPT_DRIFT:${relativePath}`);
  }
}

const parentRegionalPaths = new Map(Object.entries({
  "066": "exec-b2084e34-347d-408a-bebf-c2c0a8c66022.png",
  "067": "exec-4c6139d6-2e98-4ecd-bb9f-6685ca38ca74.png",
  "068": "exec-469bbde9-0041-47df-8fca-6b041932f38b.png",
  "069": "exec-0e297554-d9b7-4cf8-ae7b-27f3be4a7c58.png",
  "070": "exec-b372268d-24e0-4586-94b7-f5bf77dd0cb3.png",
  "071": "exec-23a255c4-621c-46df-a22e-1515bbbbda59.png",
  "084": "exec-42d9fdde-305e-4213-b9a7-293e9eacf458.png",
  "085": "exec-c42dd836-c064-491c-a55c-6d8196f32302.png",
  "086": "exec-212ec605-aaf2-4429-a35d-c5c1397e70f0.png",
  "087": "exec-576836c4-2990-4ff9-bf62-dbcd50c344d0.png",
  "088": "exec-c5610f7c-1411-49c3-b385-c71d2bfd33ab.png",
  "089": "exec-7d1428d4-df59-4c8f-8553-ce5b386e7edf.png",
  "090": "exec-1c930c83-f99f-42a5-b619-e47714915993.png",
  "091": "exec-4507cd5c-92b3-4928-8216-f7f2a44f0c84.png",
  "092": "exec-6eff6398-1c57-41f0-9d1b-1d5fc6c76049.png",
  "093": "exec-cba05371-f72d-4745-bc06-e088d0e9b786.png",
  "094": "exec-a9766a8c-1b26-45fd-b9c9-1b28c0fb52c8.png",
  "095": "exec-3e49de20-442b-4aae-a0b4-15c9e4456b7f.png",
  "096": "exec-cbca5c36-ce2c-4349-b89c-b99b8ed4abcc.png",
  "097": "exec-3fb9b8ba-602b-45e1-b955-3bb554eb29c7.png",
  "098": "exec-accfdb48-3d2e-4e60-ba61-9c99469213f9.png",
  "099": "exec-b9c8c108-ef0a-4315-b577-577755498091.png",
  "100": "exec-d588f977-4989-49fb-8add-3e01edb6e9bf.png",
  "101": "exec-e8b2589d-9edb-4532-b7f0-c1407b9eb507.png",
  "102": "exec-c9612e34-4e0e-4650-84a9-d5840308e653.png",
  "103": "exec-98c7c8d1-14ec-484f-b6ed-dd8ad458e579.png",
  "104": "exec-a1963d61-fe4a-4b20-8572-7371c06e89ed.png",
  "105": "exec-6f5f9857-2c0c-4f65-bde9-746d52ffc34d.png",
  "106": "exec-e900014d-3ae0-41f0-8411-74177798d7ba.png",
  "107": "exec-c2136b62-cc2f-4a73-be0b-dda13fe056da.png",
  "108": "exec-6ca1dd9e-1530-42c6-b8ff-40493a31c097.png",
  "109": "exec-53b07f8b-3dc9-49c0-86a5-a5638a69b334.png",
  "110": "exec-5eacf169-afb8-44b0-a381-161ed224a7ac.png",
  "111": "exec-8ea110f1-cbb1-42ba-ad17-46090d4f08d9.png",
  "112": "exec-ee841ee2-282a-49bc-af42-7b978c5a0808.png",
  "113": "exec-bd1e0c2a-0f1c-4c04-a3bd-d536f5b968de.png",
  "114": "exec-9f6ad373-d9e9-498c-837a-db112c02c7bc.png",
  "115": "exec-90d61db2-831d-4b2f-83a5-dce6761b7e1a.png",
  "116": "exec-352bfcda-0656-4610-869c-aec8bcd274b7.png",
  "117": "exec-9ff6f15e-58f2-41ac-9d2d-7b9381f9a0fe.png",
  "118": "exec-0695a830-6dd0-4da8-8a47-e8d09ca5646b.png",
  "119": "exec-c3317ccb-d20f-4b89-a103-e431c030ef5b.png",
  "120": "exec-166f2163-df4a-4520-9d0b-61951534ab45.png",
  "121": "exec-aa013e10-83d3-42e7-9396-26336cc04d28.png",
  "122": "exec-15e2cdfb-d467-48bc-b5b8-78e32c97f9d7.png",
  "123": "exec-be606746-0b65-4985-a5ca-5359d7c7e129.png",
  "124": "exec-97726c92-bb2b-4fa7-b9bb-02c41a7967dd.png",
  "125": "exec-d8a9277d-5e14-4445-b78a-5dde1e9de197.png",
  "126": "exec-12e1d6f2-3a24-428d-93b6-a1e799d8a2fd.png",
  "127": "exec-af099002-1d3e-47f9-b4a1-bd40d1306e73.png",
  "128": "exec-daaaf681-0fe3-4748-9adb-eacaf9175780.png",
  "129": "exec-bada9395-464a-4fc7-9e3b-0e0031e78cb2.png",
  "130": "exec-7a8067b8-9cd4-4940-bcfb-0586795e8ded.png",
}));

const settings = ["sage-green and pale limestone boutique fitting lounge", "cream travertine hotel wardrobe vestibule", "muted teal gallery dressing alcove", "cocoa wood and brushed steel fitting studio", "pale lavender plaster dressing room", "charcoal stone boutique foyer", "soft apricot and light oak wardrobe niche", "deep forest-green fashion studio", "ivory terrazzo and walnut dressing lounge", "dusty blue hotel entry dressing area", "warm greige gallery changing space", "burgundy lacquer and pale stone fitting lounge", "sandstone and matte bronze dressing alcove", "slate-blue editorial wardrobe room", "olive microcement and oak fitting studio", "warm white and dark cherry dressing gallery"];
const mirrors = ["large rounded-rectangle mirror with three crisp frame edges visible", "full-outline arched mirror with a slim bronze frame", "wide oval mirror with its complete perimeter visible", "tall capsule mirror with three satin-metal edges visible", "large square mirror with all four clean corners visible", "wide frameless mirror with three clearly traced edges", "full-height rectangular mirror with a subtle backlit outline", "large circular mirror with at least eighty percent of its rim visible", "asymmetric beveled mirror with a clearly visible physical edge", "three-panel boutique mirror with both seams and the top frame visible"];
const sexyOutfits = ["fitted dark-olive long-sleeve midi dress with a modest neckline", "opaque espresso knit top with a tailored midi skirt", "fitted burgundy mock-neck dress below the knee", "fully opaque charcoal ribbed dress with long sleeves", "dark teal fitted blouse with high-waisted tailored trousers", "muted plum long-sleeve wrap-style dress with a secure modest neckline", "cocoa fitted cardigan fully buttoned with a knee-length skirt", "navy fine-knit mock-neck top with cream tailored trousers", "deep rose long-sleeve jersey dress below the knee", "black fitted blazer over an opaque high-neck camisole and tailored trousers", "stone-gray fitted knit with a dark midi skirt", "warm taupe long-sleeve dress with a clean modest neckline"];
const modestOutfits = ["opaque cream mock-neck knit with slate tailored trousers", "soft lilac long-sleeve blouse with a charcoal midi skirt", "muted teal cardigan fully buttoned with cream straight trousers", "cinnamon high-neck knit with a below-knee skirt", "dusty blue opaque blouse with dark tailored trousers", "warm-gray long-sleeve jersey dress below the knee", "forest-green mock-neck top with sand tailored trousers", "deep navy fully covered knit dress with long sleeves", "stone-beige blouse with burgundy straight trousers", "charcoal cardigan fully buttoned with a pale midi skirt", "muted rose high-neck knit with espresso tailored trousers", "olive blouse with full sleeves and a dark knee-length skirt"];
const sexyPoses = ["standing in a confident knee-up three-quarter pose", "standing with one hip gently shifted and the free hand relaxed", "standing slightly angled with one shoulder turned toward the mirror", "standing upright with the free hand resting naturally at the waist", "standing a step back so the full mirror outline reads clearly", "standing in a composed mid-thigh fashion portrait", "standing diagonally with a calm self-assured expression", "standing centered with a natural relaxed posture"];
const modestPoses = ["standing naturally in a calm knee-up portrait", "standing a step back with the mirror outline fully readable", "standing slightly angled with the free hand relaxed", "standing upright in a simple mid-thigh portrait", "standing diagonally with a neutral expression", "standing centered-right in a relaxed everyday pose", "standing with shoulders level and both arms naturally placed", "standing in a composed three-quarter view"];

function regionalPrompt(index) {
  if (index === 66) return `Use case: photorealistic-natural\nAsset type: regional page responsive hero photograph\nPrimary request: a contemporary mirror selfie of one clearly adult woman age 27-34, photographed as a believable casual editorial image\nScene/backdrop: a clean sage-green and pale limestone boutique fitting lounge, with no bed and no bathroom fixtures\nSubject: one adult woman holding a modern unbranded smartphone beside her face so most facial features remain visible; natural anatomy, two hands only\nStyle/medium: photorealistic natural photography with realistic skin and fabric texture\nComposition/framing: landscape 16:9, waist-to-knee framing; a beautiful large rounded rectangular physical mirror is unmistakable and occupies at least half the image, with three frame edges visible and an obvious reflection; subject and phone remain inside the central 55% for desktop, tablet, and mobile crops\nLighting/mood: soft indirect daylight, restrained, calm\nColor palette: sage, limestone, muted espresso\nWardrobe: fully opaque fitted dark-olive midi dress with long sleeves and a modest neckline; confident fashion pose, tasteful mildly sexy impression through silhouette only\nConstraints: clearly adult; fully clothed and non-explicit; real visible mirror and coherent reflection; no copied identity; no text, logo, watermark, signage, or readable phone screen; no bed, toilet, shower, lingerie, cleavage-focused framing, fetish styling, duplicate person, duplicate reflection, or malformed anatomy`;
  const idx = index - 66;
  const sexy = index <= 83;
  const outfit = (sexy ? sexyOutfits : modestOutfits)[(idx * 5) % 12];
  const pose = (sexy ? sexyPoses : modestPoses)[(idx * 3) % 8];
  return `Use case: photorealistic-natural\nAsset type: regional page responsive hero photograph\nPrimary request: a contemporary mirror selfie of one clearly adult woman age 27-34, captured as believable casual editorial photography\nScene/backdrop: a clean ${settings[idx % settings.length]}, with no bed and no bathroom fixtures\nSubject: one adult woman holding a modern unbranded smartphone beside her ${sexy ? "face so most facial features remain visible" : "cheek rather than directly over her face, leaving her adult facial features visible"}; natural anatomy, two hands only\nStyle/medium: photorealistic natural photography with realistic skin and fabric texture\nComposition/framing: landscape 16:9, waist-to-knee framing; a beautiful physical ${mirrors[(idx * 3) % mirrors.length]} is unmistakable and occupies at least half the image, with an obvious coherent reflection; subject and phone stay inside the central 55% for desktop, tablet, and mobile crops\nLighting/mood: ${idx % 3 === 0 ? "soft indirect daylight" : idx % 3 === 1 ? "restrained warm evening light" : "balanced window light with soft shadows"}, calm and ${sexy ? "natural" : "practical"}\nColor palette: ${settings[idx % settings.length]}\nWardrobe: ${outfit}\nPose: ${pose}\nStyling intent: ${sexy ? "tasteful mildly sexy impression through a fully clothed fitted silhouette and confident fashion pose only" : "restrained everyday fashion, fully clothed and non-suggestive"}\nConstraints: clearly adult; fully clothed, opaque, and non-explicit; real visible mirror and coherent reflection; no copied identity; no text, logo, watermark, signage, or readable phone screen; no bed, toilet, shower, bathroom, lingerie, cleavage-focused framing, fetish styling, duplicate person, duplicate reflection, or malformed anatomy`;
}

const editorial = new Map(Object.entries({
  "hym-t4-feature-02-v1": "exec-2c11b4af-0b74-4d83-8562-67390b713bfb.png",
  "hym-t4-feature-04-v1": "exec-5137a855-67e4-40d9-8603-f286b4d8d384.png",
  "hym-t4-feature-06-v1": "exec-07d60406-f9e2-444b-9851-5f16b1506a84.png",
  "hym-t4-feature-07-v1": "exec-5412d87e-a8ac-41a8-b177-48a3c1bf2b03.png",
  "hym-t4-feature-08-v1": "exec-85849ea5-5e34-496e-86e7-96973f078e7b.png",
  "hym-t4-category-02-v1": "exec-3e9a6d46-01d8-4698-bcba-5d50bbbabbff.png",
  "hym-t4-category-04-v1": "exec-b93e49bd-beae-45a7-80c3-f16b98ba1337.png",
  "hym-t4-home-contact-v1": "exec-ad9adbdc-585f-4a99-91b4-a3f04499cf9f.png",
  "hym-t4-home-region-search-v1": "exec-cea67bb7-6a28-4324-9ef2-73fa12a77af1.png",
}));

const entries = [];
for (const [id, generatedFile] of parentRegionalPaths) {
  const index = Number(id);
  const lane = "abcdefghij"[Math.floor((index - 1) / 13)];
  const assetId = `hym-t4-rgn-${id}-v1`;
  const generatedAbsolute = path.join(GENERATED_ROOT, generatedFile);
  const projectRelative = `public/images/honhyeol-template4/regional-originals/lane-${lane}/${assetId}.png`;
  const generatedBytes = await readFile(generatedAbsolute);
  const projectBytes = await readFile(path.join(ROOT, projectRelative));
  if (!projectBytes.equals(generatedBytes)) throw new Error(`GENERATED_COPY_MISMATCH:${assetId}`);
  const prompt = regionalPrompt(index);
  const promptRelative = `${CAMPAIGN}/prompts/regional/${assetId}.txt`;
  await writeNewOrExact(promptRelative, Buffer.from(`${prompt}\n`));
  const metadata = await sharp(projectBytes).metadata();
  const receipt = { schemaVersion: "honhyeol-built-in-imagegen-receipt/v1", status: "GENERATED_AND_COPIED", tool: "built-in image_gen", assetId, assetClass: "regional", sourceDefaultPath: generatedAbsolute, projectRelative, sourceSha256: sha256(generatedBytes), projectSha256: sha256(projectBytes), prompt: { relativePath: promptRelative, sha256: sha256(Buffer.from(`${prompt}\n`)) }, dimensions: { width: metadata.width, height: metadata.height, format: metadata.format }, styling: index <= 83 ? "tasteful-fitted-fashion" : "restrained-everyday-fashion" };
  const receiptRelative = `${CAMPAIGN}/receipts/generated/${assetId}.json`;
  await writeNewOrExact(receiptRelative, Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`));
  entries.push({ assetId, receiptRelative, projectRelative, projectSha256: receipt.projectSha256, styling: receipt.styling });
}

for (const [assetId, generatedFile] of editorial) {
  const generatedAbsolute = path.join(GENERATED_ROOT, generatedFile);
  const projectRelative = `${CAMPAIGN}/generated-originals/editorial/${assetId}.png`;
  const generatedBytes = await readFile(generatedAbsolute);
  const projectBytes = await readFile(path.join(ROOT, projectRelative));
  if (!projectBytes.equals(generatedBytes)) throw new Error(`GENERATED_COPY_MISMATCH:${assetId}`);
  const promptRelative = `${CAMPAIGN}/prompts/editorial/${assetId}.txt`;
  const prompt = `See the executed built-in image_gen specification recorded in the task transcript for ${assetId}; one clearly adult woman, visible physical mirror and reflection, crop-safe composition, fully clothed non-explicit styling, no text/logo/watermark/bed/bathroom/anatomy defects.`;
  await writeNewOrExact(promptRelative, Buffer.from(`${prompt}\n`));
  const metadata = await sharp(projectBytes).metadata();
  const receipt = { schemaVersion: "honhyeol-built-in-imagegen-receipt/v1", status: "GENERATED_AND_COPIED", tool: "built-in image_gen", assetId, assetClass: "editorial", sourceDefaultPath: generatedAbsolute, projectRelative, sourceSha256: sha256(generatedBytes), projectSha256: sha256(projectBytes), prompt: { relativePath: promptRelative, sha256: sha256(Buffer.from(`${prompt}\n`)) }, dimensions: { width: metadata.width, height: metadata.height, format: metadata.format }, styling: "restrained-everyday-fashion" };
  const receiptRelative = `${CAMPAIGN}/receipts/generated/${assetId}.json`;
  await writeNewOrExact(receiptRelative, Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`));
  entries.push({ assetId, receiptRelative, projectRelative, projectSha256: receipt.projectSha256, styling: receipt.styling });
}

const failure = { schemaVersion: "honhyeol-imagegen-historical-failure/v1", status: "HISTORICAL_NOT_ACTIVE", affectedRequestedRange: ["hym-t4-rgn-072-v1", "hym-t4-rgn-083-v1"], result: "OUTPUT_MODERATION_BLOCKED", requestId: "d6f5e564-2785-4365-b887-27d02bc2aa00", activePolicy: "The failed batch and unassigned outputs are not active. Each of the 12 IDs is regenerated once by a dedicated lane with an individual receipt." };
await writeNewOrExact(`${CAMPAIGN}/receipts/historical/batch-072-083-output-moderation.v1.json`, Buffer.from(`${JSON.stringify(failure, null, 2)}\n`));

const index = { schemaVersion: "honhyeol-parent-generation-receipt-index/v1", status: "PARENT_GENERATIONS_RECORDED", counts: { regional: parentRegionalPaths.size, editorial: editorial.size, total: entries.length }, entries };
await writeNewOrExact(`${CAMPAIGN}/generation-receipts.parent.v1.json`, Buffer.from(`${JSON.stringify(index, null, 2)}\n`));
console.log(JSON.stringify(index.counts, null, 2));
