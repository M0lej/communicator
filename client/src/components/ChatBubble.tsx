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
      className={`px-6 py-4 rounded-2xl drop-shadow-md w-fit animate-pop-from-bottom opacity-0 transition-all duration-300 ${isSender ? "ml-auto bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-lg" : "bg-gray-100 outline-1 outline-blue-300 text-gray-800"} ${className}`}
      ref={ref}
    >
      {children}
    </div>
  );
}
