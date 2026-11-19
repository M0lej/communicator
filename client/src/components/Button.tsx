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
        ${className}
        rounded-xl
        py-2.5
        px-6
        cursor-pointer
        font-semibold
        text-white
        bg-blue-600
        hover:bg-blue-700
        active:scale-[0.98]
        transition-colors duration-150
        shadow-sm
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
        disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none
    `}
    >
      {children}
    </button>
  );
}
