// Why does this file exist? Routes connect HTTP endpoints to Activities (ACBDA entry point).
import express from "express";
import RegisterActivity from "./activity/RegisterActivity.js";
import LoginActivity from "./activity/LoginActivity.js";
import GetCurrentUserActivity from "./activity/GetCurrentUserActivity.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const user = await RegisterActivity.execute(req.body);
    res.status(201).json({ success: true, message: "User registered successfully", data: { user } });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await LoginActivity.execute(req.body);
    res.status(200).json({ success: true, message: "Login successful", data: result });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await GetCurrentUserActivity.execute(req.userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

export default router;
