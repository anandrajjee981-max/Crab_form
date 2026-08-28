// Why does this file exist? Extracts & verifies JWT, attaches req.userId; used by protected routes.
import { verifyToken } from "../utils/jwt.js";

export default function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
