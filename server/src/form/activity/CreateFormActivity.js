// Why does this file exist? Activity orchestrates Create Form use-case: validate -> build -> persist -> return.
import FormBuilder from "../builder/FormBuilder.js";
import FormDAO from "../dao/FormDAO.js";
import { generateSlug } from "../../utils/slug.js";

export default class CreateFormActivity {
  static async execute({ userId, body }) {
    if (!userId) {
      const e = new Error("Authentication required");
      e.statusCode = 401;
      throw e;
    }
    if (!body?.title?.trim()) {
      const e = new Error("Form title is required");
      e.statusCode = 400;
      throw e;
    }

    // Ensure slug uniqueness if provided
    let slug = body.slug?.trim() || generateSlug(body.title);
    // If slug exists, add suffix
    const exists = await FormDAO.existsSlug(slug);
    if (exists) slug = generateSlug(slug);

    const formComponent = FormBuilder.build({
      owner_id: userId,
      title: body.title,
      description: body.description,
      slug,
      theme: body.theme,
      settings: body.settings,
      formfield: body.formfield,
    });

    const saved = await FormDAO.createForm(formComponent);
    return saved;
  }
}
