import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

interface IMenuLink extends LinkProps {
  children?: ReactNode;
  className?: string;
}

export default function MenuLink({
  children,
  className,
  ...linkProps
}: IMenuLink) {
  return (
    <Link
      {...linkProps}
      className={`rounded-xl border border-blue-400/20 bg-blue-800/40 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-700/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  );
}
