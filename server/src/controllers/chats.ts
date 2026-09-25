import express from "express";
import { createNewChat, getChatsByUserId } from "../models/chat";
import { getUserById } from "../models/user";

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

    const otherUser = await getUserById(otherId as string);

    if (!otherUser) {
      return res.sendStatus(403);
    }

    const chat = await createNewChat(userId as string, otherId as string);

    if (!chat) {
      return res.sendStatus(400);
    }

    return res.status(200).json(chat).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
