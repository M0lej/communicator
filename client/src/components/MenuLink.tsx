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
        `w-full rounded-lg border px-4 py-3 text-center font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
          isActive
            ? "border-blue-400/40 bg-blue-700 text-white"
            : "border-transparent text-blue-100 hover:border-blue-500 hover:bg-blue-700"
        } ${className ?? ""}`
      }
    >
      {children}
    </NavLink>
  );
}
