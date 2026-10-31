import expressWs from "express-ws";
import {
  createChat,
  getChats,
  getChat,
  getChatByUserIds,
} from "../controllers/chats";
import { WSHandler } from "../controllers/ws";
import { isAuthenticated, isOwner } from "../middlewares/auth";

export function chatsRouter(router: expressWs.Router) {
  router.get("/chats/:userId", isAuthenticated, getChats);
  router.post(
    "/chat/create/:userId/:otherId",
    isAuthenticated,
    isOwner,
    createChat,
  );
  router.get("/chat/id/:userId/:chatId", isAuthenticated, getChat);
  router.get("/chat/me/:otherId", isAuthenticated, getChatByUserIds);
}
