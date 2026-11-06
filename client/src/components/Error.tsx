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
    <h2 className="w-full flex justify-center bg-red-400 text-white p-2 rounded-lg animate-pop-from-bottom">
      {message}
    </h2>
  );
}
