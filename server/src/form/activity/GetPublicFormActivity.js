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
    // Keep ownerId for shipped link ?owner= ref, strip private metadata otherwise
    const ownerId = form.owner_id;
    const { owner_id, ...rest } = form;
    // Expose ownerId needed for response owner linking via shipped link
    return { ...rest, ownerId, owner_id: ownerId };
  }
}
