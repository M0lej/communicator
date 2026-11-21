import { Search } from "@boxicons/react";
import Input from "../components/Input";
import { Form, useActionData } from "react-router-dom";
import type { IUser } from "../providers/UserProvider";

export default function FriendsFind() {
  const response = useActionData<IUser[] | null>();

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50">
      <Form
        className="flex h-16 w-full items-center justify-center gap-2 border-b border-slate-200 bg-white px-4"
        action="/friends/find"
        method="post"
      >
        <Input
          className="w-[60%] max-w-lg bg-white"
          placeholder="Search..."
          name="userName"
          id="userName"
          required
        />
        <button
          className="flex h-10 aspect-square items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
          type="submit"
        >
          <Search className="" />
        </button>
      </Form>
      {response === null ? (
        <p className="p-6 text-center text-red-600">Nie udało się wyszukać użytkowników.</p>
      ) : response ? (
        response.length > 0 ? (
          <ul className="mx-auto flex max-w-3xl flex-col gap-3 p-4 sm:p-8">
            {response.map((foundUser) => (
              <li key={foundUser._id} className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                <p className="font-semibold text-blue-950">{foundUser.username}</p>
                <p className="text-sm text-slate-500">{foundUser.email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-center text-slate-500">Nie znaleziono użytkowników.</p>
        )
      ) : null}
    </div>
  );
}
