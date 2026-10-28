import { Check, EditAlt, Envelope, Key, User, X } from "@boxicons/react";
import { useUserContext, type IUser } from "../providers/UserProvider";
import { useEffect, useState } from "react";
import { Form, Link, useActionData } from "react-router-dom";
import AccountSettingsField from "../components/AccountSettingsField";
import Input from "../components/Input";

function isUser(value: unknown): value is IUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    typeof value._id === "string" &&
    "username" in value &&
    typeof value.username === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "sentFriendRequests" in value &&
    Array.isArray(value.sentFriendRequests) &&
    "pendingFriendRequests" in value &&
    Array.isArray(value.pendingFriendRequests) &&
    "friends" in value &&
    Array.isArray(value.friends)
  );
}

interface IError {
  error: string;
}

function isError(value: unknown): value is IError {
  return (
    typeof value === "object" &&
    value != null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export default function Account() {
  const response = useActionData<unknown>();
  const { user, setUser } = useUserContext();
  const [isEditingUserName, toggleUserNameEditing] = useState(false);
  const [isEditingPassword, togglePasswordEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  useEffect(() => {
    toggleUserNameEditing(false);
    togglePasswordEditing(false);

    if (response != null) {
      if (isUser(response)) {
        setUser(response);
      } else if (isError(response)) {
        setErrorMessage(response.error);
      }
    }
  }, [response]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-100 h-fit rounded-2xl drop-shadow-2xl bg-gray-50 p-10">
        <Form method="post" action="/account">
          <div className="flex flex-col items-center justify-center gap-4">
            <input type="hidden" name="userId" value={user?._id ?? ""} />
            <input type="hidden" name="intent" value="username" />
            <User
              size="3xl"
              className="rounded-full p-6 outline-5 overflow-visible"
            />

            <div className="flex gap-2 items-center px-10 pb-3">
              <input
                type="text"
                readOnly={!isEditingUserName}
                placeholder={user?.username}
                name="username"
                className={`text-black text-3xl  field-sizing-content  ${!isEditingUserName && "placeholder-black"}`}
              />

              {isEditingUserName && (
                <>
                  <button type="submit">
                    <Check className="cursor-pointer" />
                  </button>
                  <X
                    className="cursor-pointer"
                    onClick={() => toggleUserNameEditing(false)}
                  />
                </>
              )}
              {user != null && !isEditingUserName && (
                <EditAlt
                  className="cursor-pointer"
                  onClick={() => toggleUserNameEditing(true)}
                />
              )}
              {user == null && <Link to="/login">Login / Register</Link>}
            </div>
          </div>
        </Form>
        <div className="w-full h-0.5 bg-gray-300 rounded-full"></div>

        <div className="my-15 w-full flex flex-col gap-10">
          <AccountSettingsField label="Email" icon={<Envelope />}>
            {user?.email || ""}
          </AccountSettingsField>
          <AccountSettingsField
            label="Password"
            icon={<Key />}
            editButton={
              isEditingPassword ? (
                <X
                  className="cursor-pointer"
                  onClick={() => togglePasswordEditing(false)}
                />
              ) : (
                <EditAlt
                  className="cursor-pointer"
                  onClick={() => togglePasswordEditing(true)}
                />
              )
            }
          >
            <Form method="post" action="/account">
              <input type="hidden" name="userId" value={user?._id ?? ""} />
              <input type="hidden" name="intent" value="password" />
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center w-full">
                  <Input
                    type="password"
                    name="oldPassword"
                    placeholder={isEditingPassword ? "Old password" : "*******"}
                    readOnly={!isEditingPassword}
                    className={`text-black  field-sizing-content  ${!isEditingPassword && "placeholder-black"} ${!isEditingPassword && "border-0 py-0 px-0"} w-full`}
                  />
                </div>
                {isEditingPassword && (
                  <>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="New password"
                      readOnly={!isEditingPassword}
                      className={`text-black  field-sizing-content  ${!isEditingPassword && "placeholder-black"} ${!isEditingPassword && "border-0 py-0 px-0"} w-full`}
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      readOnly={!isEditingPassword}
                      className={`text-black  field-sizing-content  ${!isEditingPassword && "placeholder-black"} ${!isEditingPassword && "border-0 py-0 px-0"} w-full`}
                    />

                    <button
                      type="submit"
                      className="my-4 cursor-pointer w-full px-8 py-4 bg-blue-400 rounded-lg text-white font-bold"
                    >
                      SUBMIT
                    </button>
                  </>
                )}
                {errorMessage && (
                  <h2 className="w-full flex justify-center bg-red-400 text-white p-2 rounded-lg ">
                    {errorMessage}
                  </h2>
                )}
              </div>
            </Form>
          </AccountSettingsField>
        </div>
      </div>
    </div>
  );
}
