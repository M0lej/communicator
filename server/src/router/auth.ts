import express from "express";
import { login, register, restoreSession } from "../controllers/auth";

export default function authRouter(router: express.Router) {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.post('/auth/restore', restoreSession),
  router.get("/testAPI", (req: express.Request, res: express.Response) =>
    res.send("Works").end(),
  );
}
