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
      className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 animate-pop-from-bottom opacity-0 transition-all duration-300 ${isSender ? "ml-auto bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-800"} ${className}`}
      ref={ref}
    >
      {children}
    </div>
  );
}
