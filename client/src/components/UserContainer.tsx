import type { ReactNode } from "react";
import { Form } from "react-router-dom";
import type { Intent } from "../api/users";

type FormButtonIntentParam = {
  name: "intent";
  value: Intent;
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
    <div className="bg-blue-300 rounded-lg px-8 py-4 flex justify-between">
      {username}
      <div className="flex gap-4">
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
              <button type="submit" className="cursor-pointer">
                {formButton.icon}
              </button>
            </Form>
          );
        })}
      </div>
    </div>
  );
}
