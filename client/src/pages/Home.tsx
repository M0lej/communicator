import { useCallback, useEffect, useRef, useState } from "react";
import { useUserContext, type IUser } from "../providers/UserProvider";
import { getChats, type IChat, type IChatWithTypingInfo } from "../api/chats";
import ChatLink from "../components/ChatLink";
import { useWSContext } from "../providers/WSProvider";
import type {
  IWSIncomingActive,
  IWSIncomingMessage,
  IWSIncomingTyping,
} from "../api/ws";
import Chat, { type IChatMethodsRef } from "./Chat";
import { clamp } from "../utilities/clamp";
import { getActiveFriends } from "../api/users";

export default function Home() {
  const [chats, setChats] = useState<IChatWithTypingInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const selectedChatMethodsRef = useRef<IChatMethodsRef | null>(null);
  const { user } = useUserContext();
  const { service } = useWSContext();
  const [activeUsers, setActiveUsers] = useState<IUser[]>([]);
  const [chatWidth, setChatWidth] = useState<number | null>();

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
    fetchActiveFriends();
  }, [user]);

  async function fetchChats() {
    if (!user) return;

    const res: IChat[] | null = await getChats(user._id);

    if (res) {
      setChats(res.map((chat) => ({ ...chat, isTyping: false })));
    }
  }

  async function fetchActiveFriends() {
    const res: IUser[] = await getActiveFriends();

    if (res) {
      setActiveUsers(res);
    }
  }

  const receiveUpdates = useCallback(
    (event: MessageEvent) => {
      if (!event.data) {
        return;
      }

      const data: IWSIncomingMessage | IWSIncomingTyping | IWSIncomingActive =
        JSON.parse(event.data);

      switch (data.type) {
        case "MESSAGE":
          updateChatsLatestMessage(data);
          selectedChatMethodsRef.current?.receiveNewMessage(data);
          break;
        case "TYPING":
          updateChatsIsTypingStatus(data);
          selectedChatMethodsRef.current?.receiveNewTypingStatus(data);
          break;
        case "ACTIVE":
          updateActiveUsers(data);
          break;
      }
    },
    [user],
  );

  function updateChatsLatestMessage(data: IWSIncomingMessage) {
    setChats((chats) =>
      chats.map((chat) =>
        chat._id === data.message.chatId
          ? { ...chat, latestMessage: data.message }
          : chat,
      ),
    );
  }

  function updateChatsIsTypingStatus(data: IWSIncomingTyping) {
    setChats((chats) =>
      chats.map((chat) =>
        chat._id === data.content.chatId
          ? { ...chat, isTyping: data.content.content }
          : chat,
      ),
    );
  }

  function updateActiveUsers(data: IWSIncomingActive) {
    const status = data.content.content;

    if (status) {
      setActiveUsers((users) => [...users, data.content.sender]);
    } else {
      setActiveUsers((users) =>
        users.filter((otherUser) => otherUser._id === data.content.receiver),
      );
    }
  }

  function hideChat() {
    setSelectedChat(null);
  }

  function onChatResizeDrag(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (event.clientX == 0) {
      return;
    }

    const newWidth = clamp(
      window.outerWidth - event.clientX,
      window.outerWidth / 4,
      (window.outerWidth * 3) / 4,
    );
    setChatWidth(newWidth);
  }

  return (
    <div className="w-full h-screen flex flex-col pt-15">
      <section>
        Active users:
        <div className="flex gap-2">
          {activeUsers.map((activeUser) => (
            <div>{activeUser.username}</div>
          ))}
        </div>
      </section>
      <section
        className={`${selectedChat ? !chatWidth && "w-[50%] max-sm:w-0 max-sm:hidden" : "w-full"} flex flex-col`}
        style={{ width: `${window.outerWidth - chatWidth!}px` }}
      >
        {chats.map((chat, i) => (
          <ChatLink chat={chat} key={i} onClick={() => setSelectedChat(chat)} />
        ))}
      </section>
      {selectedChat && (
        <section
          className={`${!chatWidth && "w-[50%]"} max-sm:w-full h-full flex flex-col min-h-0 border-l border-gray-300`}
          style={{ width: `${chatWidth}px` }}
        >
          <div
            className="h-full w-10 -ml-5 absolute z-0 cursor-col-resize max-md:hidden"
            onDrag={onChatResizeDrag}
          />
          <Chat
            chat={selectedChat}
            ref={selectedChatMethodsRef}
            hideChat={hideChat}
          />
        </section>
      )}
    </div>
  );
}
