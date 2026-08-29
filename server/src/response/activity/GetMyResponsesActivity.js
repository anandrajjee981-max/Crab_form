// Why does this file exist? Fetches responses submitted by the logged-in user (respondentId = userId).
// Also enriches with form data for getMyFormData use-case.
import ResponseDAO from "../dao/ResponseDAO.js";
import FormDAO from "../../form/dao/FormDAO.js";
import FormSchema from "../../form/schema/FormSchema.js";

export default class GetMyResponsesActivity {
  // Core: get all responses where respondentId == userId - returns ALL fields + actual question text
  static async execute({ userId }) {
    if (!userId) {
      const e = new Error("Authentication required");
      e.statusCode = 401;
      throw e;
    }
    const responses = await ResponseDAO.findByRespondent(userId);

    // Enrich with full form (including formfield) so UI shows actual question instead of only que id
    if (responses.length === 0) return responses;

    const formIds = [...new Set(responses.map((r) => r.form_id.toString()))];
    // select full form - need formfield for question mapping
    const forms = await FormSchema.find({ _id: { $in: formIds } }).lean();
    const formMap = new Map(forms.map((f) => [String(f._id), f]));

    return responses.map((r) => {
      const form = formMap.get(String(r.form_id)) || null;
      const fieldMap = form?.formfield ? new Map(form.formfield.map((f) => [String(f._id), f])) : new Map();
      const sortedFields = form?.formfield ? form.formfield.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
      const enrichedAnswers = r.answers.map((a, idx) => {
        if (a.question || a.title) {
          return {
            fieldId: a.fieldId,
            value: a.value,
            question: a.question || a.title,
            title: a.title || a.question,
            datatype: a.datatype || null,
            description: a.description || null,
            required: a.required ?? null,
            options: a.options || null,
          };
        }
        let field = fieldMap.get(String(a.fieldId));
        if (!field && sortedFields[idx]) field = sortedFields[idx];
        return {
          fieldId: a.fieldId,
          value: a.value,
          question: field?.title || String(a.fieldId),
          title: field?.title || String(a.fieldId),
          datatype: field?.datatype || null,
          description: field?.description || null,
          required: field?.required ?? null,
          options: field?.options || null,
        };
      });
      return {
        ...r,
        form,
        answersEnriched: enrichedAnswers,
        answersWithQuestion: enrichedAnswers,
        answers: enrichedAnswers,
      };
    });
  }

  // Alias: getMyFormData – same as execute, naming requested by user
  static async getMyFormData({ userId, respondentId }) {
    return this.execute({ userId: userId || respondentId });
  }

  static async getMyAllFormData({ userId }) {
    return this.execute({ userId });
  }

  // Per-form filter: responses I submitted for a specific form - also enriched
  static async getByForm({ userId, formId }) {
    if (!userId) {
      const e = new Error("Authentication required");
      e.statusCode = 401;
      throw e;
    }
    const responses = await ResponseDAO.findByFormAndRespondent(formId, userId);
    const form = await FormDAO.findById(formId);
    const fieldMap = form?.formfield ? new Map(form.formfield.map((f) => [String(f._id), f])) : new Map();
    const sortedFields = form?.formfield ? form.formfield.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
    return responses.map((r) => {
      const enrichedAnswers = r.answers.map((a, idx) => {
        if (a.question || a.title) {
          return {
            fieldId: a.fieldId,
            value: a.value,
            question: a.question || a.title,
            title: a.title || a.question,
            datatype: a.datatype || null,
            description: a.description || null,
            required: a.required ?? null,
            options: a.options || null,
          };
        }
        let field = fieldMap.get(String(a.fieldId));
        if (!field && sortedFields[idx]) field = sortedFields[idx];
        return {
          fieldId: a.fieldId,
          value: a.value,
          question: field?.title || String(a.fieldId),
          title: field?.title || String(a.fieldId),
          datatype: field?.datatype || null,
          description: field?.description || null,
          required: field?.required ?? null,
          options: field?.options || null,
        };
      });
      return { ...r, form, answersEnriched: enrichedAnswers, answersWithQuestion: enrichedAnswers, answers: enrichedAnswers };
    });
  }
}
