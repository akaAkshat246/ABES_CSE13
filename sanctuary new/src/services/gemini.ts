import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  // 1. Inspire Me Prompt
  getJournalPrompt: async (): Promise<string> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Give me one deeply personal, poetic journaling prompt in a single sentence. No quotes, no preamble, just the prompt.",
      });
      return response.text || "Reflect on a moment of quiet strength you felt today.";
    } catch (error) {
      console.error("Gemini Error (Journal Prompt):", error);
      return "Reflect on a moment of quiet strength you felt today.";
    }
  },

  // 2. Mood Analysis
  analyzeMood: async (content: string): Promise<{ emotion: string; encouragement: string }> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Read this journal entry and identify the primary emotion in ONE word, then give a single sentence of gentle encouragement. Format: EMOTION | encouragement\n\nEntry: ${content}`,
      });
      
      const text = response.text || "Neutral | Your thoughts are a safe space for reflection.";
      const [emotion, encouragement] = text.split("|").map(s => s.trim());
      return { 
        emotion: emotion || "Neutral", 
        encouragement: encouragement || "Your thoughts are a safe space for reflection." 
      };
    } catch (error) {
      console.error("Gemini Error (Mood Analysis):", error);
      return { emotion: "Neutral", encouragement: "Your thoughts are a safe space for reflection." };
    }
  },

  // 3. Smart Title Suggestion
  suggestTitle: async (content: string): Promise<string> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Suggest a short poetic title (max 5 words) for this journal entry. Just the title, nothing else: ${content}`,
      });
      return response.text?.replace(/["']/g, "") || "Untitled Reflection";
    } catch (error) {
      console.error("Gemini Error (Title Suggestion):", error);
      return "Untitled Reflection";
    }
  },

  // 4. Daily Quote
  getDailyQuote: async (): Promise<string> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Give me one original, deeply reflective quote about inner peace, self-growth, or mindfulness. Max 20 words. No attribution, no quotes, just the sentence.",
      });
      return response.text || "Peace is not the absence of storm, but the stillness within it.";
    } catch (error) {
      console.error("Gemini Error (Daily Quote):", error);
      return "Peace is not the absence of storm, but the stillness within it.";
    }
  },

  // 5. Weekly Reflection Prompt
  getWeeklyReflection: async (): Promise<string> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Give me one thoughtful weekly reflection question to help someone review their past week and set intentions. One sentence only.",
      });
      return response.text || "What was the most meaningful lesson you learned this week?";
    } catch (error) {
      console.error("Gemini Error (Weekly Reflection):", error);
      return "What was the most meaningful lesson you learned this week?";
    }
  },

  // 6. Memory Caption Suggestion
  suggestMemoryCaption: async (title: string): Promise<string> => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Write a short poetic caption (max 12 words) for a personal memory titled '${title}'. Just the caption.`,
      });
      return response.text?.replace(/["']/g, "") || "A moment captured in time.";
    } catch (error) {
      console.error("Gemini Error (Memory Caption):", error);
      return "A moment captured in time.";
    }
  }
};
