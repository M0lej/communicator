import express from "express";
import {
  createNewMessage,
  getLatestMessagesByChatId,
  getOlderMessagesByChatId,
} from "../models/message";
import mongoose from "mongoose";
import { getChatById, IChat } from "../models/chat";

export const getLatestMessages = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, chatId } = req.params;

    if (!userId || !chatId) {
      return res.sendStatus(400);
    }

    const messages = (await getLatestMessagesByChatId(chatId as string)) ?? [];

    return res.status(200).json(messages).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getOlderMessages = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, chatId, startIndex } = req.params;

    if (!userId || !chatId || !startIndex) {
      return res.sendStatus(400);
    }

    const messages =
      (await getOlderMessagesByChatId(
        chatId as string,
        Number.parseInt(startIndex as string),
      )) ?? [];

    return res.status(200).json(messages).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const createMessage = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, chatId } = req.params;
    const { content } = req.body;

    if (!userId || !chatId || !content) {
      return res.sendStatus(400);
    }

    const chat = (await getChatById(chatId as string)) as IChat;

    if (!chat) {
      return res.sendStatus(403);
    }

    const otherId = chat.users.find(
      (id: mongoose.Types.ObjectId) => !id.equals(userId as string),
    );

    if (!otherId) {
      return res.sendStatus(403);
    }

    const message = await createNewMessage({
      sender: userId,
      receiver: otherId,
      chatId,
      content,
    });

    if (!message) {
      return res.sendStatus(400);
    }

    return res.status(200).json(message).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
