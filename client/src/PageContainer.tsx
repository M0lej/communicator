import { Menu } from "@boxicons/react";
import MenuLink from "./components/MenuLink";
import { useState, type ReactNode } from "react";

export default function PageContainer({ page }: { page?: ReactNode }) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const hideMenu = () => setExpanded(false);

  return (
    <div className="w-screen h-screen max-sm:flex grid grid-cols-[auto_1fr] grid-rows-1">
      <button
        className={`
          fixed 
          ${!expanded ? "left-5" : "max-sm:left-5 left-50"} 
          cursor-pointer 
          transition-all 
          z-10
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
        `}
      >
        <MenuLink
          to={"/"}
          className="flex w-full justify-center py-5"
          onClick={hideMenu}
        >
          Home
        </MenuLink>
        <MenuLink
          to={"/login"}
          className="flex w-full justify-center py-5"
          onClick={hideMenu}
        >
          Login
        </MenuLink>
        <MenuLink
          to={"/"}
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
          Settings
        </MenuLink>
      </section>
      {page}
    </div>
  );
}
