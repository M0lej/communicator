import type { UserContainerVariant } from "./UserContainer";

interface UserContainerSkeletonProps {
  variant: UserContainerVariant;
}

const buttonCountByVariant: Record<UserContainerVariant, number> = {
  found: 1,
  pending: 2,
  sent: 0,
  friend: 2,
};

export default function UserContainerSkeleton({
  variant,
}: UserContainerSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:px-6"
    >
      <div className="flex items-center gap-4">
        <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-full" />
        <div className="skeleton-shimmer h-4 w-32 rounded" />
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {Array.from({ length: buttonCountByVariant[variant] }, (_, index) => (
          <div
            className="skeleton-shimmer h-10 w-10 rounded-lg"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
