import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export default async function connectToDatabase() {
  try {
    const db = (await mongoose.connect(MONGODB_URI as string)).connection;

    console.log("Connected to database");

    return db;
  } catch (error) {
    console.error(error);
    throw Error;
  }
}
