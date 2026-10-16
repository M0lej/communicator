import express from "express";
import {
  _getFriends,
  _getPendingFriendRequests,
  _getSentFriendRequests,
  _getUsersByUsername,
  doesFriendExist,
  getUserById,
  getUsers,
  isFriendRequestPending,
  IUser,
} from "../models/user";
import { get } from "lodash";
import mongoose from "mongoose";

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

    if (!userId || !username) {
      return res.sendStatus(400);
    }

    const user: IUser = (await getUserById(userId as string)) as IUser;

    if (!user) {
      return res.sendStatus(400);
    }

    await user.updateOne({ username });

    return res.status(200).json(user).end();
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
    const currentUser: IUser = get(req, "identity") as unknown as IUser;

    if (!currentUser) {
      return res.sendStatus(400);
    }

    const users: IUser[] = (await _getFriends(currentUser)) ?? [];

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
    const currentUser: IUser = get(req, "identity") as unknown as IUser;

    if (!currentUser) {
      return res.sendStatus(400);
    }

    const users: IUser[] = (await _getSentFriendRequests(currentUser)) ?? [];

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
    const currentUser: IUser = get(req, "identity") as unknown as IUser;

    if (!currentUser) {
      return res.sendStatus(400);
    }

    const users: IUser[] = (await _getPendingFriendRequests(currentUser)) ?? [];

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
