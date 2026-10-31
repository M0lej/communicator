import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "../providers/UserProvider";
import { getChats, type IChat, type IChatWithTypingInfo } from "../api/chats";
import ChatLink from "../components/ChatLink";
import { useWSContext } from "../providers/WSProvider";
import type { WSIncomingMessage, WSIncomingTyping } from "../api/ws";

export default function Home() {
  const [chats, setChats] = useState<IChatWithTypingInfo[]>([]);
  const { user } = useUserContext();
  const { service, setService } = useWSContext();

  useEffect(() => {
    if (!service) {
      return;
    }

    service.onMessage = receiveUpdates;
    return () => {
      if (service.onMessage === receiveUpdates) {
        service.onMessage = null;
      }
    };
  }, [service]);

  useEffect(() => {
    fetchChats();
  }, [user]);

  async function fetchChats() {
    if (!user) return;

    const res: IChat[] | null = await getChats(user._id);

    if (res) {
      setChats(res.map((chat) => ({ ...chat, isTyping: false })));
    }
  }

  const receiveUpdates = useCallback(
    (event: MessageEvent) => {
      if (!event.data) {
        return;
      }

      const data: WSIncomingMessage | WSIncomingTyping = JSON.parse(event.data);

      switch (data.type) {
        case "MESSAGE":
          updateChatsLatestMessage(data);
          break;
        case "TYPING":
          updateChatsIsTypingStatus(data);
          break;
      }
    },
    [user],
  );

  function updateChatsLatestMessage(data: WSIncomingMessage) {
    setChats((chats) =>
      chats.map((chat) =>
        chat._id === data.message.chatId
          ? { ...chat, latestMessage: data.message }
          : chat,
      ),
    );
  }

  function updateChatsIsTypingStatus(data: WSIncomingTyping) {
    setChats((chats) =>
      chats.map((chat) =>
        chat._id === data.content.chatId
          ? { ...chat, isTyping: data.content.content }
          : chat,
      ),
    );
  }

  return (
    <>
      <section className="w-full flex flex-col mt-10 gap-2">
        {chats.map((chat, i) => (
          <ChatLink chat={chat} key={i} />
        ))}
      </section>
    </>
  );
}
