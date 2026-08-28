// Why does this file exist? Reusable body validators; Activities also validate but middleware catches early.

const ALLOWED_DATATYPES = new Set([
  "text","textarea","email","number","phone","date","select","radio","checkbox","rating","slider"
]);

export function validateCreateForm(req, res, next) {
  const { title } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: "Form title is required" });
  }
  if (req.body.formfield && !Array.isArray(req.body.formfield)) {
    return res.status(400).json({ success: false, message: "formfield must be an array" });
  }
  if (Array.isArray(req.body.formfield)) {
    for (const f of req.body.formfield) {
      if (!f.title?.trim()) return res.status(400).json({ success: false, message: "Each field requires a title" });
      if (!ALLOWED_DATATYPES.has(f.datatype)) return res.status(400).json({ success: false, message: `Invalid datatype: ${f.datatype}` });
    }
  }
  next();
}

export function validateAIRequest(req, res, next) {
  if (!req.body.prompt?.trim() && !req.body.text?.trim()) {
    return res.status(400).json({ success: false, message: "prompt is required" });
  }
  next();
}
