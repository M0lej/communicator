import axios from "axios";
import type { IUser } from "../providers/UserProvider";

interface IUsersArrayResponse {
  intent: "find";
  data: IUser[];
}

export type Intent = "add" | "remove" | "pending_accept" | "pending_deny";

interface IUsersSingleResponse {
  intent: Intent;
  data: IUser;
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

    const response = await axios({
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

    const response = await axios({
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

    const response = await axios({
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

    const response = await axios({
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

    const response = await axios({
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
    const response = await axios({
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
    const response = await axios({
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
    const response = await axios({
      method: "GET",
      url: "/api/users/me/friends/requests/pending",
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
