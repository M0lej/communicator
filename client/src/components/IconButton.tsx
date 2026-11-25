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
      className={`flex cursor-pointer items-center justify-center rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 ${className}`}
    >
      {icon}
    </button>
  );
}
