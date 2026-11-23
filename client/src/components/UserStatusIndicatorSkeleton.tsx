interface UserStatusIndicatorSkeletonProps {
  className?: string;
}

export default function UserStatusIndicatorSkeleton({
  className = "",
}: UserStatusIndicatorSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex w-fit min-w-20 flex-col items-center gap-2 ${className}`}
    >
      <div className="skeleton-shimmer h-10 aspect-square rounded-full ring-1 ring-slate-200" />
      <div className="skeleton-shimmer h-4 w-16 rounded" />
    </div>
  );
}
