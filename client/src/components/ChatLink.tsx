import { Link } from "react-router-dom";
import type { IChatWithTypingInfo } from "../api/chats";
import { useUserContext } from "../providers/UserProvider";
import type { IMessage } from "../api/messages";

interface IChatLink {
  chat: IChatWithTypingInfo;
  className?: string;
  latestMessage?: IMessage;
}

export default function ChatLink({
  chat,
  className,
  latestMessage,
}: IChatLink) {
  const { user } = useUserContext();

  const label = (chat.userNames ?? []).filter(
    (userName) => userName != user?.username,
  )[0];

  if (!latestMessage) {
    latestMessage = chat.latestMessage;
  }

  return (
    <Link
      to={`/chat/${chat._id}`}
      className={`py-4 px-8 rounded-l h-fit flex items-center gap-4 hover:bg-gray-200 transition-colors ${className}`}
    >
      <div className="h-10 aspect-square rounded-full bg-gray-400" />
      <div className="flex flex-col">
        <h2>{label}</h2>
        <p className="text-xs text-gray-400">
          {chat.isTyping ? (
            `${label} is typing...`
          ) : (
            <>
              {latestMessage.sender == user?._id ? "You: " : `${label}: `}
              {latestMessage.content}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
