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
  const homeContainerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();
  const { service } = useWSContext();
  const [friends, setFriends] = useState<IUserWithStatus[]>([]);
  const [chatWidth, setChatWidth] = useState<number | null>();
  const [isResizingChat, setIsResizingChat] = useState(false);

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

  function onChatResizeStart(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizingChat(true);
    resizeChatToPointer(event.clientX);
  }

  function onChatResizeDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      resizeChatToPointer(event.clientX);
    }
  }

  function onChatResizeEnd() {
    setIsResizingChat(false);
  }

  function resizeChatToPointer(clientX: number) {
    const bounds = homeContainerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    setChatWidth(
      clamp(bounds.right - clientX, bounds.width / 4, (bounds.width * 3) / 4),
    );
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
    <div
      ref={homeContainerRef}
      className={`relative flex h-full min-h-0 w-full overflow-hidden bg-slate-50 ${isResizingChat ? "select-none" : ""}`}
    >
      <section className="flex min-h-0 w-full flex-col border-r border-slate-200 bg-white pt-16">
        {friends.filter((friend) => friend.status == true).length > 0 && (
          <section className="border-b border-slate-200 px-6 py-4 sm:px-10">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Online friends
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {friends.map((friend) => (
                <UsersStatusIndicator
                  user={friend}
                  key={friend._id}
                  onClick={() => openChat(friend)}
                />
              ))}
            </div>
          </section>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h2 className="px-6 pb-2 pt-4 text-lg font-semibold text-slate-900 sm:px-10">
            Chats
          </h2>
          {chats.map((chat) => (
            <ChatLink
              chat={chat}
              key={chat._id}
              className="w-full rounded-none px-6 sm:px-10"
              onClick={() => setSelectedChat(chat)}
            />
          ))}
          {chats.length === 0 && (
            <p className="px-6 py-4 text-sm text-slate-500 sm:px-10">
              No conversations yet. Start a chat with a friend.
            </p>
          )}
        </div>
      </section>
      {selectedChat && (
        <section
          className="absolute inset-y-0 right-0 flex h-full min-h-0 w-1/2 origin-right flex-col border-l border-slate-200 bg-white shadow-lg max-sm:w-full"
          style={chatWidth ? { width: `${chatWidth}px` } : undefined}
        >
          <div
            className="absolute inset-y-0 -left-5 z-10 hidden w-10 touch-none cursor-col-resize select-none md:block"
            onPointerDown={onChatResizeStart}
            onPointerMove={onChatResizeDrag}
            onPointerUp={onChatResizeEnd}
            onPointerCancel={onChatResizeEnd}
            onLostPointerCapture={onChatResizeEnd}
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
