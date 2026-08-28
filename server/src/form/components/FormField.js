// Why does this file exist? Component represents a single form field; supports extensible datatypes.
export const ALLOWED_DATATYPES = new Set([
  "text","textarea","email","number","phone","date","select","radio","checkbox","rating","slider"
]);

export default class FormField {
  constructor({ title, datatype, placeholder = "", description = "", required = false, order, options = [], validation = {} }) {
    this.title = title;
    this.datatype = datatype;
    this.placeholder = placeholder;
    this.description = description;
    this.required = required;
    this.order = order;
    this.options = options;
    this.validation = {
      minLength: validation.minLength ?? null,
      maxLength: validation.maxLength ?? null,
      min: validation.min ?? null,
      max: validation.max ?? null,
      pattern: validation.pattern ?? null,
    };
  }

  toPersistence() {
    return {
      title: this.title,
      datatype: this.datatype,
      placeholder: this.placeholder,
      description: this.description,
      required: this.required,
      order: this.order,
      options: this.options,
      validation: this.validation,
    };
  }

  static validate(field) {
    if (!field.title?.trim()) throw new Error("Field title is required");
    if (!ALLOWED_DATATYPES.has(field.datatype)) throw new Error(`Invalid datatype: ${field.datatype}`);
    if (!field.order || typeof field.order !== "number") throw new Error("Field order is required");
    if (["select","radio","checkbox"].includes(field.datatype) && (!field.options || field.options.length === 0)) {
      throw new Error(`Field "${field.title}" of type ${field.datatype} requires options`);
    }
  }
}
