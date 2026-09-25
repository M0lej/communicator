import express from "express";
import { createChat, getChats } from "../controllers/chats";
import { isAuthenticated, isOwner } from "../middlewares/auth";

export function chatsRouter(router: express.Router) {
  router.get("/chats/:userId", isAuthenticated, isOwner, getChats);
  router.post("/chats/:userId/:otherId", isAuthenticated, isOwner, createChat);
}
