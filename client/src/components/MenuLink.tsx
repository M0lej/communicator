import type { ReactNode } from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";

interface IMenuLink extends Omit<NavLinkProps, "className"> {
  children?: ReactNode;
  className?: string;
}

export default function MenuLink({
  children,
  className,
  ...linkProps
}: IMenuLink) {
  return (
    <NavLink
      {...linkProps}
      end={linkProps.to === "/"}
      className={({ isActive }) =>
        `flex w-full gap-2 rounded-lg border px-4 py-3 text-center font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
          isActive
            ? "border-indigo-400/20 bg-indigo-500/90 text-white"
            : "border-transparent text-slate-300 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
        } ${className ?? ""}`
      }
    >
      {children}
    </NavLink>
  );
}
