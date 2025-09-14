
import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "../types";

// The API key is expected to be set in the execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = "gemini-2.5-flash";

export const GeminiService = {
  getAIAssistantResponse: async (
    systemInstruction: string,
    userMessage: string,
    history: ChatMessage[]
  ): Promise<string> => {
    try {
      // Filter out the initial message from history for the API call
      const conversationHistory = history.filter(m => m.content !== "I am NOVA-NACHA, ready to process payroll. Awaiting your instructions. To begin, type `Run Payroll-Cycle`." && m.content !== "I am ORACLE-LEDGER, ready to manage the general ledger. You can ask me to `Load chart of accounts` or `Produce daily Trial Balance`.");
      
      const contents = conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
      }));
      // Add the new user message
      contents.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      
      return response.text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "An error occurred while communicating with the AI assistant. Please check the console for details.";
    }
  },
};
