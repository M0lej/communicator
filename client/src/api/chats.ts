import axios from "axios";

export interface IChat {
  _id: string;
  users: string[];
  userNames: string[];
}

export async function getChats(userId: string) {
  try {
    const response = await axios({
      method: "GET",
      url: `/api/chats/${encodeURIComponent(userId)}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChat(userId: string, chatId: string) {
  try {
    const response = await axios({
      method: "GET",
      url: `/api/chat/id/${encodeURIComponent(userId)}/${encodeURIComponent(chatId)}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChatByOtherId(otherId: string) {
  try {
    const response = await axios({
      method: "GET",
      url: `/api/chat/me/${encodeURIComponent(otherId)}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createChat(userId: string, otherId: string) {
  try {
    const response = await axios({
      method: "POST",
      url: `/api/chat/create/${encodeURIComponent(userId)}/${encodeURIComponent(otherId)}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
