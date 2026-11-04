import type { IUser } from "../providers/UserProvider";
import type { IMessage } from "./messages";

export interface IWSIncomingMessage {
  type: "MESSAGE";
  message: IMessage;
}

export interface IWSIncomingTyping {
  type: "TYPING";
  content: {
    chatId: string;
    receiver: string;
    content: boolean;
  };
}

export interface IWSIncomingActive {
  type: "ACTIVE";
  content: {
    receiver: string;
    sender: IUser;
    content: boolean;
  };
}

export class WSService {
  private _ws: WebSocket;
  public onMessage: ((event: MessageEvent) => void) | null = null;
  public onClose: ((event: Event) => void) | null = null;
  public onError: ((event: Event) => void) | null = null;

  constructor(userId: string) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this._ws = new WebSocket(
      `${protocol}//${window.location.host}/api/ws/${encodeURIComponent(userId)}`,
    );

    this._ws.onopen = () => console.info("WebSocket connected");
    this._ws.onerror = (event: Event) => {
      console.error("WebSocket error", event);
      this.onError?.(event);
    };
    this._ws.onclose = (event) => {
      console.warn("WebSocket closed", event.code, event.reason);
      this.onClose?.(event);
    };
    this._ws.onmessage = (event) => this.onMessage?.(event);
  }

  sendMessage(chatId: string, receiver: string, content: string) {
    if (!chatId || !receiver || !content) return;

    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(
        JSON.stringify({
          type: "MESSAGE",
          content: {
            chatId,
            receiver,
            content,
          },
        }),
      );
    }
  }

  notifyTyping(chatId: string, receiver: string, content: boolean) {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(
        JSON.stringify({
          type: "TYPING",
          content: {
            chatId,
            receiver,
            content,
          },
        }),
      );
    }
  }

  closeConnection() {
    this._ws.close();
  }
}
