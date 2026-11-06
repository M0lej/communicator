import type { ButtonHTMLAttributes } from "react";
import type { IUserWithStatus } from "../api/users";

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  user: IUserWithStatus;
}

export default function UsersStatusIndicator({ user, ...props }: IProps) {
  return (
    <button
      className="flex flex-col w-fit min-w-20 gap-2 items-center relative cursor-pointer hover:scale-105 transition-all"
      {...props}
    >
      <div className="relative">
        <img
          className="h-10 aspect-square rounded-full bg-gray-400"
          src={`/api/avatar/${encodeURIComponent(user._id)}`}
        />
        {user.status && (
          <div className="absolute rounded-full w-3 aspect-square bg-green-400 right-0 bottom-0"></div>
        )}
      </div>
      <p>{user.username}</p>
    </button>
  );
}
