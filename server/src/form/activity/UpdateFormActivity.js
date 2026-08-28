// Why does this file exist? Activity orchestrates update: auth+ownership -> validate -> persist.
import FormDAO from "../dao/FormDAO.js";
import FormBuilder from "../builder/FormBuilder.js";

const PROTECTED_FIELDS = new Set(["owner_id", "_id", "publishedAt", "status"]);

export default class UpdateFormActivity {
  static async execute({ userId, formId, body }) {
    const existing = await FormDAO.findById(formId);
    if (!existing) {
      const e = new Error("Form not found");
      e.statusCode = 404;
      throw e;
    }
    if (existing.owner_id.toString() !== userId.toString()) {
      const e = new Error("Forbidden: not form owner");
      e.statusCode = 403;
      throw e;
    }

    // Strip protected fields
    for (const key of PROTECTED_FIELDS) delete body[key];

    const merged = FormBuilder.buildForUpdate(existing, body);

    const updated = await FormDAO.updateForm(formId, merged);
    return updated;
  }
}
