import type { LabelHTMLAttributes, ReactNode } from "react";

interface ILabel extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
  className?: string;
}

export default function Label({ children, className, ...labelProps }: ILabel) {
  return (
    <label className={`flex flex-col gap-2 font-medium text-gray-700 ${className}`} {...labelProps}>
      {children}
    </label>
  );
}
