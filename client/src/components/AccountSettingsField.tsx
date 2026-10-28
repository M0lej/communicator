import type { ReactNode } from "react";

interface Props {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  editButton?: ReactNode;
}

export default function AccountSettingsField({
  label,
  icon,
  children,
  editButton,
}: Props) {
  return (
    <div className="w-full space-y-4">
      <h1 className="font-bold flex gap-2 text-xl w-full">
        {icon}
        {label}
        <div className="ml-auto mr-0">{editButton}</div>
      </h1>
      <div className="flex gap-2 items-center w-full">
        <div className="flex flex-col w-full">{children}</div>
      </div>
    </div>
  );
}
