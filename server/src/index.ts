import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import expressWs from "express-ws";
import http from "http";
import router from "./router";
import connectToDatabase from "./lib/connectToDb";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const ws = expressWs(app, server);
const port = Number(process.env.PORT) || 8080;
const configuredClientOrigin = process.env.CLIENT_ORIGIN?.replace(/\/+$/, "");
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://molejcommunicator.netlify.app",
    configuredClientOrigin,
  ].filter((origin): origin is string => Boolean(origin)),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router(ws));

async function startServer() {
  await connectToDatabase();

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
