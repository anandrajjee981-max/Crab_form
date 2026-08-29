// Why does this file exist? Activity to fetch responses with ownership check + enrich with actual question.
import FormDAO from "../../form/dao/FormDAO.js";
import ResponseDAO from "../dao/ResponseDAO.js";

export default class GetResponsesActivity {
  static async execute({ userId, formId }) {
    const form = await FormDAO.findById(formId);
    if (!form) { const e = new Error("Form not found"); e.statusCode = 404; throw e; }
    if (form.owner_id.toString() !== userId.toString()) {
      const e = new Error("Forbidden: not form owner");
      e.statusCode = 403;
      throw e;
    }
    const responses = await ResponseDAO.findByForm(formId);
    // Prefer snapshot stored in response (ref from form at submit time) — fixes historical docs where fieldId no longer exists after form edit
    // Fallback to live Form ref lookup via form_id -> Form.formfield
    const fieldMap = new Map((form.formfield || []).map((f) => [String(f._id), f]));
    const sortedFields = (form.formfield || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const enriched = responses.map((r) => {
      const enrichedAnswers = (r.answers || []).map((a, idx) => {
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
        // Fallback for legacy docs where fieldId changed after form edit: map by order index
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
        answers: enrichedAnswers, // override base answers so even plain `answers` shows que
      };
    });
    return enriched;
  }
}
