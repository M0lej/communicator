import { Search } from "@boxicons/react";
import Input from "../components/Input";
import { Form, useActionData } from "react-router-dom";
import type { IUser } from "../providers/UserProvider";
import { useEffect } from "react";

export default function FriendsFind() {
  const response = useActionData<IUser[] | null>();

  useEffect(() => {
    console.log(response);
  }, [response]);
  return (
    <div className="h-full w-full bg-blue-500">
      <Form
        className="search w-full h-15 bg-red-400 flex justify-center items-center gap-2"
        action="/friends/find"
        method="post"
      >
        <Input
          className="max-w-100 w-[60%]"
          placeholder="Search..."
          name="userName"
          id="userName"
          required
        />
        <button
          className="flex items-center justify-center h-10 aspect-square bg-white rounded-lg cursor-pointer"
          type="submit"
        >
          <Search className="" />
        </button>
      </Form>
      {response === null ? (
        <p className="p-4">Nie udało się wyszukać użytkowników.</p>
      ) : response ? (
        response.length > 0 ? (
          <ul className="flex flex-col gap-2 p-4">
            {response.map((foundUser) => (
              <li key={foundUser._id} className="rounded-lg bg-white p-3">
                <p>{foundUser.username}</p>
                <p>{foundUser.email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4">Nie znaleziono użytkowników.</p>
        )
      ) : null}
    </div>
  );
}
