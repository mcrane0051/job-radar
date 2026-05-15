import { flashModel, flashModelNoSearch, proModel } from './gemini';
import { Job, KeywordMatch, ScanResult } from '../types';
import { preferences } from '../config/preferences';
import { PROFILE_ARTIFACT } from '../data/profileArtifact';
import { RESUME } from '../data/resume';

export const scanJobs = async (): Promise<ScanResult> => {
  const prompt = `
You are an expert technical recruiter and AI agent acting on behalf of Michael Crane, a Senior Product Designer.
Your task is to search the web for recent job postings that match his search preferences, evaluate them against his profile, and return a highly structured JSON array of matching jobs.

SEARCH PREFERENCES:
- Titles: ${preferences.titles.join(', ')}
- Industries: ${preferences.industries.join(', ')}
- Locations: ${preferences.locations.join(', ')}
- Minimum Company Stage: ${preferences.companyStage}
- EXCLUDE these roles: ${preferences.exclude.join(', ')}
- MUST be posted within the last ${preferences.maxPostingAgeDays} days.

CANDIDATE PROFILE (The Only Source of Truth):
${PROFILE_ARTIFACT}

INSTRUCTIONS:
1. Search across job boards (Wellfound, We Work Remotely, Remotive, LinkedIn, Dribbble) and direct career pages.
2. Find 5 to 10 highly relevant jobs posted recently.
3. Score each job from 1-10 based on how well the candidate's profile aligns with the required qualifications and the Fit Alignment Notes.
4. IMPORTANT SCORING RULES:
   - The candidate profile is the ONLY source of truth. Do not infer or assume skills not explicitly stated.
   - If required qualifications cannot be confidently determined, lower the score and reflect uncertainty in the explanation. Do not round up on ambiguity.
5. Determine if it is "isHot" (posted within ${preferences.hotThresholdHours} hours).
6. Determine if it is "isOffLinkedIn" (found on a site other than LinkedIn).
7. Extract the full job description.
8. Map the requirements in the job description to the candidate's profile to generate keyword matches.

Return a JSON array of objects with the EXACT following structure, and nothing else (no markdown fences, just the raw JSON):
[
  {
    "id": "unique-string-id",
    "title": "Role Title",
    "company": "Company Name",
    "industry": "Industry",
    "location": "Location",
    "postedAt": "ISO Date String",
    "fitScore": 8,
    "fitTier": "Strong Fit", // "Best Fit" | "Strong Fit" | "Good Fit" | "Possible" | "Stretch"
    "fitExplanation": "Detailed explanation of why this score was given, explicitly noting missing qualifications.",
    "source": "Job Board Name",
    "applyUrl": "https://url-to-apply.com",
    "isHot": true,
    "isOffLinkedIn": true,
    "jobDescription": "Full text of the job description...",
    "keywords": [
      {
        "keyword": "Figma",
        "inProfile": true,
        "relevance": "required", // "required" or "preferred"
        "note": "Mentioned extensively in profile"
      }
    ],
    "status": "New"
  }
]
`;

  try {
    const result = await flashModel.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up markdown formatting if Gemini added it despite instructions
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const jobs: Job[] = JSON.parse(text);
    
    // Ensure all jobs have the 'New' status initially
    const processedJobs = jobs.map(job => ({ ...job, status: 'New' as const }));

    return {
      jobs: processedJobs,
      scannedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error scanning jobs:", error);
    throw new Error("Failed to scan for jobs. Check the console for details.");
  }
};
