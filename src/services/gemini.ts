import { GoogleGenerativeAI } from '@google/generative-ai';

declare const process: any;

const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
      if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {}
  try {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY;
  } catch (e) {}
  return '';
};

export const hasApiKey = () => {
  return !!getApiKey();
};

const genAI = new GoogleGenerativeAI(getApiKey());

// Flash with Google Search grounding — for job scanning
export const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  // @ts-expect-error — googleSearch tool is valid for gemini-2.5-flash
  tools: [{ googleSearch: {} }],
  generationConfig: { responseMimeType: "text/plain" }
});

// Flash without search — for fast analysis tasks (keyword matching)
export const flashModelNoSearch = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: "application/json" }
});

// Pro — for high-quality resume tailoring and cover letter generation
export const proModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Pro with Google Search grounding — for generating highly contextualized outreach hooks
export const proModelWithSearch = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  // @ts-expect-error — googleSearch tool is valid for gemini-2.5-flash
  tools: [{ googleSearch: {} }],
  generationConfig: { responseMimeType: "text/plain" }
});
