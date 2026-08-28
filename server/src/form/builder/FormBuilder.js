// Why does this file exist? Builder constructs Form domain objects; normalizes values, sets defaults, no DB/HTTP.
import Form from "../components/Form.js";
import FormField from "../components/FormField.js";
import FormTheme from "../components/FormTheme.js";
import FormSettings from "../components/FormSettings.js";
import { generateSlug } from "../../utils/slug.js";

export default class FormBuilder {
  static build({ owner_id, title, description, slug, theme, settings, formfield, status }) {
    if (!title?.trim()) {
      const e = new Error("Form title is required");
      e.statusCode = 400;
      throw e;
    }
    if (!owner_id) {
      const e = new Error("owner_id is required");
      e.statusCode = 400;
      throw e;
    }

    const normalizedFields = (formfield || []).map((f, idx) => {
      const field = new FormField({
        title: f.title,
        datatype: f.datatype,
        placeholder: f.placeholder || "",
        description: f.description || "",
        required: !!f.required,
        order: f.order ?? idx + 1,
        options: f.options || [],
        validation: f.validation || {},
      });
      FormField.validate(field);
      return field;
    });

    // sort by order
    normalizedFields.sort((a, b) => a.order - b.order);

    const finalSlug = slug?.trim() || generateSlug(title);

    return new Form({
      owner_id,
      title: title.trim(),
      description: description?.trim() || "",
      slug: finalSlug,
      theme: new FormTheme(theme || {}),
      settings: new FormSettings(settings || {}),
      formfield: normalizedFields,
      status: status || "draft",
    });
  }

  // For updates: merges existing form doc with incoming patch
  static buildForUpdate(existingForm, patch) {
    const merged = {
      title: patch.title ?? existingForm.title,
      description: patch.description ?? existingForm.description,
      slug: patch.slug ?? existingForm.slug,
      theme: patch.theme ? { ...existingForm.theme, ...patch.theme } : existingForm.theme,
      settings: patch.settings ? { ...existingForm.settings, ...patch.settings } : existingForm.settings,
      formfield: patch.formfield ?? existingForm.formfield,
    };

    // Validate fields if provided
    if (patch.formfield) {
      merged.formfield.forEach((f, idx) => {
        const field = new FormField({
          title: f.title,
          datatype: f.datatype,
          placeholder: f.placeholder || "",
          description: f.description || "",
          required: !!f.required,
          order: f.order ?? idx + 1,
          options: f.options || [],
          validation: f.validation || {},
        });
        FormField.validate(field);
      });
    }

    return merged;
  }
}
