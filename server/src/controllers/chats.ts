import express from "express";
import {
  _getChatByUserIds,
  createNewChat,
  getChatById,
  getChatsByUserId,
} from "../models/chat";
import { getUserById } from "../models/user";
import { get } from "lodash";

export const getChats = async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.sendStatus(400);
    }

    const chats = (await getChatsByUserId(userId as string)) ?? [];

    return res.status(200).json(chats).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getChat = async (req: express.Request, res: express.Response) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.sendStatus(400);
    }

    const chat = await getChatById(chatId as string);

    if (!chat) {
      return res.sendStatus(403);
    }

    return res.status(200).json(chat).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getChatByUserIds = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { otherId } = req.params;
    const userId: string = get(req, "identity._id") as unknown as string;

    if (!otherId || !userId) {
      return res.sendStatus(400);
    }

    const chat = await _getChatByUserIds(userId as string, otherId as string);

    return res.status(200).json(chat).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const createChat = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, otherId } = req.params;

    if (!userId || !otherId) {
      return res.sendStatus(400);
    }

    if (userId === otherId) {
      return res.sendStatus(403);
    }

    const foundChat = await _getChatByUserIds(
      userId as string,
      otherId as string,
    );

    if (foundChat) {
      return res.sendStatus(403);
    }

    const currentUser = await getUserById(userId as string);
    const otherUser = await getUserById(otherId as string);

    if (!otherUser || !currentUser) {
      return res.sendStatus(403);
    }

    const chat = await createNewChat(currentUser, otherUser);

    if (!chat) {
      return res.sendStatus(400);
    }

    return res.status(200).json(chat).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
