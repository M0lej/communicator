import { useEffect, useRef, useState, type SubmitEventHandler } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getChat, type IChat } from "../api/chats";
import { useUserContext } from "../providers/UserProvider";
import {
  getLatestMessages,
  getOlderMessages,
  MessagesWSService,
  type IMessage,
  type WSmessages,
  type WStyping,
} from "../api/messages";
import ChatBubble from "../components/ChatBubble";
import Input from "../components/Input";
import Button from "../components/Button";
import { MessageCircleDots } from "@boxicons/react";

function isAtPageBottom() {
  const page = document.documentElement;
  const scrollHeight = Math.max(page.scrollHeight, document.body.scrollHeight);

  return window.scrollY + window.innerHeight >= scrollHeight - 1;
}

export default function Chat() {
  const { user } = useUserContext();
  const [otherUsername, setOtherUsername] = useState<string>("other user");

  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IMessage[]>([]);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstMessagesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [msgService, setMsgService] = useState<MessagesWSService | null>(null);
  const [isTyping, setTyping] = useState(false);
  const [messagesStartIndexId, setMsgsStartIndexId] = useState(0);
  const isTypingRef = useRef(false);
  const shouldScrollAfterTypingChangeRef = useRef(false);

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
    validateChatExistence();
    getMessages();

    if (user && chatId) {
      setMsgService(new MessagesWSService(receiveUpdates, user._id, chatId));
    }
  }, [chatId, user]);

  useEffect(() => {
    return () => msgService?.closeConnection();
  }, [msgService]);

  async function validateChatExistence() {
    if (!user || !chatId || user._id.length != 24 || chatId.length != 24) {
      navigate("/");
      return;
    }

    const chat: IChat | null = await getChat(user._id, chatId);

    if (!chat) {
      navigate("/");
    }

    setOtherUsername(
      chat!.userNames.find((username) => username !== user.username) ??
        "other user",
    );
  }

  function receiveUpdates(event: MessageEvent) {
    if (!event.data) return;
    const data: WSmessages | WStyping = JSON.parse(event.data);

    switch (data.type) {
      case "messages":
        setMessages(data.content.reverse());
        break;
      case "typing":
        if (isTypingRef.current === data.value) break;

        isTypingRef.current = data.value;
        shouldScrollAfterTypingChangeRef.current = isAtPageBottom();
        setTyping(data.value);
        break;
    }
  }

  async function getMessages(startIndex = 0) {
    if (!user || !chatId) return;

    if (startIndex != 0) {
      const fetchedMessages = (
        (await getOlderMessages(user._id, chatId, startIndex)) as IMessage[]
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
        (await getLatestMessages(user._id, chatId)) as IMessage[]
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

  // send a new message
  const sendMessage: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const content = formData.get("content");

    if (!msgService || !content) return;
    msgService.sendMessage(content as string);

    event.currentTarget.reset();
  };

  function onInputFocus() {
    if (!msgService) return;
    msgService.notifyTyping(true);
  }

  function onInputBlur() {
    if (!msgService) return;
    msgService.notifyTyping(false);
  }

  function addSectionFirstMessageRef(el: HTMLDivElement | null) {
    if (!el || firstMessagesRef.current.includes(el)) return;

    firstMessagesRef.current.unshift(el);
    if (firstMessagesRef.current.length >= 3) {
      firstMessagesRef.current.pop();
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-16 bg-red-400 flex items-center justify-center">
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
            {otherUsername}
            is typing
            <MessageCircleDots className="fill-gray-500 ml-2" />
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="w-full bg-red-200 bottom-0 h-15 grid grid-cols-[1fr_auto] p-2 gap-2"
        onSubmit={sendMessage}
      >
        <Input
          type="text"
          placeholder="message..."
          className="h-full "
          name="content"
          id="content"
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        <Button className="h-full w-30" type="submit">
          Send
        </Button>
      </form>
    </div>
  );
}
