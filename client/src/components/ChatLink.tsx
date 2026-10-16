import { Link } from "react-router-dom";
import type { IChat } from "../api/chats";
import { useUserContext } from "../providers/UserProvider";

interface IChatLink {
  chat: IChat;
  className?: string;
}

export default function ChatLink({ chat, className }: IChatLink) {
  const { user } = useUserContext();
  const label = chat.userNames.filter(
    (userName) => userName != user?.username,
  )[0];

  return (
    <Link
      to={`/chat/${chat._id}`}
      className={`py-4 px-8 rounded-lg bg-blue-300 h-fit flex items-center gap-4 ${className}`}
    >
      <div className="h-10 aspect-square rounded-full bg-gray-400" />
      <h2>{label}</h2>
    </Link>
  );
}
