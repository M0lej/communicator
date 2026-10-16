import { Menu } from "@boxicons/react";
import MenuLink from "./components/MenuLink";
import { useEffect, useState, type ReactNode } from "react";
import { getUserData } from "./api/auth";
import { useUserContext } from "./providers/UserProvider";

export default function PageContainer({ page }: { page?: ReactNode }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { user, setUser } = useUserContext();
  const hideMenu = () => setExpanded(false);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const res = await getUserData();
    setUser(res);
  }

  return (
    <div className="w-full h-screen max-sm:flex flex-col grid grid-cols-[auto_1fr] grid-rows-1">
      <button
        className={`
          fixed 
          ${!expanded ? "left-5" : "max-sm:left-5 left-50"} 
          cursor-pointer 
          transition-all 
          z-20
          top-5
        `}
        onClick={() => setExpanded(!expanded)}
      >
        <Menu />
      </button>
      <section
        className={`
          h-full
          max-sm:fixed
          max-sm:w-full
          w-60
          ${!expanded ? "max-w-0" : "max-sm:max-w-full max-w-60"} 
        bg-red-400 
          transition-all
          flex
          flex-col
          items-center
          overflow-hidden
          pt-15
          gap-2
          z-10
        `}
      >
        {user !== null && <h1>Logged in as {user.username}</h1>}
        <MenuLink
          to={"/"}
          className="flex w-full justify-center py-5"
          onClick={hideMenu}
        >
          Chats
        </MenuLink>
        {user === null && (
          <MenuLink
            to={"/login"}
            className="flex w-full justify-center py-5"
            onClick={hideMenu}
          >
            Login
          </MenuLink>
        )}
        <MenuLink
          to={"/friends"}
          className="flex w-full justify-center py-5"
          onClick={hideMenu}
        >
          Friends
        </MenuLink>
        <MenuLink
          to={"/"}
          className="flex w-full justify-center py-5"
          onClick={hideMenu}
        >
          Account
        </MenuLink>
      </section>
      {page}
    </div>
  );
}
