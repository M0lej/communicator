import express from "express";
import {
  isLoggedIn,
  login,
  register,
  restoreSession,
} from "../controllers/auth";

export default function authRouter(router: express.Router) {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.get("/auth/me", isLoggedIn);
  router.post("/auth/restore", restoreSession);
}
