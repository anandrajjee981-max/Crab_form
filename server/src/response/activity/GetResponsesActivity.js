// Why does this file exist? Activity to fetch responses with ownership check.
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
    return responses;
  }
}
