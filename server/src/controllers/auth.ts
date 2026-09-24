import express from "express";
import { createUser, getUserByEmail, IUserWithAuth } from "../models/user";
import { encrypt, random } from "../lib/encryption";

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
    const encryptedPassword = encrypt(salt, password);

    const user = await createUser({
      username,
      email,
      authentication: {
        salt,
        password: encryptedPassword,
      },
    });

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

    const encryptedPassword = encrypt(user.authentication.salt, password);

    if (encryptedPassword !== user.authentication.password) {
      return res.sendStatus(403);
    }

    const salt = random();
    user.authentication.sessionToken = encrypt(salt, user._id.toString());

    await user.save();
    res.cookie("USER_AUTH", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};
