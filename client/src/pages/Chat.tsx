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
import { MessageCircleDots, Send, X } from "@boxicons/react";
import { useWSContext } from "../providers/WSProvider";
import type { IWSIncomingMessage, IWSIncomingTyping } from "../api/ws";
import TextArea from "../components/TextArea";
import { clamp } from "../utilities/clamp";

function isAtPageBottom() {
  const page = document.documentElement;
  const scrollHeight = Math.max(page.scrollHeight, document.body.scrollHeight);

  return window.scrollY + window.innerHeight >= scrollHeight - 1;
}

export interface IChatMethodsRef {
  receiveNewMessage: (data: IWSIncomingMessage) => void;
  receiveNewTypingStatus: (IWSIncomingMessage: IWSIncomingTyping) => void;
}

interface IChatProps {
  chat: IChat;
  hideChat: () => void;
}

const Chat = forwardRef<IChatMethodsRef, IChatProps>(
  ({ chat, hideChat }, ref) => {
    const { user } = useUserContext();

    const [otherUsername, setOtherUsername] = useState<string>("other user");
    const [otherUserId, setOtherUserId] = useState<string | null>(null);

    const [messages, setMessages] = useState<IMessage[]>([]);
    const { service: wsService } = useWSContext();

    const chatRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const firstMessagesRef = useRef<(HTMLDivElement | null)[]>([]);

    const [isTyping, setTyping] = useState(false);
    const [messagesStartIndexId, setMsgsStartIndexId] = useState(0);
    const isTypingRef = useRef(false);
    const shouldScrollAfterTypingChangeRef = useRef(false);

    const [textAreaRows, setTextAreaRows] = useState(1);

    useEffect(() => {
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
      setOtherUserId(chat.users.find((id) => id !== user._id) ?? null);
      setOtherUsername(
        chat.userNames.find((username) => username != user.username) ??
          "other user",
      );
    }

    useImperativeHandle(
      ref,
      () => ({
        receiveNewMessage(data) {
          if (!chat || data.message.chatId !== chat._id) return;

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
          shouldScrollAfterTypingChangeRef.current = isAtPageBottom();
          setTyping(data.content.content);
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
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const sendMessage: SubmitEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      const content = formData.get("content");

      if (!wsService || !chat || !otherUserId || typeof content !== "string") {
        return;
      }

      wsService.sendMessage(chat._id, otherUserId, content);

      event.currentTarget.reset();
    };

    function onInputFocus() {
      if (!wsService || !chat || !otherUserId) return;
      wsService.notifyTyping(chat._id, otherUserId, true);
    }

    function onInputBlur() {
      if (!wsService || !chat || !otherUserId) return;
      wsService.notifyTyping(chat._id, otherUserId, false);
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

    if (!chat) return null;

    return (
      <>
        <div className="w-full h-16 flex items-center justify-center relative">
          <button
            className="sm:left-6 max-sm:right-6 max-sm absolute cursor-pointer"
            onClick={hideChat}
          >
            <X />
          </button>
          {otherUsername}
        </div>
        <div
          className="flex flex-col gap-2 overflow-y-scroll h-full overflow-x-hidden pb-2 px-2"
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
          {isTyping && (
            <p className="flex mt-2 text-gray-500 animate-pulse">
              {otherUsername} is typing
              <MessageCircleDots className="fill-gray-500 ml-2" />
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="w-full bottom-0 h-fit grid grid-cols-[1fr_auto] p-2 gap-2"
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
            style={{ resize: "none" }}
          />
          <Button
            className="h-full flex items-center gap-2 text-blue-500"
            type="submit"
          >
            Send
            <Send className="fill-blue-500" />
          </Button>
        </form>
      </>
    );
  },
);

export default Chat;
