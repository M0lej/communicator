import WebSocket from "ws";
import { createNewMessage } from "../models/message";
import express from "express";

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

const activeUsers = new Map<string, WebSocket>();

export const WSHandler = async (ws: WebSocket, req: express.Request) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      ws.close(1003);
    }

    if (!activeUsers.get(userId as string)) {
      activeUsers.set(userId as string, ws);
    }
    console.log(activeUsers);
    ws.on("close", async () => {
      activeUsers.delete(userId as string);
    });

    // const chats: IChat[] = await getChatsByUserId(userId as string);

    ws.on("message", async (data: string) => {
      if (!data) {
        ws.close(1003);
        return;
      }

      const parsedData: IWSMessage | IWSUserTyping = JSON.parse(data);
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
        case "TYPING":
          if (receiver) {
            receiver.send(data);
          }
      }
    });
  } catch (error) {
    console.error(error);
    ws.close();
  }
};
