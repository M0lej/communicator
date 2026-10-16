import axios from "axios";

export interface IMessage {
  _id: string;
  sender: string;
  receiver: string;
  chatId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WSmessages = {
  type: "messages";
  content: IMessage[];
};

export type WStyping = {
  type: "typing";
  value: boolean;
};

export async function getLatestMessages(userId: string, chatId: string) {
  try {
    const response = await axios({
      method: "get",
      url: `/api/messages/${userId}/${chatId}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export class MessagesWSService {
  private _ws: WebSocket;

  constructor(
    onMessage: (event: MessageEvent) => void,
    userId: string,
    chatId: string,
  ) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this._ws = new WebSocket(
      `${protocol}//${window.location.host}/api/messages/${userId}/${chatId}`,
    );
    this._ws.onopen = () => {
      console.log("MessagesService: Connected to WebSocket server.");
    };

    this._ws.onclose = () =>
      console.log("MessagesService: Disconnected from WebSocket server.");

    this._ws.onmessage = onMessage;
  }

  sendMessage(content: string) {
    if (!content) return;

    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(
        JSON.stringify({
          type: "message",
          content,
        }),
      );
    }
  }

  notifyTyping(value: boolean) {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(
        JSON.stringify({
          type: "typing",
          value,
        }),
      );
    }
  }

  closeConnection() {
    this.notifyTyping(false);
    this._ws.close();
  }
}

export async function getOlderMessages(
  userId: string,
  chatId: string,
  startIndex: number,
) {
  try {
    const response = await axios({
      method: "GET",
      url: `/api/messages/${userId}/${chatId}/${startIndex}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
