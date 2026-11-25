import type { IChatWithTypingInfo } from "../api/chats";
import { useUserContext } from "../providers/UserProvider";
import type { IMessage } from "../api/messages";
import type { ButtonHTMLAttributes } from "react";
import TypingIndicator from "./TypingIndicator";
import Avatar from "./Avatar";
import type { IUserWithStatus } from "../api/users";

interface IChatLink extends ButtonHTMLAttributes<HTMLButtonElement> {
  chat: IChatWithTypingInfo;
  className?: string;
  latestMessage?: IMessage;
  selected?: boolean;
}

export default function ChatLink({
  chat,
  className,
  latestMessage,
  selected = false,
  ...props
}: IChatLink) {
  const { user } = useUserContext();

  const otherUser: IUserWithStatus | null =
    chat.users.find((chatUser) => chatUser._id != user?._id) ?? null;
  const label = otherUser?.username ?? "Deleted user";

  if (!latestMessage) {
    latestMessage = chat.latestMessage;
  }

  return (
    <button
      className={`h-[50px] flex items-center gap-2.5 px-2 rounded-md cursor-pointer transition-colors duration-150 ${
        selected
          ? "bg-indigo-50 text-slate-900"
          : "hover:bg-slate-50 text-slate-800"
      } ${className}`}
      {...props}
    >
      <Avatar
        user={{
          _id: otherUser?._id ?? "",
          username: otherUser ? label : "X",
        }}
        className="h-8 w-8 rounded-full"
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
