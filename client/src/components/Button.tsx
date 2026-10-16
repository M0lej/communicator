import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
}

export default function Button({
  children,
  className,
  ...ButtonProps
}: IButton) {
  return (
    <button
      {...ButtonProps}
      className={`
        bg-red-400
        ${className}
        rounded-lg
        py-2
        px-4
        cursor-pointer
    `}
    >
      {children}
    </button>
  );
}
