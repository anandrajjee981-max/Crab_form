// Why does this file exist? Routes map HTTP to Form Activities; thin handlers, no business logic.
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import CreateFormActivity from "./activity/CreateFormActivity.js";
import GetFormActivity from "./activity/GetFormActivity.js";
import ListFormsActivity from "./activity/ListFormsActivity.js";
import GetPublicFormActivity from "./activity/GetPublicFormActivity.js";
import UpdateFormActivity from "./activity/UpdateFormActivity.js";
import DeleteFormActivity from "./activity/DeleteFormActivity.js";
import PublishFormActivity from "./activity/PublishFormActivity.js";
import { validateCreateForm } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Public route must come before :id
router.get("/public/:slug", async (req, res, next) => {
  try {
    const form = await GetPublicFormActivity.execute({ slug: req.params.slug });
    res.json({ success: true, data: form });
  } catch (e) { next(e); }
});

router.use(authMiddleware);

router.post("/", validateCreateForm, async (req, res, next) => {
  try {
    const form = await CreateFormActivity.execute({ userId: req.userId, body: req.body });
    res.status(201).json({ success: true, message: "Form created successfully", data: form });
  } catch (e) { next(e); }
});

router.get("/", async (req, res, next) => {
  try {
    const forms = await ListFormsActivity.execute({ userId: req.userId });
    res.json({ success: true, data: forms });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const form = await GetFormActivity.execute({ userId: req.userId, formId: req.params.id });
    res.json({ success: true, data: form });
  } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const form = await UpdateFormActivity.execute({ userId: req.userId, formId: req.params.id, body: req.body });
    res.json({ success: true, message: "Form updated successfully", data: form });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await DeleteFormActivity.execute({ userId: req.userId, formId: req.params.id });
    res.json({ success: true, message: "Form deleted successfully" });
  } catch (e) { next(e); }
});

router.post("/:id/publish", async (req, res, next) => {
  try {
    const form = await PublishFormActivity.execute({ userId: req.userId, formId: req.params.id });
    res.json({ success: true, message: "Form published successfully", data: form });
  } catch (e) { next(e); }
});

export default router;
