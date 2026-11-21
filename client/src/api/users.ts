import { api } from "./client";
import type { IUser } from "../providers/UserProvider";
import { comparePassword } from "./auth";

interface IUsersArrayResponse {
  intent: "find";
  data: IUser[];
}

export type UsersIntent = "add" | "remove" | "pending_accept" | "pending_deny";
export type UpdateUserIntent = "other" | "delete" | "password";

interface IUsersSingleResponse {
  intent: UsersIntent;
  data: IUser;
}

export interface IUserWithStatus extends IUser {
  status: boolean;
}

export type UsersResponse = IUsersArrayResponse | IUsersSingleResponse;

export async function users({ request }: { request: Request }) {
  try {
    const data = Object.fromEntries((await request.formData()).entries());

    const { intent, userName, userId, otherId } = data;

    if (!intent) {
      return null;
    }

    switch (intent) {
      case "find":
        return {
          intent,
          data: await findUsers(userName as string),
        };
      case "add":
        return {
          intent,
          data: await sendFriendRequest(userId as string, otherId as string),
        };
      case "remove":
        return {
          intent,
          data: await removeFriend(userId as string, otherId as string),
        };
      case "pending_accept":
        return {
          intent,
          data: await acceptFriendRequest(userId as string, otherId as string),
        };
      case "pending_deny":
        return {
          intent,
          data: await denyFriendRequest(userId as string, otherId as string),
        };
      default:
        return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function findUsers(userName: string) {
  try {
    if (!userName) {
      return;
    }

    const response = await api({
      method: "GET",
      url: `/api/users/find/${encodeURIComponent(String(userName))}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function sendFriendRequest(userId: string, otherId: string) {
  try {
    if (!userId || !otherId) {
      return;
    }

    const response = await api({
      method: "POST",
      url: `/api/users/${userId}/friends/add/${otherId}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function acceptFriendRequest(userId: string, otherId: string) {
  try {
    if (!userId || !otherId) {
      return;
    }

    const response = await api({
      method: "POST",
      url: `/api/users/${userId}/friends/accept/${otherId}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function denyFriendRequest(userId: string, otherId: string) {
  try {
    if (!userId || !otherId) {
      return;
    }

    const response = await api({
      method: "POST",
      url: `/api/users/${userId}/friends/deny/${otherId}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function removeFriend(userId: string, otherId: string) {
  try {
    if (!userId || !otherId) {
      return;
    }

    const response = await api({
      method: "DELETE",
      url: `/api/users/${userId}/friends/remove/${otherId}`,
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getFriends() {
  try {
    const response = await api({
      method: "GET",
      url: "/api/users/me/friends",
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSentFriendRequests() {
  try {
    const response = await api({
      method: "GET",
      url: "/api/users/me/friends/requests/sent",
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getPendingFriendRequests() {
  try {
    const response = await api({
      method: "GET",
      url: "/api/users/me/friends/requests/pending",
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateUser({ request }: { request: Request }) {
  try {
    const data = Object.fromEntries((await request.formData()).entries());

    const {
      intent,
      userId,
      username,
      oldPassword,
      newPassword,
      confirmPassword,
      avatar,
    } = data;

    if (!intent) {
      return null;
    }

    switch (intent as UpdateUserIntent) {
      case "password":
        return await updatePassword(
          userId as string,
          oldPassword as string,
          newPassword as string,
          confirmPassword as string,
        );
      case "delete":
        try {
          await deleteUser(userId as string);
          return {
            intent: "delete",
            success: true,
            message: "Your account has been deleted successfully.",
          };
        } catch (error) {
          console.error(error);
          return {
            intent: "delete",
            success: false,
            message: "Unable to delete your account. Please try again.",
          };
        }
      case "other":
        return await updateOther(
          userId as string,
          username as string,
          avatar instanceof File && avatar.size > 0 ? avatar : undefined,
        );
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getUsersByIds(ids: string[]) {
  try {
    if (!ids) return null;

    const response = await api({
      method: "POST",
      url: `/api/users/ids`,
      data: {
        ids: ids,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function deleteUser(userId: string) {
  const response = await axios.delete(`/api/users/${userId}/delete`);

  return response.data;
}

async function updateOther(userId: string, username?: string, avatar?: File) {
  const formData = new FormData();

  if (username) formData.append("username", username);
  if (avatar) formData.append("avatar", avatar);

  const response = await api.patch(
    `/api/users/${encodeURIComponent(userId)}`,
    formData,
  );

  return response.data;
}

async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  if (!userId || !oldPassword || !newPassword || !confirmPassword) return null;

  if (newPassword != confirmPassword) {
    return { message: "Passwords doesn't match." };
  }

  const isOldPasswordCorrect = await comparePassword(
    userId as string,
    oldPassword as string,
  );

  if (!isOldPasswordCorrect) {
    return { message: "Incorrect old password." };
  }

  const response = await api({
    method: "PATCH",
    url: `/api/users/${encodeURIComponent(userId as string)}/password`,
    data: {
      oldPassword,
      password: newPassword,
    },
  });

  return response.data;
}
