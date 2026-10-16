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
    <Link {...linkProps} className={`bg-blue-500 ${className}`}>
      {children}
    </Link>
  );
}
