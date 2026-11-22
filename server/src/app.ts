import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import router from "./router";
import cors from "cors";
import http from "http";
import expressWs from "express-ws";

const configuredClientOrigin = process.env.CLIENT_ORIGIN?.replace(/\/+$/, "");
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://molejcommunicator.netlify.app",
    configuredClientOrigin,
  ].filter((origin): origin is string => Boolean(origin)),
  credentials: true,
};

const app = express();

const server = http.createServer(app);
const ws = expressWs(app, server);

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router(ws));

export { server };
