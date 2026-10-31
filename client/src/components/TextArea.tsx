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
      className={`flex items-center border border-gray-400 rounded-lg py-2 px-4 gap-3 ${className} `}
    >
      <textarea
        {...inputProps}
        className="w-full outline-0 transition-[height] duration-300 ease-in-out"
      >
        {children}
      </textarea>
    </div>
  );
}
