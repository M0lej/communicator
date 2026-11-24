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
import { type IUserWithStatus } from "../api/users";

import { useLocation, useNavigate } from "react-router-dom";
import ChatLinkSkeleton from "../components/ChatLinkSkeleton";
import {
  FriendsActivityIndicator,
  type FriendsActivityIndicatorHandle,
} from "../components/FriendsActivityIndicator";

export default function Home() {
  const [chats, setChats] = useState<IChatWithTypingInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const selectedChatMethodsRef = useRef<IChatMethodsRef | null>(null);

  const homeContainerRef = useRef<HTMLDivElement | null>(null);
  const FriendsActivityIndicatorRef =
    useRef<FriendsActivityIndicatorHandle | null>(null);

  const { user } = useUserContext();
  const { service } = useWSContext();
  const [chatWidth, setChatWidth] = useState<number | null>();
  const [isResizingChat, setIsResizingChat] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);

  const [isChatsLoading, setIsChatsLoading] = useState(true);

  useEffect(() => {
    const state = location.state as { selectedChat?: IChat } | null;
    const chat = state?.selectedChat;

    if (!chat) return;

    setSelectedChat(chat);
    setChats((currentChats) =>
      currentChats.some((item) => item._id === chat._id)
        ? currentChats
        : [...currentChats, { ...chat, isTyping: false }],
    );

    navigate("/", { replace: true, state: null });
  }, [location.state, navigate]);

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
    async function fetchChats() {
      if (!user) {
        setIsChatsLoading(false);
        return;
      }

      setIsChatsLoading(true);

      try {
        const res: IChat[] = await getChats(user._id);

        if (res) {
          setChats(res.map((chat) => ({ ...chat, isTyping: false })));
        }
      } finally {
        setIsChatsLoading(false);
      }
    }

    void fetchChats();
  }, [user]);

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
          FriendsActivityIndicatorRef.current?.refreshFriends(data);
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

  function changeChatFullscreenState() {
    setIsChatFullscreen((isChatFullscreen) => !isChatFullscreen);
  }
  return (
    <div
      ref={homeContainerRef}
      className={`relative flex h-full min-h-0 w-full overflow-hidden bg-slate-50 ${isResizingChat ? "select-none" : ""}`}
    >
      <section className="flex min-h-0 w-full flex-col border-r border-slate-200 bg-white pt-16">
        <FriendsActivityIndicator
          ref={FriendsActivityIndicatorRef}
          onClick={openChat}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h2 className="px-6 pb-2 pt-4 text-lg font-semibold text-slate-900 sm:px-10">
            Chats
          </h2>

          {isChatsLoading
            ? Array.from({ length: 5 }, (_, index) => (
                <ChatLinkSkeleton
                  key={index}
                  className="w-full rounded-none px-6 sm:px-10"
                />
              ))
            : user &&
              chats.map((chat) => (
                <ChatLink
                  chat={chat}
                  key={chat._id}
                  className="w-full rounded-none px-6 sm:px-10"
                  onClick={() => setSelectedChat(chat)}
                />
              ))}
          {!isChatsLoading && chats.length === 0 && (
            <p className="px-6 py-4 text-sm text-slate-500 sm:px-10">
              No conversations yet. Start a chat with a friend.
            </p>
          )}
        </div>
      </section>
      {selectedChat && (
        <section
          className={`absolute inset-y-0 right-0 flex h-full min-h-0 w-1/2 origin-right flex-col border-l border-slate-200 bg-white shadow-lg max-sm:w-full ${isChatFullscreen && "w-full"} ${!isResizingChat ? "transition-[width]" : "transition-none"}`}
          style={
            chatWidth && !isChatFullscreen
              ? { width: `${chatWidth}px` }
              : undefined
          }
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
            isFullscreen={isChatFullscreen}
            changeFullscreenState={changeChatFullscreenState}
          />
        </section>
      )}
    </div>
  );
}
