import express from "express";
import {
  sendFriendRequest,
  deleteUser,
  getAllUsers,
  updateUser,
  removeFriend,
  acceptFriendRequest,
  removeFriendRequest,
} from "../controllers/users";
import { isAuthenticated, isOwner } from "../middlewares/auth";

export default function usersRouter(router: express.Router) {
  router.get("/users", isAuthenticated, getAllUsers);
  router.delete("/users/:userId", isAuthenticated, isOwner, deleteUser);
  router.patch("/users/:userId", isAuthenticated, isOwner, updateUser);
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
    "/users/:userId/friends/remove/:otherId",
    isAuthenticated,
    isOwner,
    removeFriendRequest,
  );
  router.delete(
    "/users/:userId/friends/:otherId",
    isAuthenticated,
    isOwner,
    removeFriend,
  );
}
