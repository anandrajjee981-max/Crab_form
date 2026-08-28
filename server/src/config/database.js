// Why does this file exist? Isolates MongoDB connection from business modules; server.js calls connectDB().
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  console.log(`🦀 MongoDB connected: ${mongoose.connection.host}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
