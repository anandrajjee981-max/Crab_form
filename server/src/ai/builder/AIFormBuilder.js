// Why does this file exist? Builder validates & normalizes AI JSON output into safe form structure; never trusts AI blindly.
const ALLOWED = new Set(["text","textarea","email","number","phone","date","select","radio","checkbox","rating","slider"]);

export default class AIFormBuilder {
  static build(aiJson) {
    if (!aiJson || typeof aiJson !== "object") {
      const e = new Error("AI output must be an object");
      e.statusCode = 500;
      throw e;
    }
    const { title, description, theme, settings, formfield } = aiJson;

    if (!title?.trim()) {
      const e = new Error("AI output missing title");
      e.statusCode = 500;
      throw e;
    }
    if (!Array.isArray(formfield) || formfield.length === 0) {
      const e = new Error("AI output must contain at least one field");
      e.statusCode = 500;
      throw e;
    }

    const normalizedFields = formfield.map((f, idx) => {
      if (!f.title?.trim()) { const e = new Error(`AI field ${idx} missing title`); e.statusCode = 500; throw e; }
      if (!ALLOWED.has(f.datatype)) { const e = new Error(`AI field "${f.title}" has invalid datatype: ${f.datatype}`); e.statusCode = 500; throw e; }
      const order = f.order ?? idx + 1;
      const options = Array.isArray(f.options) ? f.options : [];
      if (["select","radio","checkbox"].includes(f.datatype) && options.length === 0) {
        const e = new Error(`AI field "${f.title}" requires options`);
        e.statusCode = 500;
        throw e;
      }
      // force empty options for non-option types
      const finalOptions = ["select","radio","checkbox"].includes(f.datatype) ? options : [];
      return {
        title: f.title.trim(),
        datatype: f.datatype,
        placeholder: f.placeholder || "",
        description: f.description || "",
        required: !!f.required,
        order,
        options: finalOptions,
        validation: {
          minLength: f.validation?.minLength ?? null,
          maxLength: f.validation?.maxLength ?? null,
          min: f.validation?.min ?? null,
          max: f.validation?.max ?? null,
          pattern: f.validation?.pattern ?? null,
        },
      };
    });

    return {
      title: title.trim(),
      description: description?.trim() || "",
      theme: theme || { name: "genz" },
      settings: {
        showProgress: settings?.showProgress ?? true,
        allowMultipleResponses: settings?.allowMultipleResponses ?? false,
        collectEmail: settings?.collectEmail ?? false,
      },
      formfield: normalizedFields,
    };
  }
}
