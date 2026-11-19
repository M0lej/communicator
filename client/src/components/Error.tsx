import type { IUser } from "../providers/UserProvider";

interface IProps {
  message: string;
}

export function isUser(value: unknown): value is IUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    typeof value._id === "string" &&
    "username" in value &&
    typeof value.username === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    (!("avatarFileId" in value) ||
      typeof value.avatarFileId === "string" ||
      value.avatarFileId === undefined) &&
    "sentFriendRequests" in value &&
    Array.isArray(value.sentFriendRequests) &&
    "pendingFriendRequests" in value &&
    Array.isArray(value.pendingFriendRequests) &&
    "friends" in value &&
    Array.isArray(value.friends)
  );
}

export interface IError {
  error: string;
}

export function isError(value: unknown): value is IError {
  return (
    typeof value === "object" &&
    value != null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export default function Error({ message }: IProps) {
  return (
    <h2 className="flex w-full justify-center rounded-xl bg-linear-to-r from-red-500 to-red-600 p-3 text-white shadow-md animate-pop-from-bottom">
      {message}
    </h2>
  );
}
