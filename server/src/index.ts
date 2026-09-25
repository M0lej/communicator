import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import router from "./router";
import connectToDatabase from "./lib/connectToDb";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const port = 8080;
const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use("/", router());
app.use(cors(corsOptions));

async function startServer() {
  await connectToDatabase();

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
