import { useCallback, useEffect, useRef, useState } from "react";
import { useUserContext } from "../providers/UserProvider";
import {
  createChat,
  getChats,
  type IChat,
  type IChatWithTypingInfo,
} from "../api/chats";
import ChatLink from "../components/ChatLink";
import { useWSContext } from "../providers/WSProvider";
import type {
  IWSIncomingActive,
  IWSIncomingMessage,
  IWSIncomingTyping,
} from "../api/ws";
import Chat, { type IChatMethodsRef } from "./Chat";
import { clamp } from "../utilities/clamp";
import { getFriends, type IUserWithStatus } from "../api/users";

import UsersStatusIndicator from "../components/UsersStatusIndicator";

export default function Home() {
  const [chats, setChats] = useState<IChatWithTypingInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const selectedChatMethodsRef = useRef<IChatMethodsRef | null>(null);
  const { user } = useUserContext();
  const { service } = useWSContext();
  const [friends, setFriends] = useState<IUserWithStatus[]>([]);
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
    fetchFriends();
  }, [user]);

  async function fetchChats() {
    if (!user) return;

    const res: IChat[] | null = await getChats(user._id);

    if (res) {
      setChats(res.map((chat) => ({ ...chat, isTyping: false })));
    }
  }

  async function fetchFriends() {
    const res: IUserWithStatus[] = await getFriends();

    if (res) {
      setFriends(res);
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
    const friendUserWithStatus: IUserWithStatus = {
      ...data.content.sender,
      status: data.content.content,
    };
    setFriends((users) =>
      users
        .map((friendUser: IUserWithStatus) => {
          if (friendUser._id === friendUserWithStatus._id) {
            return friendUserWithStatus;
          } else {
            return friendUser;
          }
        })
        .sort((userA, userB) => Number(userB.status) - Number(userA.status)),
    );
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

  async function openChat(otherUser: IUserWithStatus) {
    const chatExists = chats.find((chat: IChat) =>
      chat.users.includes(otherUser._id),
    );

    if (chatExists) {
      setSelectedChat(chatExists);
    } else {
      if (!user) {
        return;
      }

      const newChat = await createChat(user._id, otherUser._id);

      if (!newChat) {
        return;
      }

      updateChatsAndSelect(newChat);
    }
  }

  function updateChatsAndSelect(newChat: IChatWithTypingInfo) {
    setChats((chats) => [...chats, newChat]);
    setSelectedChat(newChat);
  }

  return (
    <div className="relative w-screen h-screen flex overflow-x-hidden">
      <section className="w-full flex flex-col pt-15">
        <section className="pl-10">
          <div className="flex gap-2">
            {friends.map((friend) => (
              <UsersStatusIndicator
                user={friend}
                onClick={() => openChat(friend)}
              />
            ))}
          </div>
        </section>
        {chats.map((chat, i) => (
          <ChatLink chat={chat} key={i} onClick={() => setSelectedChat(chat)} />
        ))}
      </section>
      {selectedChat && (
        <section
          className="absolute inset-y-0 right-0 w-1/2 max-sm:w-full h-full flex flex-col min-h-0 origin-right border-l border-gray-300 animate-pop-from-right"
          style={chatWidth ? { width: `${chatWidth}px` } : undefined}
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
