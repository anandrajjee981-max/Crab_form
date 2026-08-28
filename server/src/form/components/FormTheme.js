// Why does this file exist? Component holds theme data; separated from fields to avoid duplication.
const DEFAULTS = {
  name: "genz", primary: "#8B5CF6", secondary: "#EC4899", background: "#F9FAFB",
  surface: "#FFFFFF", text: "#111827", mutedText: "#6B7280", border: "#E5E7EB",
  error: "#EF4444", success: "#10B981", button: "#8B5CF6",
};

export default class FormTheme {
  constructor(theme = {}) {
    Object.assign(this, { ...DEFAULTS, ...theme });
  }
  toPersistence() {
    const { name, primary, secondary, background, surface, text, mutedText, border, error, success, button } = this;
    return { name, primary, secondary, background, surface, text, mutedText, border, error, success, button };
  }
}
