import express from "express";
import {
  _getFriends,
  _getPendingFriendRequests,
  _getSentFriendRequests,
  _getUsersByIds,
  _getUsersByUsername,
  doesFriendExist,
  getUserById,
  getUsers,
  isFriendRequestPending,
  IUser,
  IUserWithAuth,
} from "../models/user";
import { get } from "lodash";
import { hashPassword, random } from "../lib/encryption";
import { activeUsers } from "./ws";
import { uploadAvatarFromBuffer } from "../lib/avatar";
import { randomUUID } from "node:crypto";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const users = (await getUsers()) ?? [];

    return res.status(200).json(users).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getUsersByIds = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const ids = req.body?.ids;

    if (!Array.isArray(ids)) {
      return res.sendStatus(400);
    }

    const users = (await _getUsersByIds(ids as string[])) ?? [];

    return res.status(200).json(users).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getUsersByUsername = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.sendStatus(400);
    }

    const users = (await _getUsersByUsername(username as string)) ?? [];

    return res.status(200).json(users).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.sendStatus(400);
    }

    const user: IUser = (await getUserById(userId as string)) as IUser;

    if (!user) {
      return res.sendStatus(400);
    }

    await user.deleteOne();

    return res.status(200).json(user).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;
    const avatar = req.file;

    if (!userId) {
      return res.sendStatus(400);
    }

    const user: IUser | null = await getUserById(userId as string);

    if (!user) {
      return res.sendStatus(400);
    }

    if (avatar) {
      const avatarFileId = await uploadAvatarFromBuffer(
        avatar.buffer,
        randomUUID(),
        {
          mimeType: avatar.mimetype,
          userId,
          uploadedAt: new Date(),
        },
      );

      user.avatarFileId = avatarFileId as string;
    }

    if (username) {
      user.username = username;
    }
    const updatedUser = await user.save();

    return res.status(200).json(updatedUser).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const updatePassword = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId } = req.params;
    const { oldPassword, password } = req.body;

    if (!userId || !password || !oldPassword) {
      return res.sendStatus(400);
    }

    const user: IUserWithAuth | null = await getUserById(
      userId as string,
    ).select("authentication");

    if (!user) {
      return res.sendStatus(400);
    }

    const newSalt = random();
    const hashedPassword = hashPassword(newSalt, password);
    const hashedPasswordWithOldSalt = hashPassword(
      user.authentication.salt,
      password,
    );

    if (hashedPasswordWithOldSalt == user.authentication.password) {
      return res
        .status(400)
        .json({ error: "Old password and new password are the same." })
        .end();
    }

    user.authentication.password = hashedPassword;
    user.authentication.salt = newSalt;
    await user.save();

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(403);
  }
};

export const getFriends = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId: string = get(req, "identity._id") as unknown as string;

    if (!userId) {
      return res.sendStatus(400);
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.sendStatus(403);
    }

    const friends: IUser[] = (await _getFriends(user)) ?? [];
    const activeFriends: IUser[] = friends.filter((friend: IUser) =>
      activeUsers.has(friend._id.toString()),
    );

    const extendedUsersObjects = await Promise.all(
      friends.map(async (friend: IUser) => {
        return {
          ...friend.toObject(),
          status: activeFriends.includes(friend),
        };
      }),
    );

    return res.status(200).json(extendedUsersObjects);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getActiveFriends = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId: string = get(req, "identity._id") as unknown as string;

    if (!userId) {
      return res.sendStatus(400);
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.sendStatus(403);
    }

    const users: IUser[] =
      (await _getFriends(user)).filter((friend) =>
        activeUsers.has(friend._id.toString()),
      ) ?? [];

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getSentFriendRequests = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId: string = get(req, "identity._id") as unknown as string;

    if (!userId) {
      return res.sendStatus(400);
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.sendStatus(403);
    }

    const users: IUser[] = (await _getSentFriendRequests(user)) ?? [];

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const getPendingFriendRequests = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId: string = get(req, "identity._id") as unknown as string;

    if (!userId) {
      return res.sendStatus(400);
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.sendStatus(403);
    }

    const users: IUser[] = (await _getPendingFriendRequests(user)) ?? [];

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const sendFriendRequest = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, otherId } = req.params;

    if (!userId || !otherId) {
      return res.sendStatus(400);
    }

    if (userId === otherId) {
      return res.sendStatus(403);
    }

    const currentUser = await getUserById(userId as string);
    const otherUser = await getUserById(otherId as string);

    if (!currentUser || !otherUser) {
      return res.sendStatus(403);
    }

    if (currentUser.sentFriendRequests.includes(otherUser._id)) {
      return res.sendStatus(403);
    }

    const isAlreadyAFriend = await doesFriendExist(
      currentUser,
      otherId as string,
    );

    if (isAlreadyAFriend) {
      return res.sendStatus(403);
    }

    if (otherUser.sentFriendRequests.includes(currentUser._id)) {
      currentUser.acceptFriendRequest(otherId as string);
      otherUser.receiveFriendRequestAccept(userId as string);
    } else {
      currentUser.sendFriendRequest(otherId as string);
      otherUser.receiveFriendRequest(userId as string);
    }

    return res.status(200).json(otherUser).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const removeFriend = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, otherId } = req.params;

    if (!userId || !otherId) {
      return res.sendStatus(400);
    }

    const currentUser = await getUserById(userId as string);
    const otherUser = await getUserById(otherId as string);

    if (!currentUser || !otherUser) {
      return res.sendStatus(403);
    }

    const friendListContainsOtherId = doesFriendExist(
      currentUser,
      otherId as string,
    );

    if (!friendListContainsOtherId) {
      return res.sendStatus(403);
    }

    currentUser.removeFriend(otherId as string);
    otherUser.removeFriend(userId as string);

    return res.status(200).json(otherUser).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const acceptFriendRequest = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, otherId } = req.params;

    if (!userId || !otherId) {
      return res.sendStatus(400);
    }

    const currentUser = await getUserById(userId as string);
    const otherUser = await getUserById(otherId as string);

    if (!currentUser || !otherUser) {
      return res.sendStatus(403);
    }

    const pendingRequestExists = isFriendRequestPending(
      currentUser,
      otherId as string,
    );

    if (!pendingRequestExists) {
      return res.sendStatus(403);
    }

    currentUser.acceptFriendRequest(otherId as string);
    otherUser.receiveFriendRequestAccept(userId as string);

    return res.status(200).json(otherUser).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

export const denyFriendRequest = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, otherId } = req.params;

    if (!userId || !otherId) {
      return res.sendStatus(400);
    }

    const currentUser = await getUserById(userId as string);
    const otherUser = await getUserById(otherId as string);

    if (!currentUser || !otherUser) {
      return res.sendStatus(403);
    }

    const pendingRequestExists = isFriendRequestPending(
      currentUser,
      otherId as string,
    );

    if (!pendingRequestExists) {
      return res.sendStatus(403);
    }

    currentUser.removePendingFriendRequest(otherId as string);
    otherUser.removeSentFriendRequest(userId as string);

    return res.status(200).json(otherUser).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};
