import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyA1xjpa5ezIbtWoIk7_XW0B4I3-IKl_UW4');
const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  tools: [{ googleSearch: {} }],
  generationConfig: { responseMimeType: 'text/plain' }
});

async function test() {
  const prompt = `
You are an expert technical recruiter and AI agent acting on behalf of Michael Crane, a Senior Product Designer.
Your task is to search the web for recent job postings that match his search preferences, evaluate them against his profile, and return the matches.

SEARCH PREFERENCES:
- Titles: Senior Product Designer, Staff Product Designer
- Industries: B2B SaaS, DevTools
- Locations: Remote, NYC
- Minimum Company Stage: Series A
- EXCLUDE these roles: Founding Designer
- MUST be posted within the last 7 days.

INSTRUCTIONS:
1. Find 3 to 5 highly relevant jobs posted recently.
2. Score each job from 1-10 based on how well the candidate's profile aligns with the requirements.
3. Extract and strictly SUMMARIZE the job description.
4. Map requirements to candidate keywords.

CRITICAL OUTPUT FORMAT:
You MUST output EXACTLY ONE JSON object per line. This is called JSON-Lines (JSONL).
Do NOT output a JSON array starting with [.
Do NOT use markdown code blocks like \`\`\`json.
Just pure, unformatted text where every single line is a complete JSON object representing ONE job.
`;

  try {
    const stream = await flashModel.generateContentStream(prompt);
    let buffer = "";
    for await (const chunk of stream.stream) {
      buffer += chunk.text();
    }
    console.log("FINAL BUFFER:\n" + buffer);
  } catch (e) {
    console.error('ERROR:', e);
  }
}

test();
