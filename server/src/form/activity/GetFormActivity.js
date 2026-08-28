// Why does this file exist? Activity for fetching a form with ownership check.
import FormDAO from "../dao/FormDAO.js";

export default class GetFormActivity {
  static async execute({ userId, formId }) {
    const form = await FormDAO.findById(formId);
    if (!form) {
      const e = new Error("Form not found");
      e.statusCode = 404;
      throw e;
    }
    if (form.owner_id.toString() !== userId.toString()) {
      const e = new Error("Forbidden: not form owner");
      e.statusCode = 403;
      throw e;
    }
    return form;
  }
}
