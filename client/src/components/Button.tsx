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
        bg-linear-to-r from-blue-500 to-blue-700
        hover:from-blue-600 hover:to-blue-800
        active:scale-[0.98]
        transition-all duration-200
        shadow-md hover:shadow-lg
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
        disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none
    `}
    >
      {children}
    </button>
  );
}
