import { Eye, EyeClosed } from "@boxicons/react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

interface IInput extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode;
  className?: string;
}

export default function Input({ children, className, ...inputProps }: IInput) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setPasswordVisible((value) => !value);
  }

  return (
    <div
      className={`flex items-center rounded-lg border border-slate-300 bg-white py-2 px-3 gap-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-150 ${className}`}
    >
      <input
        {...inputProps}
        type={
          inputProps.type === "password"
            ? passwordVisible
              ? "text"
              : "password"
            : inputProps.type
        }
        className="w-full outline-none bg-transparent text-gray-800 placeholder-gray-400"
      >
        {children}
      </input>
      {inputProps.type == "password" && !inputProps.readOnly && (
        <div className="w-fit">
          {passwordVisible && (
            <EyeClosed
              className="fill-blue-400 cursor-pointer hover:fill-blue-600 transition-colors"
              onClick={togglePasswordVisibility}
            />
          )}
          {!passwordVisible && (
            <Eye
              className="fill-blue-400 cursor-pointer hover:fill-blue-600 transition-colors"
              onClick={togglePasswordVisibility}
            />
          )}
        </div>
      )}
    </div>
  );
}
