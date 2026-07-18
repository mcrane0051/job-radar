import { getProModelWithSearch } from './gemini';
import type { Job } from '../types';
import { PROFILE_ARTIFACT } from '../data/profileArtifact';
import type { RecruiterContact } from './hunter';

export interface OutreachDraft {
  subject: string;
  body: string;
}

export const generateOutreachDraft = async (job: Job, contact: RecruiterContact): Promise<OutreachDraft> => {
  const proModelWithSearch = getProModelWithSearch();
  const prompt = `
You are Michael Crane, a Senior Product Designer.
Your task is to draft a short cold outreach email to a recruiter regarding a specific role you just applied for.

RECRUITER DETAILS:
Name: ${contact.firstName || 'Recruiter'} ${contact.lastName || ''}
Position: ${contact.position || 'Talent Acquisition'}

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}

CANDIDATE PROFILE:
${PROFILE_ARTIFACT}

TONE REFERENCE (Example Email):
"Hi Howard,

I just applied for the Senior Product Designer role this week and didn't want to just be a resume in the pile.
What actually pulled me in was the SEP analysis release. Turning hundreds of massive standards documents into evidence an attorney can cite is the hardest version of a problem I've spent years on: dense expert workflows where the interface has to earn trust, not just display output. Most recently that's been an AI coaching agent in Salesforce, with its reasoning made legible and reviewable, and the data-dense co-sell workflow around it.

No ask here beyond being on your radar. My portfolio is at michaelcrane.design if useful. Congrats on the last six months, the pace looks intense in the best way."

INSTRUCTIONS:
You MUST write the email in the 1st person (as Michael). Do NOT write in the 3rd person.
CRITICAL: Use your Google Search tool to search for recent news, press releases, product updates, or engineering blogs from ${job.company}.
Find a specific, complex problem they are currently solving, a recent feature release, or a major company milestone.
Start your email with a hook referencing this recent public news and connect it directly to a highly relevant achievement or area of expertise from the CANDIDATE PROFILE.
Mimic the confident, concise, high-signal, expert-to-expert tone of the TONE REFERENCE email. Do not be overly formal or desperate.

Structure the email loosely like this:
1. "Hi [Name], I just applied for the ${job.title} role..." (or similar low-friction opening)
2. The Hook: Reference the public news/problem, and connect it to your expertise/impact in the CANDIDATE PROFILE.
3. Link your portfolio: https://www.michaelcrane.design
4. A low-friction closing.

CRITICAL OUTPUT FORMAT:
You MUST output EXACTLY ONE JSON object. Do not output markdown code blocks. Just pure JSON.
Structure:
{
  "subject": "...",
  "body": "..."
}
`;

  try {
    const result = await proModelWithSearch.generateContent(prompt);
    const responseText = result.response.text();
    
    let draft: OutreachDraft;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      draft = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn("Failed to parse strict JSON, falling back to raw text:", responseText);
      draft = {
        subject: `Application for ${job.title}`,
        body: responseText.replace(/```json|```/g, '').trim()
      };
    }
    
    return draft;
  } catch (error: any) {
    console.error("Error generating outreach draft:", error);
    throw new Error(error.message || "Failed to generate outreach email.");
  }
};
