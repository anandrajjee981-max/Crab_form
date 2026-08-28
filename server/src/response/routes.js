// Why does this file exist? Routes for response submission + retrieval; submission can be public, retrieval is owner-only.
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import SubmitResponseActivity from "./activity/SubmitResponseActivity.js";
import GetResponsesActivity from "./activity/GetResponsesActivity.js";

const router = express.Router({ mergeParams: true });

// Public submission: formId comes from parent path /api/forms/:id/responses
// We mount this router at two places; handle both.

export function responsePublicRouter() {
  const r = express.Router();
  r.post("/:id/responses", async (req, res, next) => {
    try {
      // optional auth: check header but don't require
      let userId = null;
      const auth = req.headers.authorization;
      if (auth?.startsWith("Bearer ")) {
        try {
          const { verifyToken } = await import("../utils/jwt.js");
          const payload = verifyToken(auth.slice(7));
          userId = payload.userId;
        } catch {}
      }
      const result = await SubmitResponseActivity.execute({ formId: req.params.id, body: req.body, userId });
      res.status(201).json({ success: true, message: "Response submitted successfully", data: result });
    } catch (e) { next(e); }
  });
  return r;
}

export function responseOwnerRouter() {
  const r = express.Router();
  r.get("/:id/responses", authMiddleware, async (req, res, next) => {
    try {
      const responses = await GetResponsesActivity.execute({ userId: req.userId, formId: req.params.id });
      res.json({ success: true, data: responses });
    } catch (e) { next(e); }
  });
  return r;
}

// For mounting under /api/forms - create combined router
const combined = express.Router();
combined.post("/:id/responses", async (req, res, next) => {
  try {
    let userId = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      try {
        const { verifyToken } = await import("../utils/jwt.js");
        const payload = verifyToken(auth.slice(7));
        userId = payload.userId;
      } catch {}
    }
    const result = await SubmitResponseActivity.execute({ formId: req.params.id, body: req.body, userId });
    res.status(201).json({ success: true, message: "Response submitted successfully", data: result });
  } catch (e) { next(e); }
});
combined.get("/:id/responses", authMiddleware, async (req, res, next) => {
  try {
    const responses = await GetResponsesActivity.execute({ userId: req.userId, formId: req.params.id });
    res.json({ success: true, data: responses });
  } catch (e) { next(e); }
});

export default combined;
