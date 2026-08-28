import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * System prompt defining system instructions, schema guidelines, 
 * constraints, and output expectations for the Form Schema Generator.
 */
const SYSTEM_PROMPT = `GenZ Form — Form Schema Generator
You are the Form Schema Generator for a dynamic form-building platform called GenZ Form.
Your job is to convert a user's natural-language form request into a valid JSON form schema.
The generated JSON will be consumed directly by a React frontend and stored in MongoDB.

Core Rule:
Return ONLY valid JSON.
Do NOT include markdown formatting, code fences (such as \`\`\`json), comments, or any introductory/concluding text.

Schema Structure:
{
  "title": "string",
  "description": "string",
  "theme": {
    "name": "string",
    "primary": "hex color",
    "secondary": "hex color",
    "background": "hex color",
    "surface": "hex color",
    "text": "hex color",
    "mutedText": "hex color",
    "border": "hex color",
    "error": "hex color",
    "success": "hex color",
    "button": "hex color"
  },
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

Datatype and Option Rules:
1. Allowed datatypes: text, textarea, email, number, phone, date, select, radio, checkbox, rating, slider.
2. For select, radio, and checkbox, "options" MUST be a non-empty array of strings. For all other datatypes, "options" MUST be [].
3. For text/textarea fields, set minLength/maxLength if applicable (or null), and set min/max to null.
4. For number/rating/slider fields, set min/max integers (e.g., min: 1, max: 10) and minLength/maxLength to null.
5. "order" must start at 1 and increment sequentially (1, 2, 3...) for every field.
6. Choose HEX color values only for the theme based on user style or appropriate default (genz, minimal, dark, cyberpunk, college, etc.).
7. Keep question copy conversational, friendly, and GenZ-inspired with moderate emoji usage.

User Prompt: {userInput}`;

/**
 * Initializes the Gemini model instance.
 * Lazily created per-request to allow API key override and correct model name.
 */
function getModel(apiKeyOverride = null) {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  return new ChatGoogleGenerativeAI({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    apiKey: apiKey || "your-api-key",
    temperature: 0.2,
  });
}

/**
 * Generates a validated GenZ Form JSON schema based on a natural language prompt.
 * 
 * @param userInput - Natural language instructions for generating the form.
 * @param apiKey - Optional per-request API key override
 * @returns Parsed JSON object conforming to the GenZ Form schema.
 */
export async function generateFormSchema(userInput, apiKey = null){
  try {
    if (!userInput?.trim()) throw new Error("prompt is required");
    const model = getModel(apiKey);
    // Avoid PromptTemplate brace parsing issues — SYSTEM_PROMPT contains JSON braces.
    // Use direct HumanMessage import from @langchain/core/messages
    const { HumanMessage } = await import("@langchain/core/messages");
    const fullPrompt = SYSTEM_PROMPT.replace("{userInput}", userInput);
    const response = await model.invoke([new HumanMessage(fullPrompt)]);
    const parser = new StringOutputParser();
    const responseText = await parser.invoke(response);
    
    // Robust cleaning: strip markdown fences
    let cleanedText = responseText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    try {
      return JSON.parse(cleanedText);
    } catch {
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0].replace(/,\s*([}\]])/g, "$1"));
      throw new Error("Model did not return valid JSON");
    }
  } catch (error) {
    console.error("Failed to generate or parse form schema:", error);
    throw new Error("Form schema generation failed. Ensure model output is valid JSON.");
  }
}  