import type { IChatWithTypingInfo } from "../api/chats";
import { useUserContext } from "../providers/UserProvider";
import type { IMessage } from "../api/messages";
import type { ButtonHTMLAttributes } from "react";
import TypingIndicator from "./TypingIndicator";
import { apiUrl } from "../api/client";

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
      className={`py-4 px-8 rounded-xl h-fit flex items-center gap-4 hover:bg-blue-50 transition-all duration-200 cursor-pointer border-b border-gray-100 ${className}`}
      {...props}
    >
      <img
        className="h-10 aspect-square rounded-full bg-gray-400"
        src={apiUrl(`/api/avatar/${encodeURIComponent(otherUserId)}`)}
      />
      <div className="min-w-0 flex flex-col text-left">
        <h2 className="truncate font-semibold text-slate-800">{label}</h2>
        <p className="max-w-full truncate text-xs text-slate-500">
          {chat.isTyping ? (
            <TypingIndicator
              label={`${label} is typing`}
              className="scale-[0.8] origin-left align-middle"
            />
          ) : (
            latestMessage && (
              <>
                {latestMessage.sender == user?._id ? "You: " : `${label}: `}
                {latestMessage.content}
              </>
            )
          )}
        </p>
      </div>
    </button>
  );
}
