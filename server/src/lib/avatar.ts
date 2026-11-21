import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import mongoose from "mongoose";
import { avatarBucket } from "./connectToDb";

export function uploadAvatarFromBuffer(
  buffer: Buffer,
  metadata: Record<string, unknown> = {},
): Promise<string> {
  if (!avatarBucket) {
    return Promise.reject(new Error("GridFS Bucket is not ready."));
  }

  const bucket = avatarBucket;
  const uploadStream = bucket.openUploadStream(crypto.randomUUID(), { metadata });

  return pipeline(Readable.from([buffer]), uploadStream)
    .then(() => uploadStream.id.toString())
    .catch(async (error: unknown) => {
      try {
        await bucket.delete(uploadStream.id);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up an incomplete avatar upload.",
          cleanupError,
        );
      }

      throw error;
    });
}

export async function deleteAvatarFile(fileId: string): Promise<void> {
  if (!avatarBucket) {
    throw new Error("GridFS Bucket is not ready.");
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new Error("Invalid avatar file ID.");
  }

  await avatarBucket.delete(new mongoose.Types.ObjectId(fileId));
}

export function getAvatarDownloadStream(fileId: string) {
  if (!avatarBucket) {
    return new Error("GridFS Bucket is not ready.");
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return new Error("Invalid avatar file ID.");
  }

  return avatarBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
}
