import type { ReactNode } from "react";
import { Form } from "react-router-dom";
import type { UsersIntent } from "../api/users";

type FormButtonIntentParam = {
  name: "intent";
  value: UsersIntent;
};

type FormButtonParam = {
  name: string;
  value: string;
};

type FormButton = {
  icon: ReactNode;
  action?: string;
  params: [FormButtonIntentParam, ...FormButtonParam[]];
};

interface IUserContainer {
  username: string;
  buttons?: ReactNode;
  formButtons?: FormButton[];
  action?: string;
}

export function UserContainer({
  action,
  username,
  buttons,
  formButtons,
}: IUserContainer) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-blue-100 px-4 py-3 text-blue-950 shadow-sm transition hover:shadow-md sm:px-6">
      <span className="min-w-0 truncate font-medium">{username}</span>
      <div className="flex shrink-0 items-center gap-2 text-blue-700 sm:gap-4">
        {buttons}
        {formButtons?.map((formButton, i) => {
          const intent = formButton.params.find(
            (param) => param.name === "intent",
          )!.value;

          return (
            <Form
              method="post"
              action={action ?? "/friends"}
              key={`form_${intent}_${i}`}
            >
              {formButton.params.map((param) => (
                <input
                  type="hidden"
                  hidden
                  name={param.name}
                  value={param.value}
                  key={`input_${intent}_${param.name}`}
                />
              ))}
              <button
                type="submit"
                className="cursor-pointer rounded-lg p-2 transition hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {formButton.icon}
              </button>
            </Form>
          );
        })}
      </div>
    </div>
  );
}
