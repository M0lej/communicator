import express from "express";
import multer from "multer";
import { maxAvatarSize, upload } from "../config";
import { uploadAvatarFromBuffer } from "../lib/avatar";
import {
  AvatarValidationError,
  sanitizeAvatar,
} from "../lib/validateAvatar";

export const parseAvatarUpload = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  upload.single("avatar")(req, res, (error: unknown) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ error: "Invalid avatar upload." });
    }

    console.error("Failed to parse avatar upload.", error);
    return res.status(500).json({ error: "Failed to parse avatar upload." });
  });
};

export const avatarUpload = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (!req.file) {
    if (req.body && typeof req.body === "object") {
      const body = { ...req.body };
      delete body.avatarFileId;
      req.body = body;
    }

    return next();
  }

  if (req.file.size > maxAvatarSize) {
    return res.status(413).json({ error: "Avatar file is too large." });
  }

  let sanitizedAvatar: Awaited<ReturnType<typeof sanitizeAvatar>>;
  try {
    sanitizedAvatar = await sanitizeAvatar(req.file.buffer);
  } catch (error) {
    if (error instanceof AvatarValidationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Failed to validate avatar image.", error);
    return res.status(500).json({ error: "Failed to process avatar image." });
  }

  try {
    const avatarFileId = await uploadAvatarFromBuffer(
      sanitizedAvatar.buffer,
      { contentType: sanitizedAvatar.contentType },
    );
    req.body = { ...(req.body ?? {}), avatarFileId };
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to upload avatar." });
  }
};
