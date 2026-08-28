// Why does this file exist? Component represents AI form generation request; holds prompt + optional user API key.
export default class FormGenerationRequest {
  constructor({ prompt, apiKey = null }) {
    this.prompt = prompt?.trim();
    this.apiKey = apiKey || null; // request/session-level, never logged or persisted
  }

  validate() {
    if (!this.prompt) {
      const e = new Error("prompt is required");
      e.statusCode = 400;
      throw e;
    }
  }
}
