// Why does this file exist? Dedicated Gemini client; only place that talks to Gemini; API key from env/request.
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
import { env } from "../../config/env.js";

const SYSTEM_PROMPT_TEMPLATE = `You are the Form Schema Generator for Crab Form — a GenZ-first dynamic form platform.
Convert user's natural-language form request into valid JSON form schema.

Core Rule:
Return ONLY valid JSON. No markdown, no code fences, no extra text.

Schema Structure:
{
  "title": "string",
  "description": "string",
  "theme": { "name": "string" },
  "settings": {
    "showProgress": true,
    "allowMultipleResponses": false,
    "collectEmail": false
  },
  "formfield": [
    {
      "title": "string",
      "datatype": "text | textarea | email | number | phone | date | select | radio | checkbox | rating | slider",
      "placeholder": "string",
      "description": "string",
      "required": boolean,
      "order": number,
      "options": string[],
      "validation": {
        "minLength": number | null,
        "maxLength": number | null,
        "min": number | null,
        "max": number | null,
        "pattern": string | null
      }
    }
  ]
}

Rules:
1. Allowed datatypes: text, textarea, email, number, phone, date, select, radio, checkbox, rating, slider.
2. For select/radio/checkbox, options MUST be non-empty array. For others, options MUST be [].
3. order starts at 1 and increments sequentially.
4. Theme name: genz | minimal | dark | college — pick best fit or genz default.
5. Copy should be conversational, GenZ-friendly.
User Prompt: __USER_INPUT__`;

function buildPrompt(userInput) {
  return SYSTEM_PROMPT_TEMPLATE.replace("__USER_INPUT__", userInput);
}

export default class GeminiClient {
  static async generate(promptText, apiKeyOverride = null) {
    if (!promptText || !promptText.trim()) {
      throw new Error("prompt is required");
    }
    const apiKey = (apiKeyOverride || env.GEMINI_API_KEY || "").trim();

    // Only use mock if no key at all — allow AIza..., AQ..., or any valid key format
    const useMock = !apiKey || apiKey.length < 15;
    if (useMock) {
      console.warn("Gemini API key missing — using mock form generator for prompt:", promptText.slice(0, 80));
      return GeminiClient.mockGenerate(promptText);
    }

    const tryModels = [
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-3-flash-preview",
    ];
    let lastErr = null;
    for (const modelName of tryModels) {
      try {
        const model = new ChatGoogleGenerativeAI({
          model: modelName,
          apiKey,
          temperature: 0.2,
          maxOutputTokens: 2048,
        });

        const fullPrompt = buildPrompt(promptText);
        const response = await Promise.race([
          model.invoke([new HumanMessage(fullPrompt)]),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini request timeout after 25s")), 25000)),
        ]);
        const parser = new StringOutputParser();
        const responseText = await parser.invoke(response);

        let cleaned = responseText.trim();
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        try {
          return JSON.parse(cleaned);
        } catch {
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (match) {
            const jsonStr = match[0].replace(/,\s*([}\]])/g, "$1");
            return JSON.parse(jsonStr);
          }
          throw new Error("Gemini did not return valid JSON. Raw: " + cleaned.slice(0, 300));
        }
      } catch (err) {
        lastErr = err;
        const isModelNotFound = err.message?.includes("404") || err.message?.includes("not found") || err.message?.includes("is not available");
        if (isModelNotFound) {
          console.warn(`Model ${modelName} not available, trying next...`, err.message.slice(0, 120));
          continue;
        }
        console.error("Gemini generate failed, falling back to mock:", err.message);
        return GeminiClient.mockGenerate(promptText);
      }
    }
    console.error("All Gemini models failed, falling back to mock:", lastErr?.message);
    return GeminiClient.mockGenerate(promptText);
  }

  static mockGenerate(promptText) {
    const lower = promptText.toLowerCase();
    const isInternship = lower.includes("internship");
    const isFeedback = lower.includes("feedback");
    const isRsvp = lower.includes("rsvp") || lower.includes("event") || lower.includes("party");
    const isJob = lower.includes("job") || lower.includes("application");
    const isCustomer = lower.includes("customer");
    const isCollege = lower.includes("college") || lower.includes("hackathon");

    let title = "Custom Form";
    let description = `Form for: ${promptText.slice(0, 80)}`;
    let themeName = "genz";
    let fields = [];

    if (isInternship && isFeedback) {
      title = "Internship Feedback 🦀";
      description = "Tell us how the internship actually went.";
      fields = [
        { title: "Your name", datatype: "text", placeholder: "Your full name", required: true, order: 1, options: [], validation: {} },
        { title: "Internship role", datatype: "text", placeholder: "e.g. Frontend Intern", required: true, order: 2, options: [], validation: {} },
        { title: "Rate your experience", datatype: "rating", placeholder: "", required: true, order: 3, options: [], validation: {} },
        { title: "What went well?", datatype: "textarea", placeholder: "Spill the good stuff...", required: false, order: 4, options: [], validation: {} },
        { title: "What could be better?", datatype: "textarea", placeholder: "Be honest...", required: false, order: 5, options: [], validation: {} },
      ];
    } else if (isRsvp) {
      title = isCollege ? "College Event RSVP 🎓" : "Event RSVP 🎉";
      description = "Secure your spot — crab's got you.";
      themeName = "college";
      fields = [
        { title: "Your name", datatype: "text", placeholder: "Full name", required: true, order: 1, options: [], validation: {} },
        { title: "Email", datatype: "email", placeholder: "you@college.edu", required: true, order: 2, options: [], validation: {} },
        { title: "Will you attend?", datatype: "radio", placeholder: "", required: true, order: 3, options: ["Yes", "No", "Maybe"], validation: {} },
        { title: "Number of guests", datatype: "number", placeholder: "0", required: false, order: 4, options: [], validation: {} },
        { title: "Anything we should know?", datatype: "textarea", placeholder: "Allergies, questions...", required: false, order: 5, options: [], validation: {} },
      ];
    } else if (isJob) {
      title = "Job Application 💼";
      description = "Show us what you've got.";
      fields = [
        { title: "Full name", datatype: "text", placeholder: "Jane Doe", required: true, order: 1, options: [], validation: {} },
        { title: "Email", datatype: "email", placeholder: "jane@example.com", required: true, order: 2, options: [], validation: {} },
        { title: "Portfolio / LinkedIn", datatype: "text", placeholder: "https://...", required: false, order: 3, options: [], validation: {} },
        { title: "Why this role?", datatype: "textarea", placeholder: "Tell your story...", required: true, order: 4, options: [], validation: {} },
        { title: "Expected CTC", datatype: "number", placeholder: "e.g. 600000", required: false, order: 5, options: [], validation: {} },
      ];
    } else if (isCustomer) {
      title = "Customer Feedback ⭐";
      description = "Your vibe check matters.";
      fields = [
        { title: "Name", datatype: "text", placeholder: "Your name", required: false, order: 1, options: [], validation: {} },
        { title: "Email", datatype: "email", placeholder: "you@example.com", required: false, order: 2, options: [], validation: {} },
        { title: "Rate our service", datatype: "rating", placeholder: "", required: true, order: 3, options: [], validation: {} },
        { title: "What did you love?", datatype: "textarea", placeholder: "Spill the tea...", required: false, order: 4, options: [], validation: {} },
        { title: "Would you recommend us?", datatype: "radio", placeholder: "", required: true, order: 5, options: ["Definitely", "Maybe", "No"], validation: {} },
      ];
    } else {
      // Generic fallback — infer from prompt
      title = promptText.length < 40 ? promptText : promptText.slice(0, 40) + "…";
      title = title.charAt(0).toUpperCase() + title.slice(1);
      description = `Generated from: "${promptText.slice(0, 100)}"`;
      fields = [
        { title: "Your name", datatype: "text", placeholder: "Enter your name", required: true, order: 1, options: [], validation: {} },
        { title: "Email", datatype: "email", placeholder: "you@example.com", required: true, order: 2, options: [], validation: {} },
        { title: `Tell us about: ${promptText.slice(0, 30)}`, datatype: "textarea", placeholder: "Your answer...", required: true, order: 3, options: [], validation: {} },
        { title: "Rate your experience", datatype: "rating", placeholder: "", required: false, order: 4, options: [], validation: {} },
        { title: "Any additional comments?", datatype: "textarea", placeholder: "Anything else...", required: false, order: 5, options: [], validation: {} },
      ];
    }

    return {
      title,
      description,
      theme: { name: themeName },
      settings: { showProgress: true, allowMultipleResponses: false, collectEmail: false },
      formfield: fields,
    };
  }
}
