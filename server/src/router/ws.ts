import expressWs from "express-ws";
import { WSHandler } from "../controllers/ws";

export default function wsRouter(router: expressWs.Router) {
  router.ws("/ws/:userId", WSHandler);
}
