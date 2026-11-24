import { Search } from "@boxicons/react";
import { Suspense, useEffect, useState } from "react";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import Input from "../components/Input";
import {
  UserContainer,
  type UserContainerVariant,
} from "../components/UserContainer";
import UserContainerSkeleton from "../components/UserContainerSkeleton";
import { createChat, getChatByOtherId } from "../api/chats";
import type { UsersResponse } from "../api/users";
import { useUserContext, type IUser } from "../providers/UserProvider";
import type { friendsLoader } from "../loaders/friendsLoader";

function UserContainerSkeletonList({
  variant,
}: {
  variant: UserContainerVariant;
}) {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <UserContainerSkeleton key={index} variant={variant} />
      ))}
    </>
  );
}

function UserListError() {
  return (
    <p className="py-2 text-sm text-red-700">
      Unable to load this list. Please try again.
    </p>
  );
}

function asUserList(value: unknown): IUser[] {
  return Array.isArray(value) ? value : [];
}

export default function Friends() {
  const { user } = useUserContext();
  const { friends, sentRequests, pendingRequests } =
    useLoaderData<typeof friendsLoader>();
  const response = useActionData() as UsersResponse | undefined;
  const navigate = useNavigate();
  const [foundUsers, setFoundUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (response?.intent !== "find" || !Array.isArray(response.data)) return;

    let isCurrent = true;

    void Promise.all([friends, sentRequests, pendingRequests]).then(
      ([loadedFriends, loadedSentRequests, loadedPendingRequests]) => {
        if (!isCurrent) return;

        const existingUserIds = new Set(
          [
            ...asUserList(loadedFriends),
            ...asUserList(loadedSentRequests),
            ...asUserList(loadedPendingRequests),
          ].map((existingUser) => existingUser._id),
        );

        setFoundUsers(
          response.data.filter(
            (foundUser) =>
              foundUser._id !== user?._id &&
              !existingUserIds.has(foundUser._id),
          ),
        );
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [friends, pendingRequests, response, sentRequests, user?._id]);

  async function openChat(friendUserId: string) {
    if (!user) return;

    const existingChat = await getChatByOtherId(friendUserId);
    const chat = existingChat ?? (await createChat(user._id, friendUserId));

    if (chat) {
      navigate("/", { state: { selectedChat: chat } });
    }
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50">
      <Form
        className="sticky top-0 z-10 flex h-16 w-full items-center justify-center gap-2 border-b border-slate-200 bg-white px-4"
        method="POST"
        action="/friends"
      >
        <input type="hidden" hidden name="intent" value="find" />
        <input type="hidden" hidden name="userId" value={user?._id ?? ""} />
        <Input
          className="w-[60%] max-w-lg bg-white"
          placeholder="Search..."
          name="userName"
          id="userName"
          required
        />
        <button
          className="flex h-10 aspect-square items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          type="submit"
        >
          <Search />
        </button>
      </Form>
      <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4 sm:p-8">
        {response?.intent === "find" &&
          Array.isArray(response.data) &&
          foundUsers.length > 0 && (
          <>
            <h1 className="mt-2 text-lg font-bold text-blue-950">
              Found users
            </h1>
            {foundUsers.map((foundUser) => (
              <UserContainer
                user={foundUser}
                variant="found"
                key={`find_${foundUser._id}`}
              />
            ))}
          </>
        )}

        <Suspense
          fallback={
            <>
              <h1 className="mt-4 text-lg font-bold text-blue-950">
                Pending friend requests
              </h1>
              <UserContainerSkeletonList variant="pending" />
            </>
          }
        >
          <Await resolve={pendingRequests} errorElement={<UserListError />}>
            {(loadedRequests: IUser[] | null) => {
              const requests = loadedRequests ?? [];
              if (requests.length === 0) return null;

              return (
                <>
                  <h1 className="mt-4 text-lg font-bold text-blue-950">
                    Pending friend requests
                  </h1>
                  {requests.map((friendRequestUser) => (
                    <UserContainer
                      user={friendRequestUser}
                      variant="pending"
                      key={`pending_${friendRequestUser._id}`}
                    />
                  ))}
                </>
              );
            }}
          </Await>
        </Suspense>

        <Suspense
          fallback={
            <>
              <h1 className="mt-4 text-lg font-bold text-blue-950">
                Sent friend requests
              </h1>
              <UserContainerSkeletonList variant="sent" />
            </>
          }
        >
          <Await resolve={sentRequests} errorElement={<UserListError />}>
            {(loadedRequests: IUser[] | null) => {
              const requests = loadedRequests ?? [];
              if (requests.length === 0) return null;

              return (
                <>
                  <h1 className="mt-4 text-lg font-bold text-blue-950">
                    Sent friend requests
                  </h1>
                  {requests.map((friendRequestUser) => (
                    <UserContainer
                      user={friendRequestUser}
                      variant="sent"
                      key={`sent_${friendRequestUser._id}`}
                    />
                  ))}
                </>
              );
            }}
          </Await>
        </Suspense>

        <h1 className="mt-4 text-lg font-bold text-blue-950">Your friends</h1>
        <Suspense fallback={<UserContainerSkeletonList variant="friend" />}>
          <Await resolve={friends} errorElement={<UserListError />}>
            {(loadedFriends: IUser[] | null) =>
              (loadedFriends ?? []).map((friendUser) => (
                <UserContainer
                  user={friendUser}
                  variant="friend"
                  onStartChat={openChat}
                  key={`friend_${friendUser._id}`}
                />
              ))
            }
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
