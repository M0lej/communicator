import WebSocket from "ws";
import { createNewMessage } from "../models/message";
import express from "express";
import { getUserById, IUser } from "../models/user";
import mongoose from "mongoose";

interface IWSMessage {
  type: "MESSAGE";
  content: {
    chatId: string;
    receiver: string;
    content: string;
  };
}

interface IWSUserTyping {
  type: "TYPING";
  content: {
    chatId: string;
    receiver: string;
    content: boolean;
  };
}

interface IWSActive {
  type: "ACTIVE";
  content: {
    receiver: string;
    sender: IUser;
    content: boolean;
  };
}

export const activeUsers = new Map<string, WebSocket>();

export const WSHandler = async (ws: WebSocket, req: express.Request) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      ws.close(1003);
    }

    if (!activeUsers.get(userId as string)) {
      activeUsers.set(userId as string, ws);
      await broadcastStatusChange(userId as string, true);
    }

    ws.on("close", async () => {
      await broadcastStatusChange(userId as string, false);
      activeUsers.delete(userId as string);
    });

    ws.on("message", async (data: string) => {
      if (!data) {
        ws.close(1003);
        return;
      }

      const parsedData: IWSMessage | IWSUserTyping | IWSActive =
        JSON.parse(data);
      const receiver = activeUsers.get(parsedData.content.receiver);

      switch (parsedData.type) {
        case "MESSAGE":
          const newMessage = await createNewMessage({
            sender: userId,
            receiver: parsedData.content.receiver,
            chatId: parsedData.content.chatId,
            content: parsedData.content.content,
          });

          ws.send(
            JSON.stringify({
              type: "MESSAGE",
              message: newMessage,
            }),
          );

          if (receiver) {
            receiver.send(
              JSON.stringify({
                type: "MESSAGE",
                message: newMessage,
              }),
            );
          }
          break;
        case "ACTIVE":
        case "TYPING":
          if (receiver) {
            receiver.send(data);
          }
          break;
      }
    });
  } catch (error) {
    console.error(error);
    ws.close();
  }
};

async function broadcastStatusChange(
  userId: string,
  status: boolean, // true - active / false - offline
) {
  try {
    const user = await getUserById(userId);

    if (!user) {
      console.error(
        `Couldn't broadcast status change to friends of user with id ${userId} | user doesn't exist`,
      );
      return;
    }

    activeUsers.entries().forEach(([otherId, otherWs]) => {
      if (user.friends.includes(new mongoose.Types.ObjectId(otherId))) {
        otherWs.send(
          JSON.stringify({
            type: "ACTIVE",
            content: {
              receiver: otherId,
              sender: user,
              content: status,
            },
          }),
        );
      }
    });
  } catch (error) {
    console.error(error);
    return;
  }
}
