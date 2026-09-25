import express from "express";
import { getUserBySessionToken } from "../models/user";
import { get, merge } from "lodash";
import { hashSessionToken } from "../lib/encryption";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const sessionToken = req.cookies["USER_AUTH"];

    if (!sessionToken) {
      return res.sendStatus(403);
    }

    const hashedSessionToken = hashSessionToken(sessionToken);

    const foundUser = await getUserBySessionToken(hashedSessionToken);

    if (!foundUser) {
      return res.sendStatus(403);
    }

    merge(req, { identity: foundUser });
    return next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { userId } = req.params;
    const currentUserId: string = get(req, "identity._id") as unknown as string;

    if (!currentUserId || !userId || userId !== currentUserId.toString()) {
      return res.sendStatus(403);
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};
