interface UserStatusIndicatorSkeletonProps {
  className?: string;
}

export default function UserStatusIndicatorSkeleton({
  className = "",
}: UserStatusIndicatorSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex w-fit max-w-full min-w-0 shrink-0 flex-col items-center gap-1.5 ${className}`}
    >
      <div className="skeleton-shimmer h-9 w-9 rounded-full ring-1 ring-slate-200" />
      <div className="skeleton-shimmer h-5 w-14 max-w-full rounded" />
    </div>
  );
}
