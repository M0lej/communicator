import express from "express";
import {
  sendFriendRequest,
  deleteUser,
  getAllUsers,
  updateUser,
  removeFriend,
  acceptFriendRequest,
  denyFriendRequest,
  getUsersByUsername,
  getFriends,
  getSentFriendRequests,
  getPendingFriendRequests,
  getUsersByIds,
  updatePassword,
  getActiveFriends,
} from "../controllers/users";
import { isAuthenticated, isOwner } from "../middlewares/auth";
import { avatarUpload, parseAvatarUpload } from "../middlewares/upload";

export default function usersRouter(router: express.Router) {
  router.get("/users", isAuthenticated, getAllUsers);
  router.post("/users/ids", isAuthenticated, getUsersByIds);
  router.get("/users/find/:username", isAuthenticated, getUsersByUsername);
  router.delete("/users/:userId", isAuthenticated, isOwner, deleteUser);
  router.patch(
    "/users/:userId",
    isAuthenticated,
    isOwner,
    parseAvatarUpload,
    avatarUpload,
    updateUser,
  );
  router.delete("/users/:userId/delete", isAuthenticated, isOwner, deleteUser);
  router.patch(
    "/users/:userId/password/",
    isAuthenticated,
    isOwner,
    updatePassword,
  );
  router.get("/users/me/friends", isAuthenticated, getFriends);
  router.get("/users/me/friends/active", isAuthenticated, getActiveFriends);
  router.get(
    "/users/me/friends/requests/sent",
    isAuthenticated,
    getSentFriendRequests,
  );
  router.get(
    "/users/me/friends/requests/pending",
    isAuthenticated,
    getPendingFriendRequests,
  );
  router.post(
    "/users/:userId/friends/add/:otherId",
    isAuthenticated,
    isOwner,
    sendFriendRequest,
  );
  router.post(
    "/users/:userId/friends/accept/:otherId",
    isAuthenticated,
    isOwner,
    acceptFriendRequest,
  );
  router.post(
    "/users/:userId/friends/deny/:otherId",
    isAuthenticated,
    isOwner,
    denyFriendRequest,
  );
  router.delete(
    "/users/:userId/friends/remove/:otherId",
    isAuthenticated,
    isOwner,
    removeFriend,
  );
}
