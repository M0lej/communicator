import { useEffect, useState } from "react";
import { useUserContext } from "../providers/UserProvider";
import { getChats, type IChat } from "../api/chats";
import ChatLink from "../components/ChatLink";

export default function Home() {
  const [chats, setChats] = useState<IChat[]>([]);
  const { user } = useUserContext();

  useEffect(() => {
    fetchChats();
  }, [user]);

  async function fetchChats() {
    console.log(user);
    if (!user) return;

    const res = await getChats(user._id);

    if (res) {
      setChats(res);
    }
  }

  return (
    <>
      <section className="w-full flex flex-col mt-10 gap-2">
        {chats.map((chat, i) => (
          <ChatLink chat={chat} key={i} />
        ))}
      </section>
    </>
  );
}
