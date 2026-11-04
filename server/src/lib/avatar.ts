import { Readable } from "node:stream";
import mongoose from "mongoose";
import { avatarBucket } from "./connectToDb";

export function uploadAvatarFromBuffer(
  buffer: Buffer,
  filename: string,
  metadata = {},
) {
  return new Promise((resolve, reject) => {
    if (!avatarBucket) {
      return reject(new Error("GridFS Bucket is not ready."));
    }

    const uploadStream = avatarBucket.openUploadStream(filename, {
      metadata,
    });

    const readStream = Readable.from(buffer);

    readStream.pipe(uploadStream);

    uploadStream.on("error", (error) => reject(error));
    uploadStream.on("finish", () => resolve(uploadStream.id));
  });
}

export function getAvatarDownloadStream(fileId: string) {
  if (!avatarBucket) {
    return new Error("GridFS Bucket is not ready.");
  }

  return avatarBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
}
