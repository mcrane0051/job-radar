import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Flash with Google Search grounding — for job scanning
export const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  // @ts-expect-error — googleSearch tool is valid for gemini-2.0-flash
  tools: [{ googleSearch: {} }],
});

// Flash without search — for fast analysis tasks (keyword matching)
export const flashModelNoSearch = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

// Pro — for high-quality resume tailoring and cover letter generation
export const proModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro-preview-05-06',
});
