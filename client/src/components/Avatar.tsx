import { apiUrl } from "../api/client";
import type { IUser } from "../providers/UserProvider";

interface AvatarProps {
  user: Pick<IUser, "_id" | "username">;
  className?: string;
  alt?: string;
}

function getAvatarColor(userId: string) {
  let hash = 2166136261;

  for (let index = 0; index < userId.length; index += 1) {
    hash ^= userId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `hsl(${(hash >>> 0) % 360} 65% 45%)`;
}

export default function Avatar({
  user,
  className = "aspect-square h-10 w-10 rounded-full",
  alt = "",
}: AvatarProps) {
  const initial = user.username.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: getAvatarColor(user._id) }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center text-white"
        aria-hidden="true"
      >
        {initial}
      </span>
      <img
        className="relative h-full w-full object-cover"
        src={apiUrl(`/api/avatar/${encodeURIComponent(user._id)}`)}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
        alt={alt}
      />
    </div>
  );
}
