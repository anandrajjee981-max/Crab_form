// Why does this file exist? Express app wiring: middleware, routes, error handling. Server.js handles DB+listen.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./auth/routes.js";
import formRoutes from "./form/routes.js";
import aiRoutes from "./ai/routes.js";
import responseRoutes, { myResponsesRouter } from "./response/routes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = env.CLIENT_URL === "*" ? true : env.CLIENT_URL.split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Gemini-Api-Key", "X-Api-Key"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for AI endpoint
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { success: false, message: "Too many AI requests, try again later" } });

// Health
app.get("/health", (req, res) => res.json({ success: true, message: "🦀 Crab Form API is running", env: env.NODE_ENV }));
app.get("/api/health", (req, res) => res.json({ success: true, message: "🦀 Crab Form API is running" }));

app.use("/api/auth", authRoutes);
// Mount response public routes BEFORE formRoutes so POST /:id/responses and POST /public/:slug/responses are NOT blocked by form auth
// Shipped link fillers: NO AUTH REQUIRED
app.use("/api/forms", responseRoutes);
app.use("/api/forms", formRoutes);
// My submissions / getMyFormData - separate endpoint for respondent's own data
app.use("/api/responses", myResponsesRouter());
app.use("/api/ai", aiLimiter, aiRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));

app.use(errorMiddleware);

export default app;
