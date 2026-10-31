import expressWs from "express-ws";
import { isAuthenticated, isOwner, isParticipant } from "../middlewares/auth";
import {
  getLatestMessage,
  getLatestMessages,
  getOlderMessages,
} from "../controllers/messages";

export function messagesRouter(router: expressWs.Router) {
  router.get(
    "/messages/one/:chatId/",
    isAuthenticated,
    isParticipant,
    getLatestMessage,
  );
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
