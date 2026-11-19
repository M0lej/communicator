import sharp, { type Metadata } from "sharp";
import { maxAvatarSize } from "../config";

const maxAvatarDimension = 4096;
const maxAvatarPixels = 16_000_000;
const maxAvatarFrames = 100;
const normalizedAvatarDimension = 512;

const contentTypes = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
} as const;

export type AvatarFormat = keyof typeof contentTypes;

function detectAvatarFormat(buffer: Buffer): AvatarFormat | undefined {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return "png";
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpeg";
  }

  if (buffer.length >= 6) {
    const signature = buffer.toString("ascii", 0, 6);
    if (signature === "GIF87a" || signature === "GIF89a") {
      return "gif";
    }
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
}

function isAvatarFormat(format: string | undefined): format is AvatarFormat {
  return (
    format === "jpeg" ||
    format === "png" ||
    format === "webp" ||
    format === "gif"
  );
}

export class AvatarValidationError extends Error {
  constructor(
    message: string,
    readonly statusCode: 400 | 413,
  ) {
    super(message);
    this.name = "AvatarValidationError";
  }
}

export async function sanitizeAvatar(
  buffer: Buffer,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (buffer.length === 0) {
    throw new AvatarValidationError("Avatar file is empty.", 400);
  }

  if (buffer.length > maxAvatarSize) {
    throw new AvatarValidationError("Avatar file is too large.", 413);
  }

  const detectedFormat = detectAvatarFormat(buffer);
  if (!detectedFormat) {
    throw new AvatarValidationError(
      "Avatar must be a valid PNG, JPEG, WebP, or GIF image.",
      400,
    );
  }

  let metadata: Metadata;
  try {
    metadata = await sharp(buffer, {
      animated: true,
      failOn: "warning",
      limitInputPixels: maxAvatarPixels,
    }).metadata();
  } catch {
    throw new AvatarValidationError(
      "Avatar must be a valid PNG, JPEG, WebP, or GIF image.",
      400,
    );
  }

  const format = metadata.format;
  if (!isAvatarFormat(format) || format !== detectedFormat) {
    throw new AvatarValidationError("Avatar format is not supported.", 400);
  }

  const avatarFormat = format;
  const width = metadata.width;
  const height = metadata.pageHeight ?? metadata.height;
  const pages = metadata.pages ?? 1;

  if (
    !width ||
    !height ||
    width > maxAvatarDimension ||
    height > maxAvatarDimension ||
    pages < 1 ||
    pages > maxAvatarFrames ||
    (pages > 1 && avatarFormat !== "gif") ||
    width * height * pages > maxAvatarPixels
  ) {
    throw new AvatarValidationError(
      "Avatar dimensions or animation exceed the allowed limits.",
      400,
    );
  }

  let normalized: Buffer;
  try {
    const image = sharp(buffer, {
      animated: avatarFormat === "gif",
      failOn: "warning",
      limitInputPixels: maxAvatarPixels,
    })
      .rotate()
      .resize({
        width: normalizedAvatarDimension,
        height: normalizedAvatarDimension,
        fit: "inside",
        withoutEnlargement: true,
      });

    switch (avatarFormat) {
      case "jpeg":
        normalized = await image.jpeg({ quality: 85 }).toBuffer();
        break;
      case "png":
        normalized = await image.png({ compressionLevel: 9 }).toBuffer();
        break;
      case "webp":
        normalized = await image.webp({ quality: 85 }).toBuffer();
        break;
      case "gif":
        normalized = await image.gif().toBuffer();
        break;
    }
  } catch {
    throw new AvatarValidationError("Avatar image could not be decoded.", 400);
  }

  if (normalized.length > maxAvatarSize) {
    throw new AvatarValidationError("Processed avatar is too large.", 413);
  }

  return {
    buffer: normalized,
    contentType: contentTypes[avatarFormat],
  };
}
