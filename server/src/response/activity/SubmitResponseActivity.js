// Why does this file exist? Activity orchestrates response submission with full validation: form exists, published, fields valid.
// Also fills ResponseModel with user data when user is authenticated.
import FormDAO from "../../form/dao/FormDAO.js";
import UserDAO from "../../auth/dao/UserDAO.js";
import ResponseBuilder from "../builder/ResponseBuilder.js";
import ResponseDAO from "../dao/ResponseDAO.js";

function validateValue(datatype, value, field) {
  if (value === undefined || value === null || value === "") {
    if (field.required) {
      const e = new Error(`Field "${field.title}" is required`);
      e.statusCode = 400;
      throw e;
    }
    return;
  }
  switch (datatype) {
    case "email": {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      if (!ok) { const e = new Error(`Invalid email for field "${field.title}"`); e.statusCode = 400; throw e; }
      break;
    }
    case "number":
    case "rating":
    case "slider": {
      if (isNaN(Number(value))) { const e = new Error(`Field "${field.title}" expects a number`); e.statusCode = 400; throw e; }
      const num = Number(value);
      if (field.validation?.min != null && num < field.validation.min) { const e = new Error(`Field "${field.title}" below min ${field.validation.min}`); e.statusCode = 400; throw e; }
      if (field.validation?.max != null && num > field.validation.max) { const e = new Error(`Field "${field.title}" above max ${field.validation.max}`); e.statusCode = 400; throw e; }
      break;
    }
    case "select":
    case "radio": {
      if (!field.options.includes(String(value))) { const e = new Error(`Invalid option for field "${field.title}"`); e.statusCode = 400; throw e; }
      break;
    }
    case "checkbox": {
      if (!Array.isArray(value)) { const e = new Error(`Field "${field.title}" expects array for checkbox`); e.statusCode = 400; throw e; }
      for (const v of value) if (!field.options.includes(String(v))) { const e = new Error(`Invalid checkbox option "${v}" for field "${field.title}"`); e.statusCode = 400; throw e; }
      break;
    }
    case "text":
    case "textarea":
    case "phone": {
      if (field.validation?.minLength != null && String(value).length < field.validation.minLength) { const e = new Error(`Field "${field.title}" too short`); e.statusCode = 400; throw e; }
      if (field.validation?.maxLength != null && String(value).length > field.validation.maxLength) { const e = new Error(`Field "${field.title}" too long`); e.statusCode = 400; throw e; }
      if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(String(value))) { const e = new Error(`Field "${field.title}" fails pattern validation`); e.statusCode = 400; throw e; }
      break;
    }
    default: break;
  }
}

export default class SubmitResponseActivity {
  static async execute({ formId, body, userId }) {
    const form = await FormDAO.findById(formId);
    if (!form) { const e = new Error("Form not found"); e.statusCode = 404; throw e; }
    if (form.status !== "published") { const e = new Error("Form is not published"); e.statusCode = 400; throw e; }

    // --- get user data if authenticated: fill ResponseModel ---
    let userData = null;
    if (userId) {
      try {
        userData = await UserDAO.findUserById(userId);
      } catch {}
    }
    const respondentEmail = body.respondentEmail || userData?.email || null;
    const respondentName = body.respondentName || userData?.name || null;
    const respondentId = userId || null;

    // allowMultipleResponses check could be added with respondent tracking
    const fieldMap = new Map(form.formfield.map((f) => [f._id.toString(), f]));

    const answers = body.answers;
    if (!Array.isArray(answers)) { const e = new Error("answers must be an array"); e.statusCode = 400; throw e; }

    // Validate each answer maps to valid field and datatype matches
    for (const ans of answers) {
      const field = fieldMap.get(ans.fieldId?.toString());
      if (!field) { const e = new Error(`Invalid fieldId: ${ans.fieldId}`); e.statusCode = 400; throw e; }
      validateValue(field.datatype, ans.value, field);
    }

    // Check required fields are present
    for (const field of form.formfield) {
      if (field.required) {
        const found = answers.find((a) => a.fieldId.toString() === field._id.toString());
        if (!found || found.value === undefined || found.value === null || found.value === "" || (Array.isArray(found.value) && found.value.length === 0)) {
          const e = new Error(`Required field missing: "${field.title}"`);
          e.statusCode = 400;
          throw e;
        }
      }
    }

    const response = ResponseBuilder.build({
      form_id: formId,
      answers,
      respondentEmail,
      respondentName,
      respondentId,
    });

    const saved = await ResponseDAO.createResponse(response);
    return saved;
  }

  // alias for clarity: getUserData helper
  static async getUserData(userId) {
    if (!userId) return null;
    return UserDAO.findUserById(userId);
  }
}
