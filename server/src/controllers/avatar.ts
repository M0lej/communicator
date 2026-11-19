import express from "express";
import mongoose from "mongoose";
import { getAvatarDownloadStream } from "../lib/avatar";
import { getUserById } from "../models/user";
import path from "node:path";

export const getAvatar = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
      return res.sendStatus(400);
    }

    const user = await getUserById(userId as string);

    if (!user) {
      return res.sendStatus(404);
    }

    if (!user.avatarFileId) {
      res.setHeader("Content-Type", "image/png");
      return res.sendFile(
        path.join(__dirname, "../../public/default.png"),
        (error) => {
          if (error) {
            console.error(error);
            if (res.headersSent) {
              res.destroy(error);
            } else {
              res.sendStatus(500);
            }
          }
        },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user.avatarFileId)) {
      return res.sendStatus(404);
    }

    const downloadStream = getAvatarDownloadStream(user.avatarFileId);

    if (downloadStream instanceof Error) {
      console.error(downloadStream);
      return res.sendStatus(500);
    }

    downloadStream.once("file", (file) => {
      const contentType = file.metadata?.contentType;
      if (
        contentType === "image/jpeg" ||
        contentType === "image/png" ||
        contentType === "image/webp" ||
        contentType === "image/gif"
      ) {
        res.setHeader("Content-Type", contentType);
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
    });

    downloadStream.on("error", (error) => {
      console.error("Failed to read avatar from GridFS.", error);
      if (res.headersSent) {
        res.destroy();
      } else {
        res.sendStatus(404);
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};
