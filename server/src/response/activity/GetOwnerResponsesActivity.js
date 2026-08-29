// Why does this file exist? Fetches ALL responses for forms owned by user (owner view).
// Separated from respondent view (GetMyResponsesActivity) so 2 docs (anonymous + auth) both show.
// Uses ownerId stored via shipped link ref + fallback to Form.owner_id lookup for legacy docs.
import ResponseDAO from "../dao/ResponseDAO.js";
import FormSchema from "../../form/schema/FormSchema.js";

export default class GetOwnerResponsesActivity {
  // Returns all responses for all forms where owner_id == userId
  static async execute({ userId }) {
    if (!userId) { const e = new Error("Authentication required"); e.statusCode = 401; throw e; }
    // Find all forms owned by user
    const ownedForms = await FormSchema.find({ owner_id: userId }).lean();
    if (ownedForms.length === 0) return [];
    const formIds = ownedForms.map(f => f._id);
    const formMap = new Map(ownedForms.map(f => [String(f._id), f]));

    // Query by ownerId (new docs) OR form_id in ownedForms (legacy docs with null ownerId)
    // Use DAO helper that finds by owner or by formIds
    let responses = [];
    try {
      responses = await ResponseDAO.findByOwnerOrFormIds(userId, formIds);
    } catch {
      // fallback direct query
      const ResponseSchema = (await import("../schema/ResponseSchema.js")).default;
      responses = await ResponseSchema.find({ $or: [{ ownerId: userId }, { form_id: { $in: formIds } }] }).sort({ createdAt: -1 }).lean();
    }

    // Enrich with actual que via snapshot + Form ref fallback
    return responses.map(r => {
      const form = formMap.get(String(r.form_id)) || null;
      const fieldMap = form?.formfield ? new Map(form.formfield.map(f => [String(f._id), f])) : new Map();
      const sortedFields = form?.formfield ? form.formfield.slice().sort((a,b)=>(a.order??0)-(b.order??0)) : [];
      const enrichedAnswers = (r.answers||[]).map((a, idx) => {
        if (a.question || a.title) {
          return { fieldId:a.fieldId, value:a.value, question:a.question||a.title, title:a.title||a.question, datatype:a.datatype||null, description:a.description||null, required:a.required??null, options:a.options||null };
        }
        let field = fieldMap.get(String(a.fieldId));
        if (!field && sortedFields[idx]) field = sortedFields[idx];
        return { fieldId:a.fieldId, value:a.value, question:field?.title||String(a.fieldId), title:field?.title||String(a.fieldId), datatype:field?.datatype||null, description:field?.description||null, required:field?.required??null, options:field?.options||null };
      });
      return { ...r, form, answersEnriched: enrichedAnswers, answersWithQuestion: enrichedAnswers, answers: enrichedAnswers };
    });
  }

  // Per form owner view (thin wrapper over GetResponsesActivity)
  static async getByForm({ userId, formId }) {
    const { default: GetResponsesActivity } = await import("./GetResponsesActivity.js");
    return GetResponsesActivity.execute({ userId, formId });
  }
}
