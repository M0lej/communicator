import express from "express";
import {
  createNewMessage,
  getLatestMessagesByChatId,
  getOlderMessagesByChatId,
  IMessage,
} from "../models/message";
import mongoose from "mongoose";
import { getChatById, IChat } from "../models/chat";
import WebSocket from "ws";

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

// stores clients websockets in a Map where the key equals to a chat id
type WSmessage = {
  type: "message";
  content: string;
};

type WStyping = {
  type: "typing";
  value: boolean;
};

const chats = new Map<string, Set<WebSocket>>();

export const messagesWsHandler = async (
  ws: WebSocket,
  req: express.Request,
) => {
  try {
    const { userId, chatId } = req.params;

    if (!userId || !chatId) {
      ws.close(1003);
      return;
    }

    const chat = await getChatById(chatId as string);

    if (!chat) {
      return ws.close(1008);
    }

    if (!chats.has(chatId as string)) {
      chats.set(chatId as string, new Set());
    }

    chats.get(chatId as string)!.add(ws);

    ws.on("close", () => {
      chats.get(chatId as string)?.delete(ws);

      if (chats.get(chatId as string)?.size === 0) {
        chats.delete(chatId as string);
      }
    });

    const receiver = chat.users.find(
      (id: mongoose.Types.ObjectId) => !id.equals(userId as string),
    );

    ws.on("message", async (content: string) => {
      if (!content) {
        ws.close(1003);
        return;
      }

      const contentParsed: WSmessage | WStyping = JSON.parse(content);

      const clients = chats.get(chatId as string);

      if (!clients) return;

      switch (contentParsed.type) {
        case "message":
          await createNewMessage({
            sender: userId,
            receiver,
            chatId,
            content: contentParsed.content,
          });

          const messages =
            (await getLatestMessagesByChatId(chatId as string)) ?? [];

          for (const client of clients) {
            client.send(
              JSON.stringify({
                type: "messages",
                content: messages,
              }),
            );
          }

          break;
        case "typing":
          for (const client of clients) {
            if (client != ws) {
              client.send(content);
            }
          }
          break;
      }
    });
  } catch (error) {
    console.error(error);
  }
};
