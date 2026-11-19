import { type ReactNode, type TextareaHTMLAttributes } from "react";

interface IInput extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  children?: ReactNode;
  className?: string;
}

export default function TextArea({
  children,
  className,
  ...inputProps
}: IInput) {
  return (
    <div
      className={`flex items-center border-2 border-blue-300 rounded-xl py-2 px-4 gap-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200 ${className} `}
    >
      <textarea
        {...inputProps}
        className="w-full outline-none bg-transparent text-gray-800 placeholder-gray-400 resize-none transition-[height] duration-300 ease-in-out"
      >
        {children}
      </textarea>
    </div>
  );
}
