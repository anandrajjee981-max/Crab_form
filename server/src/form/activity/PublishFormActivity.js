// Why does this file exist? Activity to publish a form: validates completeness, sets status/publishedAt/slug.
import FormDAO from "../dao/FormDAO.js";
import { generateSlug } from "../../utils/slug.js";

export default class PublishFormActivity {
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
    if (!form.title?.trim()) {
      const e = new Error("Cannot publish: title is required");
      e.statusCode = 400;
      throw e;
    }
    if (!form.formfield || form.formfield.length === 0) {
      const e = new Error("Cannot publish: form must have at least one field");
      e.statusCode = 400;
      throw e;
    }

    let slug = form.slug;
    if (!slug) slug = generateSlug(form.title);
    // ensure uniqueness if blank somehow
    const existingSlugForm = await FormDAO.findBySlug(slug);
    if (existingSlugForm && existingSlugForm._id.toString() !== form._id.toString()) {
      slug = generateSlug(form.title);
    }

    const updated = await FormDAO.updateForm(formId, {
      status: "published",
      publishedAt: new Date(),
      slug,
    });
    return updated;
  }
}
