// Why does this file exist? Builder constructs validated Response objects from raw input.
import Response from "../components/Response.js";

export default class ResponseBuilder {
  static build({ form_id, ownerId = null, answers, respondentEmail, respondentName, respondentId, formSnapshot = null }) {
    if (!form_id) {
      const e = new Error("form_id is required");
      e.statusCode = 400;
      throw e;
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      const e = new Error("answers array is required");
      e.statusCode = 400;
      throw e;
    }
    const normalized = answers.map((a) => {
      if (!a.fieldId) {
        const e = new Error("Each answer requires fieldId");
        e.statusCode = 400;
        throw e;
      }
      if (a.value === undefined || a.value === null || a.value === "") {
        // allow empty but will be validated in Activity for required fields
      }
      // Snapshot fields are optional but if provided from Form ref they persist actual que
      return {
        fieldId: a.fieldId,
        value: a.value,
        question: a.question || a.title || null,
        title: a.title || a.question || null,
        datatype: a.datatype || null,
        description: a.description || null,
        required: a.required ?? null,
        options: a.options || null,
      };
    });

    return new Response({
      form_id,
      ownerId: ownerId || null,
      respondentEmail: respondentEmail || null,
      respondentName: respondentName || null,
      respondentId: respondentId || null,
      answers: normalized,
      formSnapshot,
    });
  }
}
