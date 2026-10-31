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

export async function getLatestMessage(chatId: string) {
  try {
    const response = await axios({
      method: "get",
      url: `/api/messages/one/${chatId}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
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
