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
      className={`flex items-center rounded-lg border border-slate-300 bg-white py-2 px-3 gap-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-150 ${className} `}
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
