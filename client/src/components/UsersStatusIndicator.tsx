import type { ButtonHTMLAttributes } from "react";
import type { IUserWithStatus } from "../api/users";

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  user: IUserWithStatus;
}

export default function UsersStatusIndicator({ user, ...props }: IProps) {
  return (
    <button
      className="flex flex-col w-fit min-w-20 gap-2 items-center relative cursor-pointer hover:scale-105 transition-all duration-200"
      {...props}
    >
      <div className="relative">
        <img
          className="h-10 aspect-square rounded-full bg-linear-to-br from-blue-200 to-blue-400 shadow-md"
          src={`/api/avatar/${encodeURIComponent(user._id)}`}
        />
        {user.status && (
          <div className="absolute rounded-full w-3 aspect-square bg-green-500 right-0 bottom-0 ring-2 ring-white"></div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-700">{user.username}</p>
    </button>
  );
}
