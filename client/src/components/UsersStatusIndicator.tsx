import type { ButtonHTMLAttributes } from "react";
import type { IUserWithStatus } from "../api/users";
import Avatar from "./Avatar";

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  user: IUserWithStatus;
}

export default function UserStatusIndicator({ user, ...props }: IProps) {
  return (
    <button
      className="relative flex w-fit max-w-full min-w-0 shrink-0 flex-col items-center gap-1.5 cursor-pointer transition-opacity duration-150 hover:opacity-75"
      title={user.username}
      {...props}
    >
      <div className="relative">
        <Avatar
          user={user}
          className="h-9 w-9 rounded-full ring-1 ring-slate-200"
        />
        {user.status && (
          <div className="absolute rounded-full w-3 aspect-square bg-green-500 right-0 bottom-0 ring-2 ring-white"></div>
        )}
      </div>
      <p className="max-w-full truncate text-center text-sm font-medium text-gray-700">
        {user.username}
      </p>
    </button>
  );
}
