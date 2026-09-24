import express from "express";
import authRouter from "./auth";
import usersRouter from "./users";

const router = express.Router();
authRouter(router);
usersRouter(router);

export default (): express.Router => {
  return router;
};
