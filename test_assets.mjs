import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || 'AIzaSyA1xjpa5ezIbtWoIk7_XW0B4I3-IKl_UW4');

export const flashModelNoSearch = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: "application/json" }
});

async function test() {
  const prompt = `
You are an expert technical recruiter and AI agent acting on behalf of Michael Crane, a Senior Product Designer.
Your task is to generate Application Assets for the following Job Description based ONLY on the Candidate Profile provided.

CANDIDATE PROFILE:
Test profile with extensive experience in React and Node.js.

JOB DETAILS:
Title: Senior Frontend Engineer
Company: Test Company
Description:
We need a senior frontend engineer with deep React knowledge and some Node.js experience.

INSTRUCTIONS:
1. KEYWORD ALIGNMENT: Identify high-value keywords from the job description and map them to the candidate's verified experience.
   - exact_match: Terms from the JD explicitly stated in the profile.
   - implicit_match: Terms conceptually supported by the profile but phrased differently. For each, you MUST map the 'jobKeyword' to the 'resumeKeyword' found in the profile.
   - missing: Critical terms from the JD that cannot be supported by the profile.
   DO NOT invent or infer experience. If it's not in the profile, it is "missing".

2. COVER LETTER: Draft a short, punchy, and highly personalized cover letter (max 3-4 paragraphs). Highlight the exact/implicit matches to prove fit. 

3. RESUME TAILORING: Provide 2-3 specific, actionable edits the candidate should make to their resume. Do not give general advice.
   CRITICAL: You must prioritize generating edits that explicitly convert any "implicit_match" keywords into exact matches by rewriting the candidate's existing bullet points to include the exact terminology used in the Job Description.
   CRITICAL: NEVER output multiple edits for the same section (e.g. do not output two separate edits for "Summary"). If you have multiple improvements for a single section, consolidate them into ONE cohesive paragraph or bullet block for that section.
   For each edit, provide:
   - "section": The specific section of the resume to edit (e.g., "Work Experience - Google", "Summary").
   - "edit": The exact, literal bullet point or sentence the candidate should copy and paste into their resume to improve it for this role.
   - "reason": A brief explanation of why this specific edit will help them pass the ATS or impress the hiring manager based on the JD.

CRITICAL OUTPUT FORMAT:
You MUST output EXACTLY ONE JSON object. Do not output markdown code blocks. Just pure JSON.
Structure:
{
  "keywords": {
    "exact_match": ["...", "..."],
    "implicit_match": [
      {
        "jobKeyword": "...",
        "resumeKeyword": "..."
      }
    ],
    "missing": ["...", "..."]
  },
  "coverLetter": "...",
  "resumeTailoring": [
    {
      "section": "...",
      "edit": "...",
      "reason": "..."
    }
  ]
}
`;
  
  try {
    const result = await flashModelNoSearch.generateContent(prompt);
    const responseText = result.response.text();
    console.log("Raw response:");
    console.log(responseText);
    JSON.parse(responseText);
    console.log("JSON parsed successfully from raw text.");
    
    // Test the regex logic in sidebarGenerator.ts
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Regex failed to match.");
    }
    JSON.parse(jsonMatch[0]);
    console.log("JSON parsed successfully from regex match.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}
test();
