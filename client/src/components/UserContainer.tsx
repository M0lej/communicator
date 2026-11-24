import {
  Discussion,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
} from "@boxicons/react";
import type { ReactNode } from "react";
import { Form } from "react-router-dom";
import type { UsersIntent } from "../api/users";
import { useUserContext, type IUser } from "../providers/UserProvider";
import { apiUrl } from "../api/client";

export type UserContainerVariant = "found" | "pending" | "sent" | "friend";

type UserContainerProps = {
  user: IUser;
  action?: string;
} & (
  | {
      variant: "friend";
      onStartChat: (friendUserId: string) => void;
    }
  | {
      variant: "found" | "pending" | "sent";
      onStartChat?: never;
    }
);

interface FormAction {
  intent: UsersIntent;
  icon: ReactNode;
}

const formActions: Record<UserContainerVariant, FormAction[]> = {
  found: [{ intent: "add", icon: <UserPlus /> }],
  pending: [
    { intent: "pending_accept", icon: <UserCheck /> },
    { intent: "pending_deny", icon: <UserX /> },
  ],
  sent: [],
  friend: [{ intent: "remove", icon: <UserMinus /> }],
};

export function UserContainer(props: UserContainerProps) {
  const { user, variant, action = "/friends" } = props;
  const { user: currentUser } = useUserContext();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors hover:border-blue-200 sm:px-6">
      <div className="flex items-center gap-4">
        <img
          src={apiUrl(`/api/avatar/${encodeURIComponent(user._id)}`)}
          className="aspect-square h-10 rounded-full"
          alt=""
        />
        <span className="min-w-0 truncate font-medium">{user.username}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-blue-700 sm:gap-4">
        {variant === "friend" && (
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-blue-700 transition hover:bg-blue-100 hover:text-blue-900"
            onClick={() => props.onStartChat(user._id)}
            aria-label={`Start chat with ${user.username}`}
          >
            <Discussion />
          </button>
        )}
        {formActions[variant].map(({ intent, icon }) => (
          <Form method="post" action={action} key={intent}>
            <input type="hidden" name="intent" value={intent} />
            <input type="hidden" name="userId" value={currentUser?._id ?? ""} />
            <input type="hidden" name="otherId" value={user._id} />
            <button
              type="submit"
              className="cursor-pointer rounded-lg p-2 transition hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              {icon}
            </button>
          </Form>
        ))}
      </div>
    </div>
  );
}
