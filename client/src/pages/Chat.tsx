import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type SubmitEventHandler,
} from "react";
import { useUserContext } from "../providers/UserProvider";
import { type IChat } from "../api/chats";
import {
  getLatestMessages,
  getOlderMessages,
  type IMessage,
} from "../api/messages";
import ChatBubble from "../components/ChatBubble";
import Button from "../components/Button";
import {
  Fullscreen,
  FullscreenExit,
  RadioCircleMarked,
  Send,
  X,
} from "@boxicons/react";
import IconButton from "../components/IconButton";
import { useWSContext } from "../providers/WSProvider";
import type {
  IWSIncomingActive,
  IWSIncomingMessage,
  IWSIncomingTyping,
} from "../api/ws";
import TextArea from "../components/TextArea";
import TypingIndicator from "../components/TypingIndicator";
import { clamp } from "../utilities/clamp";
import type { IUserWithStatus } from "../api/users";

function isAtBottom(element: HTMLElement | null) {
  return (
    element !== null &&
    element.scrollHeight - element.scrollTop - element.clientHeight <= 1
  );
}

export interface IChatMethodsRef {
  receiveNewMessage: (data: IWSIncomingMessage) => void;
  receiveNewTypingStatus: (IWSIncomingMessage: IWSIncomingTyping) => void;
  receiveNewStatus: (IWSIncomingActive: IWSIncomingActive) => void;
}

interface IChatProps {
  chat: IChat;
  isFullscreen: boolean;
  changeFullscreenState: () => void;
  hideChat: () => void;
}

const defaultUsername = "Deleted user";

const Chat = forwardRef<IChatMethodsRef, IChatProps>(
  ({ chat, hideChat, isFullscreen, changeFullscreenState }, ref) => {
    const { user } = useUserContext();

    const [otherUser, setOtherUser] = useState<IUserWithStatus | null>(null);

    const [messages, setMessages] = useState<IMessage[]>([]);
    const { service: wsService } = useWSContext();

    const chatRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const firstMessagesRef = useRef<(HTMLDivElement | null)[]>([]);
    const shouldScrollAfterIncomingMessageRef = useRef<boolean | null>(null);

    const [isTyping, setTyping] = useState(false);
    const [messagesStartIndexId, setMsgsStartIndexId] = useState(0);
    const [isActive, setActive] = useState(false);
    const isTypingRef = useRef(false);
    const shouldScrollAfterTypingChangeRef = useRef(false);

    const [textAreaRows, setTextAreaRows] = useState(1);

    useEffect(() => {
      const shouldScrollAfterIncomingMessage =
        shouldScrollAfterIncomingMessageRef.current;
      shouldScrollAfterIncomingMessageRef.current = null;

      if (shouldScrollAfterIncomingMessage !== null) {
        if (shouldScrollAfterIncomingMessage) scrollToBottom();
        return;
      }

      if (messagesStartIndexId > 0) {
        scrollToPreviousSectionFirstMsg();
      } else {
        scrollToBottom();
      }
    }, [messages]);

    useEffect(() => {
      if (!shouldScrollAfterTypingChangeRef.current) return;

      shouldScrollAfterTypingChangeRef.current = false;
      scrollToBottom();
    }, [isTyping]);

    useEffect(() => {
      function increaseMsgsStartIndex() {
        if (chatRef.current?.scrollTop === 0) {
          setMsgsStartIndexId((currentIndex) => {
            getMessages(currentIndex + 1);
            return currentIndex + 1;
          });
        }
      }

      chatRef.current?.addEventListener("scroll", increaseMsgsStartIndex);

      return () =>
        chatRef.current?.removeEventListener("scroll", increaseMsgsStartIndex);
    }, [chatRef.current]);

    useEffect(() => {
      if (!user) {
        return;
      }

      setOtherUserInfo();
      getMessages();
    }, [user, chat]);

    function setOtherUserInfo() {
      if (!user) return;
      const res: IUserWithStatus | null = Array.isArray(chat.users)
        ? (chat.users.find((otherUser) => otherUser._id !== user._id) ?? null)
        : null;

      if (res) {
        setOtherUser(res);
        setActive(res.status);
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        receiveNewMessage(data) {
          if (!chat || data.message.chatId !== chat._id) return;

          shouldScrollAfterIncomingMessageRef.current =
            isAtBottom(chatRef.current);
          setMessages((currentMessages) =>
            currentMessages.some((message) => message._id === data.message._id)
              ? currentMessages
              : [...currentMessages, data.message],
          );
        },
        receiveNewTypingStatus(data) {
          if (!chat || data.content.chatId !== chat._id) return;
          if (isTypingRef.current === data.content.content) return;

          isTypingRef.current = data.content.content;
          shouldScrollAfterTypingChangeRef.current = isAtBottom(chatRef.current);
          setTyping(data.content.content);
        },
        receiveNewStatus(data) {
          const status = data.content.content;
          setActive(status);
        },
      }),
      [chat],
    );

    async function getMessages(startIndex = 0) {
      if (!user || !chat) return;

      if (startIndex != 0) {
        const fetchedMessages = (
          (await getOlderMessages(user._id, chat._id, startIndex)) as IMessage[]
        ).reverse();

        if (fetchedMessages.length == 0) {
          setMsgsStartIndexId((currentIndex) => currentIndex - 1);
        } else {
          setMessages((currentMessages) => [
            ...fetchedMessages,
            ...currentMessages,
          ]);
        }
      } else {
        const fetchedMessages = (
          (await getLatestMessages(user._id, chat._id)) as IMessage[]
        ).reverse();

        setMessages(fetchedMessages);
      }
    }

    function scrollToPreviousSectionFirstMsg() {
      if (firstMessagesRef.current.length > 1) {
        firstMessagesRef.current.at(-1)?.scrollIntoView();
      }
    }

    function scrollToBottom() {
      bottomRef.current?.scrollIntoView();
    }

    const sendMessage: SubmitEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      const content = formData.get("content");

      if (!wsService || !chat || !otherUser || typeof content !== "string") {
        return;
      }

      wsService.sendMessage(chat._id, otherUser._id, content);

      event.currentTarget.reset();
    };

    function onInputFocus() {
      if (!wsService || !chat || !otherUser) return;
      wsService.notifyTyping(chat._id, otherUser._id, true);
    }

    function onInputBlur() {
      if (!wsService || !chat || !otherUser) return;
      wsService.notifyTyping(chat._id, otherUser._id, false);
    }

    function addSectionFirstMessageRef(el: HTMLDivElement | null) {
      if (!el || firstMessagesRef.current.includes(el)) return;

      firstMessagesRef.current.unshift(el);
      if (firstMessagesRef.current.length >= 3) {
        firstMessagesRef.current.pop();
      }
    }

    function onInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
      setTextAreaRows(
        clamp(event.currentTarget.value.split("\n").length, 1, 6),
      );
    }

    function onMessageKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (event.key !== "Enter" || event.shiftKey) return;

      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }

    if (!chat) return null;

    return (
      <>
        <div className="relative flex h-12 w-full shrink-0 items-center border-b border-slate-200 bg-white px-4 text-[15px] font-bold text-slate-900">
          <IconButton
            className={
              isFullscreen
                ? "absolute right-5"
                : "absolute right-5 sm:left-5 sm:right-auto"
            }
            onClick={hideChat}
            aria-label="Close chat"
            icon={<X />}
          />
          <h1
            className={`flex items-center gap-2 ${isFullscreen ? "ml-0" : "sm:ml-13"}`}
          >
            <RadioCircleMarked
              className={`${isActive ? "fill-green-500" : "fill-gray-500"}`}
            />
            {otherUser?.username ?? defaultUsername}
          </h1>
          <div
            className={`absolute right-20 top-1/2 flex -translate-y-1/2 items-center gap-2 ${
              isFullscreen ? "sm:right-20" : "sm:right-5"
            }`}
          >
            {isTyping && (
              <TypingIndicator
                label={`${otherUser?.username ?? defaultUsername} is typing`}
                color="blue"
              />
            )}
            <IconButton
              className="max-sm:hidden"
              onClick={changeFullscreenState}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              icon={
                isFullscreen ? (
                  <FullscreenExit />
                ) : (
                  <Fullscreen className="fill-blue-700" />
                )
              }
            />
          </div>
        </div>
        <div
          className="flex h-full min-h-0 flex-col gap-2 overflow-x-hidden overflow-y-auto bg-[#f7f8fa] px-4 py-3 sm:px-5"
          ref={chatRef}
        >
          {messages.map((message, i) => {
            return (
              <ChatBubble
                isSender={message.sender == user?._id}
                key={message._id}
                id={message._id}
                ref={i === 0 ? (el) => addSectionFirstMessageRef(el) : null}
              >
                {message.content}
              </ChatBubble>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {}
        <form
          className="grid h-fit w-full shrink-0 grid-cols-[1fr_auto] gap-2 border-t border-slate-200 bg-white p-2.5 sm:p-3"
          onSubmit={sendMessage}
        >
          <TextArea
            placeholder="message..."
            className="h-fit"
            name="content"
            id="content"
            rows={textAreaRows}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onChange={onInputChange}
            onKeyDown={onMessageKeyDown}
            style={{ resize: "none" }}
          />
          <Button className="flex h-full items-center gap-2" type="submit">
            Send
            <Send className="fill-white" />
          </Button>
        </form>
      </>
    );
  },
);

export default Chat;
