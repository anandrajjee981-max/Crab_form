// Why does this file exist? Component represents Form domain concept; data holder, no DB logic.
import FormField from "./FormField.js";
import FormTheme from "./FormTheme.js";
import FormSettings from "./FormSettings.js";

export default class Form {
  constructor({ owner_id, title, description, slug, theme, settings, formfield, status, publishedAt }) {
    this.owner_id = owner_id;
    this.title = title;
    this.description = description;
    this.slug = slug;
    this.theme = theme instanceof FormTheme ? theme : new FormTheme(theme || {});
    this.settings = settings instanceof FormSettings ? settings : new FormSettings(settings || {});
    this.formfield = (formfield || []).map((f) => (f instanceof FormField ? f : new FormField(f)));
    this.status = status || "draft";
    this.publishedAt = publishedAt || null;
  }

  toPersistence() {
    return {
      owner_id: this.owner_id,
      title: this.title,
      description: this.description,
      slug: this.slug,
      theme: this.theme.toPersistence(),
      settings: this.settings.toPersistence(),
      formfield: this.formfield.map((f) => f.toPersistence()),
      status: this.status,
      publishedAt: this.publishedAt,
    };
  }
}
