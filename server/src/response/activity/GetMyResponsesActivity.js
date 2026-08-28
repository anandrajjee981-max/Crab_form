// Why does this file exist? Fetches responses submitted by the logged-in user (respondentId = userId).
// Also enriches with form data for getMyFormData use-case.
import ResponseDAO from "../dao/ResponseDAO.js";
import FormDAO from "../../form/dao/FormDAO.js";
import FormSchema from "../../form/schema/FormSchema.js";

export default class GetMyResponsesActivity {
  // Core: get all responses where respondentId == userId
  static async execute({ userId }) {
    if (!userId) {
      const e = new Error("Authentication required");
      e.statusCode = 401;
      throw e;
    }
    const responses = await ResponseDAO.findByRespondent(userId);

    // Enrich with form meta (title, slug, description) so UI can display
    if (responses.length === 0) return responses;

    const formIds = [...new Set(responses.map((r) => r.form_id.toString()))];
    const forms = await FormSchema.find({ _id: { $in: formIds } })
      .select("title slug description status theme")
      .lean();
    const formMap = new Map(forms.map((f) => [String(f._id), f]));

    return responses.map((r) => ({
      ...r,
      form: formMap.get(String(r.form_id)) || null,
    }));
  }

  // Alias: getMyFormData – same as execute, naming requested by user
  static async getMyFormData({ userId, respondentId }) {
    return this.execute({ userId: userId || respondentId });
  }

  static async getMyAllFormData({ userId }) {
    return this.execute({ userId });
  }

  // Per-form filter: responses I submitted for a specific form
  static async getByForm({ userId, formId }) {
    if (!userId) {
      const e = new Error("Authentication required");
      e.statusCode = 401;
      throw e;
    }
    const responses = await ResponseDAO.findByFormAndRespondent(formId, userId);
    const form = await FormDAO.findById(formId);
    return responses.map((r) => ({ ...r, form }));
  }
}
