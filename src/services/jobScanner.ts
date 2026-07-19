import { getFlashModel } from './gemini.js';
import type { Job, ScanResult } from '../types';
import { preferences } from '../config/preferences';
import { PROFILE_ARTIFACT } from '../data/profileArtifact';

export const scanJobsStream = async (onJobFound: (job: Job) => void): Promise<ScanResult> => {
  const prompt = `
You are an expert technical recruiter and AI agent acting on behalf of Michael Crane, a Senior Product Designer.
Your task is to scan the live internet for job postings that match a candidate's profile and preferences.

The "FitTier" scale is:
Strong Fit (Typically scores 9-10)
Good Fit (Typically scores 7-8)
Possible (Typically scores 4-6)
Stretch (Typically scores 1-3)

SEARCH PREFERENCES:
- Titles: ${preferences.titles.join(', ')}
- Industries: ${preferences.industries.join(', ')}
- Locations: ${preferences.locations.join(', ')}
- Minimum Company Stage: ${preferences.companyStage}
- EXCLUDE these roles: ${preferences.exclude.join(', ')}
- MUST be posted within the last ${preferences.maxPostingAgeDays} days.

CANDIDATE PROFILE:
${PROFILE_ARTIFACT}

INSTRUCTIONS:
1. Find 10 to 15 highly relevant jobs posted recently. (Do not return roles if they are not a strong fit).
2. Score each job from 1-10 based on how well the candidate's profile aligns with the requirements. 
   - CRITICAL LOCATION RULE: Any Hybrid role MUST be located in Philadelphia, PA, New Jersey, or NYC. If a Hybrid role is outside these areas, ignore it completely.
   - CRITICAL RANKING RULE: The candidate strongly prefers Remote over Hybrid. Deduct 1 to 2 points from the fit score if the role is Hybrid.
3. Extract a detailed summary of the job description, including a bulleted list of the core responsibilities and requirements (DO NOT copy verbatim to avoid recitation blocks, but provide a thorough, structured breakdown).
4. Identify the base website domain of the company (e.g., "apple.com" or "goswift.ly") and output it as companyDomain.
5. Provide the FULL, real application URL starting with https:// for the applyUrl field. 
   - CRITICAL URL RULE: If the job is found on an aggregator site (like ZipRecruiter, Indeed, Glassdoor, etc.) or you are unsure of the exact URL path, output EXACTLY "N/A" for the applyUrl. ONLY provide a URL if it is the direct company career page (e.g., greenhouse.io, lever.co, careers.company.com).
6. Map requirements to candidate keywords.
7. If a job title contains a specialization, department, team, or product area (e.g. "Senior Product Designer, Payment Reconciliation Platform" or "Product Designer - Growth"), split it. Place the clean, core role name (e.g. "Senior Product Designer") in the "title" field, and the specialization/team (e.g. "Payment Reconciliation Platform" or "Growth") in the "specialty" field. If there is no specialization, leave "specialty" blank or omit it.

8. Extract the salary range or compensation if it is posted in the job description (e.g. "$150k - $180k"). If it is not posted, omit the salary field entirely. DO NOT include trailing words like "a year", "per year", or "annually" - just output the raw numbers/ranges.

CRITICAL OUTPUT FORMAT:
You MUST output EXACTLY ONE JSON object per job.
Do NOT output a JSON array starting with [.
Just pure, unformatted text where every job is represented by an independent JSON object.

Example format:
{"id":"1","title":"Designer","company":"Apple","companyDomain":"apple.com","industry":"Tech","location":"Remote","postedAt":"2026-05-15","fitScore":9,"fitTier":"Strong Fit","fitExplanation":"Matches...","source":"LinkedIn","applyUrl":"https://careers.apple.com/job/12345","isOffLinkedIn":false,"jobDescription":"Summary...","specialty":"Growth","salary":"$150k - $180k","keywords":[{"keyword":"Figma","inProfile":true,"relevance":"required","note":"Good"}],"status":"New"}
`;

  const processedJobs: Job[] = [];
  const batchTime = new Date().toISOString();
  
  try {
    const flashModel = getFlashModel();
    const resultStream = await flashModel.generateContentStream(prompt);
    
    let buffer = "";
    let openBraces = 0;
    let currentObjectStr = "";

    for await (const chunk of resultStream.stream) {
      buffer += chunk.text();
      
      // Process character by character to find complete JSON objects, 
      // which gracefully handles both JSONL and pretty-printed JSON.
      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        
        if (char === '{') {
          openBraces++;
        }
        
        if (openBraces > 0) {
          currentObjectStr += char;
        }
        
        if (char === '}') {
          openBraces--;
          if (openBraces === 0) {
            // We have a complete object
            try {
              const job = JSON.parse(currentObjectStr) as Job;
              // Check if it's actually a Job object and not some wrapper
              if (job && job.title && job.company) {
                const processedJob = { 
                  ...job, 
                  id: crypto.randomUUID(), // Force a truly unique ID
                  status: 'New' as const,
                  scannedAt: batchTime
                };
                processedJobs.push(processedJob);
                onJobFound(processedJob);
              }
            } catch (e) {
              console.warn("Failed to parse extracted JSON object:", currentObjectStr);
            }
            currentObjectStr = ""; // Reset for next object
          }
        }
      }
      
      // Clear buffer as everything is either processed or stored in currentObjectStr
      buffer = "";
    }

    return {
      jobs: processedJobs,
      scannedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error scanning jobs:", error);
    throw new Error("Failed to scan for jobs. Please check the console.");
  }
};
