import express from "express";
import {
  createUser,
  getUserByEmail,
  getUserBySessionToken,
  IUserWithAuth,
} from "../models/user";
import { hashPassword, hashSessionToken, random } from "../lib/encryption";
import { get } from "lodash";
import { deleteAvatarFile } from "../lib/avatar";

const isProduction = process.env.NODE_ENV === "production";
const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  secure: isProduction,
  path: "/",
  maxAge: 5 * 24 * 60 * 60 * 100,
};

export const register = async (req: express.Request, res: express.Response) => {
  let uploadedAvatarFileId: string | undefined;
  try {
    const { username, email, password, avatarFileId } = req.body ?? {};
    uploadedAvatarFileId = avatarFileId;

    if (
      typeof username !== "string" ||
      !usernamePattern.test(username) ||
      !email ||
      !password
    ) {
      await cleanupUploadedAvatar(uploadedAvatarFileId);
      uploadedAvatarFileId = undefined;
      return res.sendStatus(400);
    }

    const foundUser = await getUserByEmail(email);

    if (foundUser) {
      await cleanupUploadedAvatar(uploadedAvatarFileId);
      uploadedAvatarFileId = undefined;
      return res.sendStatus(400);
    }

    const salt = random();
    const encryptedPassword = hashPassword(salt, password);

    const user = await createUser({
      username,
      email,
      avatarFileId,
      authentication: {
        salt,
        password: encryptedPassword,
      },
    });
    uploadedAvatarFileId = undefined;

    delete user.authentication;

    return res.status(201).json(user).end();
  } catch (error) {
    await cleanupUploadedAvatar(uploadedAvatarFileId);
    console.error(error);
    return res.sendStatus(400);
  }
};

async function cleanupUploadedAvatar(fileId: string | undefined) {
  if (!fileId) {
    return;
  }

  try {
    await deleteAvatarFile(fileId);
  } catch (error) {
    console.error("Failed to clean up an unreferenced avatar.", error);
  }
}

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }

    const user = (await getUserByEmail(email).select(
      "+authentication.salt +authentication.password",
    )) as IUserWithAuth;

    if (!user) {
      return res.sendStatus(400);
    }

    const encryptedPassword = hashPassword(user.authentication.salt, password);

    if (encryptedPassword !== user.authentication.password) {
      return res.status(403).json({
        message: "Invalid email or password",
      });
    }

    const sessionToken = random();
    const hashedSessionToken = hashSessionToken(sessionToken);

    await user.updateOne({
      "authentication.sessionToken": hashedSessionToken,
    });

    res.cookie("USER_AUTH", sessionToken, sessionCookieOptions);

    const userRes = user.toObject();
    delete userRes.authentication;

    return res.status(200).json(userRes).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    const sessionToken = req.cookies["USER_AUTH"];
    if (!sessionToken) {
      return res.sendStatus(400);
    }

    const hashedSessionToken = hashSessionToken(sessionToken);

    const user: IUserWithAuth = await getUserBySessionToken(
      hashedSessionToken,
    ).select("+authentication.sessionToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.updateOne({
      $unset: { "authentication.sessionToken": 1 },
    });
    res.clearCookie("USER_AUTH", { path: "/" });
    return res.status(200).json({ message: "Logged out successfully" }).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const isLoggedIn = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const sessionToken = req.cookies["USER_AUTH"];

    if (!sessionToken) {
      return res.status(200).json(null).end();
    }

    const hashedSessionToken = hashSessionToken(sessionToken);

    const foundUser = await getUserBySessionToken(hashedSessionToken);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(foundUser).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const restoreSession = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const sessionToken = req.cookies["USER_AUTH"];

    if (!sessionToken) {
      return res.sendStatus(400);
    }

    const hashedSessionToken = hashSessionToken(sessionToken);

    const user = (await getUserBySessionToken(hashedSessionToken).select(
      "+authentication",
    )) as IUserWithAuth;
    if (!user) {
      return res.sendStatus(403);
    }

    const newSessionToken = random();
    const newHashedSessionToken = hashSessionToken(newSessionToken);

    await user.updateOne({
      "authentication.sessionToken": newHashedSessionToken,
    });

    res.cookie("USER_AUTH", newSessionToken, sessionCookieOptions);

    const userRes = user.toObject();

    delete userRes.authentication;

    return res.status(200).json(userRes).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const comparePassword = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const user: IUserWithAuth | undefined = get(req, "identity");
    const { password } = req.body;

    if (!password || !user) {
      return res.sendStatus(400);
    }

    const hashedPassword = hashPassword(
      (user as IUserWithAuth).authentication.salt,
      password,
    );

    return res
      .status(200)
      .json(hashedPassword === (user as IUserWithAuth).authentication.password)
      .end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};
