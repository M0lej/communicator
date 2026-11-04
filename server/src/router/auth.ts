import express from "express";
import {
  comparePassword,
  isLoggedIn,
  login,
  register,
  restoreSession,
} from "../controllers/auth";
import { isAuthenticated, isOwner } from "../middlewares/auth";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export default function authRouter(router: express.Router) {
  router.post("/auth/register", upload.single("avatar"), register);
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
