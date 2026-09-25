import express from "express";
import {
  createUser,
  getUserByEmail,
  getUserBySessionToken,
  IUserWithAuth,
} from "../models/user";
import { hashPassword, hashSessionToken, random } from "../lib/encryption";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.sendStatus(400);
    }

    const foundUser = await getUserByEmail(email);

    if (foundUser) {
      return res.sendStatus(400);
    }

    const salt = random();
    const encryptedPassword = hashPassword(salt, password);

    const user = await createUser({
      username,
      email,
      authentication: {
        salt,
        password: encryptedPassword,
      },
    });

    delete user.authentication;

    return res.status(201).json(user).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

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
      return res.sendStatus(403);
    }

    const sessionToken = random();
    const hashedSessionToken = hashSessionToken(sessionToken);

    await user.updateOne({
      "authentication.sessionToken": hashedSessionToken,
    });

    res.cookie("USER_AUTH", sessionToken, {
      httpOnly: true,
      domain: "localhost",
      sameSite: "lax",
      path: "/",
      maxAge: 5 * 24 * 60 * 60 * 100,
    });

    const userRes = user.toObject();
    delete userRes.authentication;

    return res.status(200).json(userRes).end();
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

    res.cookie("USER_AUTH", newSessionToken, {
      httpOnly: true,
      domain: "localhost",
      sameSite: "lax",
      path: "/",
      maxAge: 5 * 24 * 60 * 60 * 100,
    });

    const userRes = user.toObject();

    delete userRes.authentication;

    return res.status(200).json(userRes).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};
