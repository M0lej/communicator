import expressWs from "express-ws";
import { isAuthenticated } from "../middlewares/auth";
import { getAvatar } from "../controllers/avatar";

export function avatarRouter(router: expressWs.Router) {
  router.get("/avatar/:userId", isAuthenticated, getAvatar);
}
