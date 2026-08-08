// Quick sanity checks for the pure storage helpers in src/lib/storage.ts.
// Run with: node scripts/storage-helpers.test.mts
import assert from "node:assert/strict";
import {
  SCHOOL_ASSETS_BUCKET,
  ASSET_FOLDERS,
  FILE_TYPE_RULES,
  formatBytes,
  sanitizeFileName,
  buildStoragePath,
  isAllowedType,
  validateFile,
  pathFromPublicUrl,
  bucketFromPublicUrl,
  isStoredInAppBucket,
} from "../src/lib/storage.ts";

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

const jpeg = new File([new Uint8Array([1, 2, 3])], "class-photo.jpg", {
  type: "image/jpeg",
});
const pdf = new File([new Uint8Array([4, 5, 6])], "syllabus.pdf", {
  type: "application/pdf",
});
const exe = new File([new Uint8Array([7])], "virus.exe", {
  type: "application/x-msdownload",
});

run("bucket constant", () => assert.equal(SCHOOL_ASSETS_BUCKET, "school-assets"));

run("folders match the required structure", () => {
  assert.deepEqual(Object.values(ASSET_FOLDERS).sort(), [
    "achievements",
    "banners",
    "documents",
    "events",
    "facilities",
    "gallery",
    "logo",
    "teachers",
  ]);
});

run("image max size is 5MB, document max size is 10MB", () => {
  assert.equal(FILE_TYPE_RULES.image.maxBytes, 5 * 1024 * 1024);
  assert.equal(FILE_TYPE_RULES.document.maxBytes, 10 * 1024 * 1024);
});

run("formatBytes", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1024), "1 KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5 MB");
});

run("sanitizeFileName strips unsafe characters", () => {
  assert.equal(sanitizeFileName('  My  Photo (1)!.jpg  '), "My-Photo-1.jpg");
  assert.equal(sanitizeFileName("café-ünïcode.jpg"), "cafe-unicode.jpg");
  assert.equal(sanitizeFileName("###"), "file");
  assert.ok(sanitizeFileName("a".repeat(200)).length <= 80);
});

run("buildStoragePath prefixes folder and timestamp", () => {
  const path = buildStoragePath(ASSET_FOLDERS.gallery, jpeg);
  assert.ok(path.startsWith("gallery/"));
  assert.ok(path.endsWith("class-photo.jpg"));
  assert.match(path, /gallery\/\d+-class-photo\.jpg/);
  assert.equal(buildStoragePath("/logo/", jpeg).startsWith("logo/"), true);
});

run("isAllowedType", () => {
  assert.equal(isAllowedType("image/jpeg", "image"), true);
  assert.equal(isAllowedType("application/pdf", "document"), true);
  assert.equal(isAllowedType("application/pdf", "image"), false);
  assert.equal(isAllowedType("image/svg+xml", "image"), false);
});

run("validateFile accepts valid files", () => {
  assert.equal(validateFile(jpeg, "image").ok, true);
  assert.equal(validateFile(pdf, "document").ok, true);
});

run("validateFile rejects invalid type", () => {
  const result = validateFile(exe, "image");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /Unsupported file type/);
});

run("validateFile rejects oversized files", () => {
  const big = new File([new Uint8Array(FILE_TYPE_RULES.image.maxBytes + 1)], "big.jpg", {
    type: "image/jpeg",
  });
  const result = validateFile(big, "image");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /too large/);
});

run("validateFile rejects empty files", () => {
  const result = validateFile(new File([], "empty.jpg", { type: "image/jpeg" }), "image");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /empty/);
});

run("pathFromPublicUrl extracts object path", () => {
  const url = `https://abc.supabase.co/storage/v1/object/public/school-assets/gallery/1-photo.jpg`;
  assert.equal(pathFromPublicUrl(url), "gallery/1-photo.jpg");
  assert.equal(pathFromPublicUrl("https://external.com/img.png"), null);
  assert.equal(pathFromPublicUrl(""), null);
});

run("bucketFromPublicUrl and isStoredInAppBucket", () => {
  const url = `https://abc.supabase.co/storage/v1/object/public/school-assets/logo/crest.png`;
  assert.equal(bucketFromPublicUrl(url), "school-assets");
  assert.equal(isStoredInAppBucket(url), true);
  assert.equal(
    isStoredInAppBucket("https://abc.supabase.co/storage/v1/object/public/school-media/x.png"),
    true
  );
  assert.equal(isStoredInAppBucket("https://abc.supabase.co/storage/v1/object/public/other/x.png"), false);
  assert.equal(isStoredInAppBucket("https://cdn.example.com/x.png"), false);
});
