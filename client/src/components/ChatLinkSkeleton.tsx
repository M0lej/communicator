interface ChatLinkSkeletonProps {
  className?: string;
}

export default function ChatLinkSkeleton({
  className = "",
}: ChatLinkSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`py-4 px-8 rounded-xl h-fit flex items-center gap-4 border-b border-gray-100 ${className}`}
    >
      <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="skeleton-shimmer h-4 w-2/5 rounded" />
        <div className="skeleton-shimmer h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}
