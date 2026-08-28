// Why does this file exist? Builder constructs validated Response objects from raw input.
import Response from "../components/Response.js";

export default class ResponseBuilder {
  static build({ form_id, answers, respondentEmail, respondentId }) {
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
      return { fieldId: a.fieldId, value: a.value };
    });

    return new Response({
      form_id,
      respondentEmail: respondentEmail || null,
      respondentId: respondentId || null,
      answers: normalized,
    });
  }
}
