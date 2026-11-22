import { onStart } from "@netlify/server";
import { server } from "../../server/dist/app.js";
import databaseModule from "../../server/dist/lib/connectToDb.js";

onStart(async () => {
  await databaseModule.default();
});

export default server;

export const config = {
  path: "/api/*",
  includedFiles: ["../../server/public/default.png"],
};
