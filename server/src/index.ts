import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import router from "./router";
import connectToDatabase from "./lib/connectToDb";

const app = express();
const server = http.createServer(app);
const port = 8080;

app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use("/", router());

async function startServer() {
  await connectToDatabase();

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
