import {
  useId,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";

interface IPopupAction {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "danger" | "secondary";
  closeBeforeAction?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

interface IPopup {
  title: ReactNode;
  children?: ReactNode;
  actions?: IPopupAction[];
  onBackdropClick?: () => void;
}

const actionVariantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  secondary:
    "bg-slate-200 text-slate-800 hover:bg-slate-300 focus-visible:outline-slate-500",
};

export default function Popup({
  title,
  children,
  actions = [],
  onBackdropClick,
}: IPopup) {
  const titleId = useId();
  const [closingAction, setClosingAction] = useState<IPopupAction | null>(null);

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (
      closingAction &&
      event.animationName === "popup-close"
    ) {
      const action = closingAction;
      setClosingAction(null);
      action.onClick?.();
    }
  }

  function handleActionClick(action: IPopupAction) {
    if (action.closeBeforeAction && action.onClick) {
      setClosingAction(action);
      return;
    }

    action.onClick?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex h-dvh w-screen flex-col items-center justify-center bg-slate-950/40 px-6 py-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`popup${closingAction ? " popup-closing" : ""} rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-xl`}
        onAnimationEnd={handleAnimationEnd}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-slate-800" id={titleId}>
          {title}
        </h2>
        {children && <div className="mt-2 text-slate-700">{children}</div>}
        {actions.length > 0 && (
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {actions.map((action, index) => (
              <button
                autoFocus={action.autoFocus}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${actionVariantClasses[action.variant ?? "primary"]}`}
                disabled={action.disabled || closingAction !== null}
                key={index}
                onClick={() => handleActionClick(action)}
                type={action.type ?? "button"}
              >
                {action.icon && (
                  <span aria-hidden="true" className="flex">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
