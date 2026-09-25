import express from "express";
import { isAuthenticated, isOwner } from "../middlewares/auth";
import {
  createMessage,
  getLatestMessages,
  getOlderMessages,
} from "../controllers/messages";

export function messagesRouter(router: express.Router) {
  router.get(
    "/messages/:userId/:chatId",
    isAuthenticated,
    isOwner,
    getLatestMessages,
  );
  router.get(
    "/messages/:userId/:chatId/:startIndex",
    isAuthenticated,
    isOwner,
    getOlderMessages,
  );
  router.post(
    "/messages/:userId/:chatId/",
    isAuthenticated,
    isOwner,
    createMessage,
  );
}
