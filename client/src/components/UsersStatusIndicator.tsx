import type { ButtonHTMLAttributes } from "react";
import type { IUserWithStatus } from "../api/users";
import { apiUrl } from "../api/client";

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  user: IUserWithStatus;
}

export default function UserStatusIndicator({ user, ...props }: IProps) {
  return (
    <button
      className="flex flex-col w-fit min-w-20 gap-2 items-center relative cursor-pointer hover:scale-105 transition-all duration-200"
      {...props}
    >
      <div className="relative">
        <img
          className="h-10 aspect-square rounded-full bg-blue-100 ring-1 ring-slate-200"
          src={apiUrl(`/api/avatar/${encodeURIComponent(user._id)}`)}
          alt=""
        />
        {user.status && (
          <div className="absolute rounded-full w-3 aspect-square bg-green-500 right-0 bottom-0 ring-2 ring-white"></div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-700">{user.username}</p>
    </button>
  );
}
