// Why does this file exist? Centralizes env loading & validation; single source of truth for config.
import dotenv from "dotenv";
dotenv.config();

function requireEnv(name, fallback = undefined) {
  const val = process.env[name] ?? fallback;
  if (val === undefined || val === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return val;
}

export const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/crabform",
  JWT_SECRET: requireEnv("JWT_SECRET", "dev-secret-change-me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
