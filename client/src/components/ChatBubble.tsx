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
      className={`w-fit max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed animate-pop-from-bottom opacity-0 transition-all duration-300 ${isSender ? "ml-auto bg-[#7184ee] text-white" : "border border-slate-200 bg-white text-slate-800"} ${className}`}
      ref={ref}
    >
      {children}
    </div>
  );
}
