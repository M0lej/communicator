interface IChatBubble {
  children?: string;
  className?: string;
  id?: string;
  isSender?: boolean;
  ref?: ((el: HTMLDivElement | null) => void) | null;
}

export default function ChatBubble({
  children,
  className,
  id,
  isSender = false,
  ref,
}: IChatBubble) {
  return (
    <div
      id={id}
      className={`px-6 py-4 rounded-2xl drop-shadow-md w-fit animate-pop-from-bottom opacity-0 transition-all ${isSender ? "ml-auto bg-blue-500 text-white" : "bg-gray-300"} ${className}`}
      ref={ref}
    >
      {children}
    </div>
  );
}
