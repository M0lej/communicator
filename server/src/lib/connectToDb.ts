import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
export let avatarBucket: mongoose.mongo.GridFSBucket | null;

export default async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI as string);

    const conn = mongoose.connection;

    if (conn.db) {
      avatarBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "avatars",
      });
      console.log("Connected to database");
    }
  } catch (error) {
    console.error(error);
    throw Error;
  }
}
