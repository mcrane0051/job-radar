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
    if (typeof window !== 'undefined' && window.localStorage) {
      const localKey = window.localStorage.getItem('gemini-api-key');
      if (localKey) return localKey;
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

let _genAI: GoogleGenerativeAI | null = null;
const getGenAI = () => {
  if (!_genAI) {
    const key = getApiKey();
    if (!key) throw new Error("API key not valid. Please pass a valid API key.");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

// Flash with Google Search grounding — for job scanning
export const getFlashModel = () => getGenAI().getGenerativeModel({
  model: 'gemini-2.5-flash',
  // @ts-expect-error — googleSearch tool is valid for gemini-2.5-flash
  tools: [{ googleSearch: {} }],
  generationConfig: { responseMimeType: "text/plain" }
});

// Flash without search — for fast analysis tasks (keyword matching)
export const getFlashModelNoSearch = () => getGenAI().getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: "application/json" }
});

// Pro — for high-quality resume tailoring and cover letter generation
export const getProModel = () => getGenAI().getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Pro with Google Search grounding — for generating highly contextualized outreach hooks
export const getProModelWithSearch = () => getGenAI().getGenerativeModel({
  model: 'gemini-2.5-flash',
  // @ts-expect-error — googleSearch tool is valid for gemini-2.5-flash
  tools: [{ googleSearch: {} }],
  generationConfig: { responseMimeType: "text/plain" }
});
