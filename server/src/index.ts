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
<<<<<<< HEAD
const configuredClientOrigin = process.env.CLIENT_ORIGIN?.replace(/\/+$/, "");
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://molej-communicator.vercel.app",
    "https://communicator-molej.vercel.app",
    configuredClientOrigin,
=======
const corsOptions = {
  origin: [
    "http://localhost:5173",
    process.env.CLIENT_ORIGIN,
>>>>>>> 09b8daa (feat: implement logout functionality, enhance account deletion process, and refactor API calls to use centralized axios instance)
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
