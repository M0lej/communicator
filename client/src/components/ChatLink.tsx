import type { IChatWithTypingInfo } from "../api/chats";
import { useUserContext } from "../providers/UserProvider";
import type { IMessage } from "../api/messages";
import type { ButtonHTMLAttributes } from "react";

interface IChatLink extends ButtonHTMLAttributes<HTMLButtonElement> {
  chat: IChatWithTypingInfo;
  className?: string;
  latestMessage?: IMessage;
}

export default function ChatLink({
  chat,
  className,
  latestMessage,
  ...props
}: IChatLink) {
  const { user } = useUserContext();

  const label = (chat.userNames ?? []).filter(
    (userName) => userName != user?.username,
  )[0];

  if (!latestMessage) {
    latestMessage = chat.latestMessage;
  }

  const otherUserId: string =
    chat.users.find((chatUserId) => chatUserId != user?._id) ?? "";

  return (
    <button
      className={`py-4 px-8 rounded-l h-fit flex items-center gap-4 hover:bg-gray-200 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <img
        className="h-10 aspect-square rounded-full bg-gray-400"
        src={`/api/avatar/${encodeURIComponent(otherUserId)}`}
      />
      <div className="flex flex-col">
        <h2>{label}</h2>
        <p className="text-xs text-gray-400">
          {chat.isTyping
            ? `${label} is typing...`
            : latestMessage && (
                <>
                  {latestMessage.sender == user?._id ? "You: " : `${label}: `}
                  {latestMessage.content}
                </>
              )}
        </p>
      </div>
    </button>
  );
}
