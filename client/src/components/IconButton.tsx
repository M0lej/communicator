import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

export default function IconButton({
  icon,
  className = "",
  type = "button",
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={`flex cursor-pointer items-center justify-center rounded-lg p-2 text-blue-700 transition hover:bg-blue-50 hover:text-blue-900 ${className}`}
    >
      {icon}
    </button>
  );
}
