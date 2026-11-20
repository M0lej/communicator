interface TypingIndicatorProps {
  label: string;
  className?: string;
  color?: "blue" | "monochrome";
}

export default function TypingIndicator({
  label,
  className = "",
  color = "monochrome",
}: TypingIndicatorProps) {
  return (
    <span
      className={`typing-indicator typing-indicator-${color} inline-flex items-center gap-1 ${className}`}
      role="status"
      aria-label={label}
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </span>
  );
}
