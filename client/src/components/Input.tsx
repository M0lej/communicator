import type { InputHTMLAttributes, ReactNode } from "react";

interface IInput extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode;
  className?: string;
}

export default function Input({ children, className, ...inputProps }: IInput) {
  return (
    <input
      {...inputProps}
      className={`
        bg-baby-powder-white  
        ${className}
        rounded-lg
        py-2
        px-4
    `}
    >
      {children}
    </input>
  );
}
