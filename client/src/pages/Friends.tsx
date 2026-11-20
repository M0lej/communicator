import {
  Discussion,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
} from "@boxicons/react";
import Input from "../components/Input";
import { Form, useActionData, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserContext, type IUser } from "../providers/UserProvider";
import {
  getFriends,
  getPendingFriendRequests,
  getSentFriendRequests,
  type UsersResponse,
} from "../api/users";
import { UserContainer } from "../components/UserContainer";
import { createChat, getChatByOtherId } from "../api/chats";

export default function Friends() {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const response: UsersResponse | undefined = useActionData();
  const [friends, setFriends] = useState<IUser[]>([]);
  const [sentFriendRequests, setSentFriendRequests] = useState<IUser[]>([]);
  const [pendingFriendRequests, setPendingFriendRequests] = useState<IUser[]>(
    [],
  );
  const [foundUsers, setFoundUsers] = useState<IUser[]>([]);

  useEffect(() => {
    getFriendsArray();
    getSentFriendRequestsUsersArray();
    getPendingFriendRequestsUsersArray();
  }, [user]);

  async function getFriendsArray() {
    const friendsArray: IUser[] =
      ((await getFriends()) as IUser[] | null) ?? [];

    setFriends(friendsArray);
  }

  async function getSentFriendRequestsUsersArray() {
    const users = ((await getSentFriendRequests()) as IUser[]) ?? [];

    setSentFriendRequests(users);
  }

  async function getPendingFriendRequestsUsersArray() {
    const users: IUser[] =
      ((await getPendingFriendRequests()) as IUser[] | null) ?? [];

    setPendingFriendRequests(users);
  }

  useEffect(() => {
    handleResponse();
  }, [response]);

  function handleResponse() {
    if (!response) return;

    switch (response["intent"]) {
      case "find":
        updateFoundUsersState();
        break;
      case "add":
        updateSentFriendRequestsState();
        break;
      case "remove":
        updateFriendsState();
        break;
      case "pending_accept":
        updatePendingFriendRequestsState(true);
        break;
      case "pending_deny":
        updatePendingFriendRequestsState(false);
        break;
      default:
        return;
    }
  }

  function updateFoundUsersState() {
    if (!response?.data) return;

    const filteredUsers = (response!.data as IUser[]).filter(
      (foundUser) =>
        foundUser._id != user?._id &&
        !friends.find((friend) => friend._id === foundUser._id) &&
        !sentFriendRequests.find(
          (requestUser) => requestUser._id === foundUser._id,
        ) &&
        !pendingFriendRequests.find(
          (requestUser) => requestUser._id === foundUser._id,
        ),
    );

    setFoundUsers(filteredUsers);
  }

  function updateFriendsState() {
    if (!response!.data) return;

    setFriends((friends) =>
      friends.filter((friend) => friend._id != (response?.data as IUser)._id),
    );
  }

  function updateSentFriendRequestsState() {
    if (!response!.data) return;

    setSentFriendRequests((sentFriendRequests) => [
      ...sentFriendRequests,
      response!.data as IUser,
    ]);
    setFoundUsers([]);
  }

  function updatePendingFriendRequestsState(requestAccepted: boolean) {
    if (!response!.data) return;

    setPendingFriendRequests((pendingFriendRequests) =>
      pendingFriendRequests.filter(
        (pendingUser) => pendingUser._id != (response!.data as IUser)._id,
      ),
    );

    if (requestAccepted) {
      setFriends((friends) => [...friends, response!.data as IUser]);
    }

    setFoundUsers([]);
  }

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
          <Search className="" />
        </button>
      </Form>
      <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4 sm:p-8">
        {foundUsers.length > 0 && (
          <h1 className="mt-2 text-lg font-bold text-blue-950">Found users</h1>
        )}
        {foundUsers.length > 0 &&
          foundUsers.map((foundUser) => (
            <UserContainer
              username={foundUser.username}
              formButtons={[
                {
                  icon: <UserPlus />,
                  params: [
                    {
                      name: "intent",
                      value: "add",
                    },
                    {
                      name: "userId",
                      value: user?._id ?? "",
                    },
                    {
                      name: "otherId",
                      value: foundUser._id,
                    },
                  ],
                },
              ]}
              key={`find_${foundUser._id}`}
            />
          ))}
        {pendingFriendRequests.length > 0 && (
          <h1 className="mt-4 text-lg font-bold text-blue-950">
            Pending friend requests
          </h1>
        )}
        {pendingFriendRequests.length > 0 &&
          pendingFriendRequests.map((friendRequestUser) => (
            <UserContainer
              username={friendRequestUser.username}
              formButtons={[
                {
                  icon: <UserCheck />,
                  params: [
                    {
                      name: "intent",
                      value: "pending_accept",
                    },
                    {
                      name: "userId",
                      value: user?._id ?? "",
                    },
                    {
                      name: "otherId",
                      value: friendRequestUser._id,
                    },
                  ],
                },
                {
                  icon: <UserX />,
                  params: [
                    {
                      name: "intent",
                      value: "pending_deny",
                    },
                    {
                      name: "userId",
                      value: user?._id ?? "",
                    },
                    {
                      name: "otherId",
                      value: friendRequestUser._id,
                    },
                  ],
                },
              ]}
              key={`pending_${friendRequestUser._id}`}
            />
          ))}
        {sentFriendRequests.length > 0 && (
          <h1 className="mt-4 text-lg font-bold text-blue-950">
            Sent friend requests
          </h1>
        )}
        {sentFriendRequests.length > 0 &&
          sentFriendRequests.map((friendRequestUser) => (
            <UserContainer
              username={friendRequestUser.username}
              key={`sent_${friendRequestUser._id}`}
            />
          ))}
        <h1 className="mt-4 text-lg font-bold text-blue-950">Your friends</h1>
        {friends.length > 0 &&
          friends.map((friendUser) => (
            <UserContainer
              username={friendUser.username}
              buttons={
                <button
                  className="cursor-pointer rounded-lg p-2 text-blue-700 transition hover:bg-blue-100 hover:text-blue-900"
                  onClick={() => openChat(friendUser._id)}
                  aria-label={`Start chat with ${friendUser.username}`}
                >
                  <Discussion />
                </button>
              }
              formButtons={[
                {
                  icon: <UserMinus />,
                  params: [
                    {
                      name: "intent",
                      value: "remove",
                    },
                    {
                      name: "userId",
                      value: user?._id ?? "",
                    },
                    {
                      name: "otherId",
                      value: friendUser._id,
                    },
                  ],
                },
              ]}
              key={`friend_${friendUser._id}`}
            />
          ))}
      </div>
    </div>
  );
}
