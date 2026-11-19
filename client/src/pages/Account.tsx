import { Check, EditAlt, Envelope, Key, User, X } from "@boxicons/react";
import { useUserContext } from "../providers/UserProvider";
import { useEffect, useState } from "react";
import { Form, Link, useActionData } from "react-router-dom";
import AccountSettingsField from "../components/AccountSettingsField";
import Input from "../components/Input";
import Error, { isError, isUser } from "../components/Error";

export default function Account() {
  const response = useActionData<unknown>();
  const { user, setUser } = useUserContext();
  const [isEditingUserName, toggleUserNameEditing] = useState(false);
  const [isEditingPassword, togglePasswordEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  useEffect(() => {
    toggleUserNameEditing(false);
    togglePasswordEditing(false);

    if (response) {
      if (isUser(response)) {
        setErrorMessage(null);
        setUser(response);
      } else if (isError(response)) {
        setErrorMessage(response.error);
      }
    }
  }, [response]);

  return (
    <div className="h-full w-full overflow-y-auto bg-linear-to-br from-blue-50 to-slate-100 p-4 sm:flex sm:items-center sm:justify-center sm:p-8">
      <div className="mx-auto h-fit w-full max-w-2xl rounded-2xl border border-blue-100 bg-white p-5 shadow-xl sm:p-8">
        <Form method="post" action="/account" encType="multipart/form-data">
          <div className="flex flex-col items-center justify-center gap-4">
            <input type="hidden" name="userId" value={user?._id ?? ""} />
            <input type="hidden" name="intent" value="other" />
            <label
              htmlFor="avatar"
              className="cursor-pointer rounded-full focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-blue-500"
              title="Change profile photo"
            >
              {user ? (
                <img
                  className="h-30 aspect-square rounded-full shadow-md"
                  src={`/api/avatar/${encodeURIComponent(user._id)}?v=${encodeURIComponent(user.avatarFileId ?? "default")}`}
                  alt={`${user.username}'s profile picture`}
                />
              ) : (
                <User size="lg" />
              )}
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="sr-only"
              onChange={(event) => {
                if (event.currentTarget.files?.length) {
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />

            <div className="flex items-center gap-2 px-2 pb-3 sm:px-10">
              <input
                type="text"
                readOnly={!isEditingUserName}
                placeholder={user?.username}
                name="username"
                className={`min-w-0 max-w-full bg-transparent text-center text-2xl font-bold text-blue-950 field-sizing-content focus-visible:outline-2 focus-visible:outline-blue-400 sm:text-3xl ${!isEditingUserName && "placeholder-blue-950"}`}
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
        <div className="h-px w-full rounded-full bg-blue-100"></div>

        <div className="my-8 flex w-full flex-col gap-5 sm:my-10 sm:gap-6">
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
                      className="my-4 w-full cursor-pointer rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      SUBMIT
                    </button>
                  </>
                )}
                {errorMessage && <Error message={errorMessage} />}
              </div>
            </Form>
          </AccountSettingsField>
        </div>
      </div>
    </div>
  );
}
