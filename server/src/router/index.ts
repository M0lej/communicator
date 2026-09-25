import express from "express";
import authRouter from "./auth";
import usersRouter from "./users";
import { chatsRouter } from "./chats";
import { messagesRouter } from "./messages";

const router = express.Router();
authRouter(router);
usersRouter(router);
chatsRouter(router);
messagesRouter(router);

export default (): express.Router => {
  return router;
};
