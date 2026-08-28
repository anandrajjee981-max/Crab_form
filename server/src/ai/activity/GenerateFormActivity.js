// Why does this file exist? Activity orchestrates AI generation: request -> Gemini -> validate -> build structure -> return (no DB save).
import FormGenerationRequest from "../components/FormGenerationRequest.js";
import GeminiClient from "../services/GeminiClient.js";
import AIFormBuilder from "../builder/AIFormBuilder.js";

export default class GenerateFormActivity {
  static async execute({ prompt, text, apiKey }) {
    const rawPrompt = prompt || text;
    const request = new FormGenerationRequest({ prompt: rawPrompt, apiKey });
    request.validate();

    // Do not log apiKey
    const rawJson = await GeminiClient.generate(request.prompt, request.apiKey);
    const formStructure = AIFormBuilder.build(rawJson);

    // IMPORTANT: do NOT persist to MongoDB here; frontend previews then calls POST /api/forms
    return formStructure;
  }
}
