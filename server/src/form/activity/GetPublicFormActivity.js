// Why does this file exist? Activity for public form access via slug; no auth, hides private data.
import FormDAO from "../dao/FormDAO.js";

export default class GetPublicFormActivity {
  static async execute({ slug }) {
    const form = await FormDAO.findBySlug(slug);
    if (!form) {
      const e = new Error("Form not found");
      e.statusCode = 404;
      throw e;
    }
    if (form.status !== "published") {
      const e = new Error("Form is not published");
      e.statusCode = 404;
      throw e;
    }
    // Strip private ownership metadata
    const { owner_id, ...publicForm } = form;
    return publicForm;
  }
}
