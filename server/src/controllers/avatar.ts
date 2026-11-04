import express from "express";
import mongoose from "mongoose";
import { getAvatarDownloadStream } from "../lib/avatar";
import { getUserById } from "../models/user";
import { avatarBucket } from "../lib/connectToDb";
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
      return res.sendStatus(400);
    }

    if (!user.avatarFileId) {
      return res.sendFile(path.join(__dirname, "../../public/default.png"));
    }

    res.setHeader("Content-Type", "image/png");

    const downloadStream = getAvatarDownloadStream(user.avatarFileId);

    if (downloadStream instanceof Error) {
      return res.status(500);
    }

    downloadStream.on("error", () => {
      res.sendStatus(404);
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};
