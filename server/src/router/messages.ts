import expressWs from "express-ws";
import WebSocket from "ws";
import { isAuthenticated, isOwner } from "../middlewares/auth";
import {
  createMessage,
  getLatestMessages,
  getOlderMessages,
  messagesWsHandler,
} from "../controllers/messages";

export function messagesRouter(router: expressWs.Router) {
  router.use("/messages/:userId/:chatId", isAuthenticated, isOwner);
  router.ws("/messages/:userId/:chatId", messagesWsHandler);
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
}
