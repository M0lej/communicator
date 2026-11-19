import express from "express";
import {
  comparePassword,
  isLoggedIn,
  login,
  register,
  restoreSession,
} from "../controllers/auth";
import { isAuthenticated, isOwner } from "../middlewares/auth";
import { avatarUpload, parseAvatarUpload } from "../middlewares/upload";

export default function authRouter(router: express.Router) {
  router.post("/auth/register", parseAvatarUpload, avatarUpload, register);
  router.post("/auth/login", login);
  router.get("/auth/me", isLoggedIn);
  router.post("/auth/restore", restoreSession);
  router.post(
    "/auth/:userId/compare",
    isAuthenticated,
    isOwner,
    comparePassword,
  );
}
