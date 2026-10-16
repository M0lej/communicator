import express from "express";
import expressWs from "express-ws";
import authRouter from "./auth";
import usersRouter from "./users";
import { chatsRouter } from "./chats";
import { messagesRouter } from "./messages";

export default (ws: expressWs.Instance): express.Router => {
  const router = express.Router();
  ws.applyTo(router);
  authRouter(router);
  usersRouter(router);
  chatsRouter(router);
  messagesRouter(router);
  return router;
};
