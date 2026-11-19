import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { maxAvatarSize } from "../config";
import { AvatarValidationError, sanitizeAvatar } from "./validateAvatar";

test("sanitizes supported still image formats", async () => {
  for (const format of ["jpeg", "png", "webp", "gif"] as const) {
    const source = await sharp({
      create: {
        width: 24,
        height: 12,
        channels: 4,
        background: { r: 10, g: 100, b: 200, alpha: 1 },
      },
    })
      .toFormat(format)
      .toBuffer();

    const sanitized = await sanitizeAvatar(source);
    const metadata = await sharp(sanitized.buffer).metadata();

    assert.equal(metadata.format, format);
    assert.equal(sanitized.contentType, `image/${format === "jpeg" ? "jpeg" : format}`);
    assert.ok((metadata.width ?? 0) <= 512);
    assert.ok((metadata.height ?? 0) <= 512);
  }
});

test("preserves animated GIF frames", async () => {
  const sanitized = await sanitizeAvatar(makeAnimatedGif(2));
  const metadata = await sharp(sanitized.buffer, { animated: true }).metadata();

  assert.equal(metadata.format, "gif");
  assert.equal(metadata.pages, 2);
});

test("rejects malformed, oversized-dimension, and excessive-frame inputs", async () => {
  await assert.rejects(
    sanitizeAvatar(Buffer.from("not an image")),
    (error: unknown) =>
      error instanceof AvatarValidationError && error.statusCode === 400,
  );

  await assert.rejects(
    sanitizeAvatar(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]),
    ),
    (error: unknown) =>
      error instanceof AvatarValidationError && error.statusCode === 400,
  );

  const wideImage = await sharp({
    create: {
      width: 4097,
      height: 1,
      channels: 3,
      background: "red",
    },
  })
    .png()
    .toBuffer();
  await assert.rejects(
    sanitizeAvatar(wideImage),
    (error: unknown) =>
      error instanceof AvatarValidationError && error.statusCode === 400,
  );

  const highPixelCountImage = await sharp({
    create: {
      width: 4001,
      height: 4000,
      channels: 3,
      background: "blue",
    },
  })
    .png()
    .toBuffer();
  await assert.rejects(
    sanitizeAvatar(highPixelCountImage),
    (error: unknown) =>
      error instanceof AvatarValidationError && error.statusCode === 400,
  );

  await assert.rejects(
    sanitizeAvatar(makeAnimatedGif(101)),
    (error: unknown) =>
      error instanceof AvatarValidationError && error.statusCode === 400,
  );
});

test("rejects files that exceed the input byte limit", async () => {
  await assert.rejects(
    sanitizeAvatar(Buffer.alloc(maxAvatarSize + 1)),
    (error: unknown) =>
      error instanceof AvatarValidationError && error.statusCode === 413,
  );
});

function makeAnimatedGif(frameCount: number): Buffer {
  const bytes = [
    71, 73, 70, 56, 57, 97,
    1, 0, 1, 0,
    0x80, 0, 0,
    255, 0, 0,
    0, 0, 255,
    0x21, 0xff, 0x0b, 78, 69, 84, 83, 67, 65, 80, 69, 50, 46, 48, 3, 1, 0, 0, 0,
  ];

  for (let frame = 0; frame < frameCount; frame += 1) {
    const pixel = frame % 2;
    bytes.push(
      0x21, 0xf9, 4, 0, 0, 0, 0, 0,
      0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0,
      2, 2,
      ...(pixel ? [0x4c, 1] : [0x44, 1]),
      0,
    );
  }

  bytes.push(0x3b);
  return Buffer.from(bytes);
}
