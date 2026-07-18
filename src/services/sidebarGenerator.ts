
import { flashModelNoSearch } from './gemini';
import type { Job, KeywordAlignment, ResumeEdit } from '../types';
import { PROFILE_ARTIFACT } from '../data/profileArtifact';

export interface GeneratedAssets {
  keywords: KeywordAlignment;
  coverLetter: string;
  resumeTailoring: ResumeEdit[];
}

export const generateJobAssets = async (job: Job): Promise<GeneratedAssets> => {
  const prompt = `
You are an expert technical recruiter and AI agent acting on behalf of Michael Crane, a Senior Product Designer.
Your task is to generate Application Assets for the following Job Description based ONLY on the Candidate Profile provided.

CANDIDATE PROFILE:
${PROFILE_ARTIFACT}

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Description:
${job.jobDescription}

INSTRUCTIONS:
1. KEYWORD ALIGNMENT: Identify high-value keywords from the job description and map them to the candidate's verified experience.
   - exact_match: Terms from the JD explicitly stated in the profile.
   - implicit_match: Terms conceptually supported by the profile but phrased differently. For each, you MUST map the 'jobKeyword' to the 'resumeKeyword' found in the profile.
   - missing: Critical terms from the JD that cannot be supported by the profile.
   DO NOT invent or infer experience. If it's not in the profile, it is "missing".

2. COVER LETTER: Draft a short, punchy, and highly personalized cover letter (max 3-4 paragraphs). Highlight the exact/implicit matches to prove fit. 

3. RESUME TAILORING: Provide 2-3 specific, actionable edits the candidate should make to their resume. Do not give general advice.
   CRITICAL: One of these edits MUST be for the "Summary" section.
   When writing the Summary edit, follow this exact 3-line framework based on whether the role is "Senior" or "Staff" (infer from Job Title):
     Line 1 — Positioning: [Title] with [X years] designing [domain/product type] for [user or business context].
     Line 2 — Proof of scope + impact: [Verb: led/shipped/scaled] [what] that [measurable outcome]. Include one number.
     Line 3 — Differentiator:
       - If Senior role: emphasize shipped outcomes, pixel-perfect execution, and craft.
       - If Staff/Principal role: emphasize ambiguity, 0->1, org-level influence, strategy, cross-functional alignment, and setting direction.
     Do NOT use generic words like: passionate, results-driven, team player, wearing many hats.
   CRITICAL: For other edits, prioritize converting "implicit_match" keywords into exact matches by rewriting the candidate's existing bullet points to include the exact terminology used in the Job Description.
   CRITICAL: NEVER output multiple edits for the same section. Consolidate them into ONE cohesive paragraph or block.
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
    const result = await flashModelNoSearch.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const responseText = result.response.text();
    
    // Extract JSON block in case it's wrapped in markdown
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response.");
    }
    
    const assets = JSON.parse(jsonMatch[0]) as GeneratedAssets;
    return assets;
  } catch (error) {
    console.error("Error generating assets:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate application assets: ${error.message}`);
    }
    throw new Error("Failed to generate application assets.");
  }
};
