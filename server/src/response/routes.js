// Why does this file exist? Routes for response submission + retrieval; submission can be public, retrieval is owner-only.
// Also handles get user data + getMyFormData (my submissions) for respondent side.
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import SubmitResponseActivity from "./activity/SubmitResponseActivity.js";
import GetResponsesActivity from "./activity/GetResponsesActivity.js";
import GetMyResponsesActivity from "./activity/GetMyResponsesActivity.js";
import GetUserDataActivity from "./activity/GetUserDataActivity.js";
import GetOwnerResponsesActivity from "./activity/GetOwnerResponsesActivity.js";

const router = express.Router({ mergeParams: true });

// Public submission: formId comes from parent path /api/forms/:id/responses
// We mount this router at two places; handle both.

export function responsePublicRouter() {
  const r = express.Router();
  // NO AUTH REQUIRED: anyone with shipped/shared link can submit as anonymous (or logged-in if token present)
  // Shipped link now contains ?owner=ownerId so anonymous fills still link to owner
  r.post("/:id/responses", async (req, res, next) => {
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
      const body = { ...req.body, ownerId: req.body.ownerId || req.query.owner || req.query.ownerId || null };
      const result = await SubmitResponseActivity.execute({ formId: req.params.id, body, userId });
      res.status(201).json({ success: true, message: "Response submitted successfully", data: result });
    } catch (e) { next(e); }
  });
  // Alias: submit via slug directly (shared link) - also NO AUTH REQUIRED
  r.post("/public/:slug/responses", async (req, res, next) => {
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
      const { default: FormDAO } = await import("../form/dao/FormDAO.js");
      const form = await FormDAO.findBySlug(req.params.slug);
      if (!form) { const e = new Error("Form not found"); e.statusCode = 404; throw e; }
      const body = { ...req.body, ownerId: req.body.ownerId || req.query.owner || req.query.ownerId || null };
      const result = await SubmitResponseActivity.execute({ formId: form._id.toString(), body, userId });
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
// PUBLIC - NO AUTH REQUIRED for submission via shipped link (anonymous allowed) — ownerId via ?owner=
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
    const body = { ...req.body, ownerId: req.body.ownerId || req.query.owner || req.query.ownerId || null };
    const result = await SubmitResponseActivity.execute({ formId: req.params.id, body, userId });
    res.status(201).json({ success: true, message: "Response submitted successfully", data: result });
  } catch (e) { next(e); }
});
// Also support slug-based public submit under /api/forms - NO AUTH
combined.post("/public/:slug/responses", async (req, res, next) => {
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
    const { default: FormDAO } = await import("../form/dao/FormDAO.js");
    const form = await FormDAO.findBySlug(req.params.slug);
    if (!form) { const e = new Error("Form not found"); e.statusCode = 404; throw e; }
    const body = { ...req.body, ownerId: req.body.ownerId || req.query.owner || req.query.ownerId || null };
    const result = await SubmitResponseActivity.execute({ formId: form._id.toString(), body, userId });
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

// --- My Responses / getMyFormData router (mount at /api/responses) ---
export function myResponsesRouter() {
  const r = express.Router();

  // GET /api/responses/owner  -> ALL responses for forms OWNED by logged-in user (shows 2 docs: anon + auth)
  // Distinct from /my which is respondent view (only 1 doc where respondentId==userId)
  const handleOwner = async (req, res, next) => {
    try {
      const data = await GetOwnerResponsesActivity.execute({ userId: req.userId });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };
  r.get("/owner", authMiddleware, handleOwner);
  r.get("/owner-data", authMiddleware, handleOwner);
  r.get("/owner/all", authMiddleware, handleOwner);
  r.get("/by-owner", authMiddleware, handleOwner);
  r.get("/my-owner-data", authMiddleware, handleOwner);

  // GET /api/responses/my  -> all submissions by logged-in user as RESPONDENT (getMyFormData)
  // aliases: /my-form-data, /my-responses
  const handleMy = async (req, res, next) => {
    try {
      const data = await GetMyResponsesActivity.execute({ userId: req.userId });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };
  r.get("/my", authMiddleware, handleMy);
  r.get("/my-form-data", authMiddleware, handleMy);
  r.get("/my-responses", authMiddleware, handleMy);
  r.get("/my-data", authMiddleware, handleMy);

  // GET /api/responses/my/:formId -> my submissions for a specific form
  r.get("/my/:formId", authMiddleware, async (req, res, next) => {
    try {
      const data = await GetMyResponsesActivity.getByForm({ userId: req.userId, formId: req.params.formId });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  });

  // GET /api/responses/user-data -> get user data (filled in ResponseModel)
  r.get("/user-data", authMiddleware, async (req, res, next) => {
    try {
      const user = await GetUserDataActivity.execute(req.userId);
      res.json({ success: true, data: { user } });
    } catch (e) { next(e); }
  });

  return r;
}

// For mounting under /api/forms as well: GET /api/forms/my/responses etc.
export function myFormDataRouter() {
  const r = express.Router();
  r.get("/my/responses", authMiddleware, async (req, res, next) => {
    try {
      const data = await GetMyResponsesActivity.execute({ userId: req.userId });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  });
  return r;
}
