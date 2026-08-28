// Why does this file exist? Entry point: loads env, connects DB, starts HTTP server.
import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";
import { env } from "./src/config/env.js";

async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`🦀 Crab Form server running on http://0.0.0.0:${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
