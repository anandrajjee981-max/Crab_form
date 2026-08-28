// Why does this file exist? Routes connect HTTP to GenerateFormActivity; supports text/voice-transcribed text same way.
import express from "express";
import GenerateFormActivity from "./activity/GenerateFormActivity.js";
import { validateAIRequest } from "../middleware/validationMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Optional auth: allow authenticated users but don't require for generation; protect with optional key logic later
router.post("/generate-form", validateAIRequest, async (req, res, next) => {
  try {
    // User-provided API key via header: X-Gemini-Api-Key (never logged, not persisted)
    const headerKey = req.headers["x-gemini-api-key"] || req.headers["x-api-key"];
    const bodyKey = req.body.apiKey || req.body.geminiApiKey;
    const apiKey = headerKey || bodyKey || null;

    const result = await GenerateFormActivity.execute({
      prompt: req.body.prompt,
      text: req.body.text,
      apiKey,
    });
    res.json({ success: true, message: "Form generated successfully", data: result });
  } catch (e) { next(e); }
});

// Also support authenticated endpoint
router.post("/generate-form/auth", authMiddleware, validateAIRequest, async (req, res, next) => {
  try {
    const headerKey = req.headers["x-gemini-api-key"];
    const result = await GenerateFormActivity.execute({
      prompt: req.body.prompt,
      text: req.body.text,
      apiKey: headerKey || req.body.apiKey || null,
    });
    res.json({ success: true, message: "Form generated successfully", data: result });
  } catch (e) { next(e); }
});

export default router;
