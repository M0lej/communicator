import { server } from "./app";
import connectToDatabase from "./lib/connectToDb";

const port = Number(process.env.PORT) || 8080;

async function startServer() {
  await connectToDatabase();

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
