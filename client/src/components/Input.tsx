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
      className={`flex items-center border-1 border-gray-400 rounded-lg py-2 px-4 gap-3 ${className}`}
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
        className="w-full"
      >
        {children}
      </input>
      {inputProps.type == "password" && !inputProps.readOnly && (
        <div className="w-fit">
          {passwordVisible && (
            <EyeClosed
              className="fill-gray-400 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          )}
          {!passwordVisible && (
            <Eye
              className="fill-gray-400 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          )}
        </div>
      )}
    </div>
  );
}
