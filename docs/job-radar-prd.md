# Job Radar — Product Requirements Document

**Version:** 0.1 — Initial draft
**Date:** May 2026
**Status:** Draft — ready for Cursor

---

## 1. Problem

Job seekers applying through traditional job boards face two compounding problems:

- By the time a posting surfaces in their feed, it already has hundreds of applicants. Recruiters rarely read past the first 20-30. Being application #200 is effectively invisible.
- Candidates apply broadly and indiscriminately, often to roles they are underqualified for. This wastes time on both sides and produces zero interviews.

The result is months of effort with no traction — not because the candidate is unqualified, but because the system is not working for them.

---

## 2. Goal

Give job seekers a personalized feed of roles they are actually qualified for, surfaced as early as possible after posting, so they can apply in the first wave of candidates rather than the hundredth.

---

## 3. Users

### Primary User
Active job seekers at any experience level, from entry level to staff. They may have strong experience or just be starting out, but share the same struggle: too much noise, too little signal, and no clear way to know which roles are actually worth applying to.

### Secondary Users (v2+)
- Any professional job seeker who wants a curated, fit-ranked feed instead of a firehose
- Career coaches who want to use the tool with clients

---

## 4. Core Experience

### 4.1 Personalized Job Feed

The primary view is a feed of job postings ranked by fit score. Each job listing shows:

- Role title and company
- Industry and location (remote / hybrid city)
- Time since posting — recency is critical
- Fit score and fit tier label (see section 5)
- Source (job board or direct career page)
- Off-LinkedIn flag for roles found outside LinkedIn

The header of the feed must clearly display:
- **Last Scan:** [Date / Time]
- **Next Scheduled Scan:** [Date / Time] (based on the 7am/3pm EST schedule)

Clicking a job listing opens a **Job Detail Sidebar** (see section 4.3) — a panel that slides in from the right without leaving the feed.

### 4.2 Fit Ranking

Every job in the feed is scored 1-10 by an AI agent based on the candidate's profile. Fit tier labels are displayed on each job listing:

| Score | Label |
|-------|-------|
| 9-10 | Best Fit |
| 7-8 | Strong Fit |
| 5-6 | Good Fit |
| 3-4 | Possible |
| 1-2 | Stretch |

**Sort order:**
1. Fit score — highest first
2. Tiebreaker — company name A–Z

> **Scoring rule:** If required qualifications or candidate alignment cannot be confidently determined, lower the score and reflect uncertainty in the reasoning. Do not round up on ambiguity.

### 4.3 Job Detail Sidebar

The sidebar provides full depth without leaving the feed. It contains:

- Role highlights and full job description
- Direct link to apply
- Fit reasoning (explaining the score)
- Resume keyword alignment (showing how the candidate’s experience maps to the job)

#### Resume keyword alignment

The agent identifies and maps relevant keywords from the job description to the candidate’s actual experience. This analysis runs **on-demand** when the user opens the Job Detail Sidebar to conserve API quota and maintain fast feed load times.

This is a two-step process:

**Keyword extraction**
- Extract required and preferred skills, tools, and domain terms from the job description
- Prioritize keywords based on frequency, placement, and relevance to core responsibilities

**Keyword mapping**
Map each keyword to the candidate profile and classify as:
- **Exact match** — clearly present in the candidate’s experience (includes direct synonyms and widely accepted acronyms, e.g., "UX Design" = "User Experience Design")
- **Implicit match** — supported by experience but not explicitly stated
- **Missing** — not present in the candidate profile

**Constraints:**
- Do not introduce new skills, tools, or experience not explicitly present in the candidate profile
- Do not infer qualifications beyond what is supported by the profile
- Missing qualifications must be explicitly identified, not compensated for

**Output:**
- Keywords grouped by classification (Exact, Implicit, Missing)
- Implicit matches are highlighted as opportunities to strengthen resume wording
- Missing items are surfaced for awareness only, not as suggestions to fabricate

### 4.4 Agentic Application Tools

For each job post, the agent provides on-demand application assistance:

- **Resume keyword suggestions** — highlights keywords from the JD that should appear in the resume, mapped to the candidate's actual experience
- **Resume tailoring** — rewrites or adjusts relevant resume bullets to better match the JD, staying truthful to the candidate's background
- **Cover letter generation** — drafts a targeted cover letter using the candidate profile, the JD, and company context
- **Automated Follow-up Email** — when a job is marked as `Applied`, the user can input the company domain. The app uses Hunter.io (free tier) to find the recruiter's email and uses Gemini to draft a highly personalized cold outreach email. It provides a "Send via Gmail" button (using a `mailto:` link) that instantly opens the user's Gmail compose window pre-filled with the recruiter's email, subject, and drafted text.

> **Resume tailoring rules — Do not:**
> - Add technologies, tools, or skills not present in the profile
> - Inflate metrics or outcomes
> - Rewrite bullets in a way that changes the underlying claim
>
> **Do:** If a required qualification is missing, explicitly call it out rather than compensating for it.

All outputs are editable inline before download or copy.

### 4.5 Application Status Tracking

Each job listing has a status the user can update:

`New` → `Saved` → `Applied` → `Interview` → `Offer` → `Archived`

This gives the user a lightweight pipeline view without needing a separate tracker.

---

## 5. Candidate Profile

The quality of fit scoring and application assistance depends entirely on how well the agent knows the candidate. The profile is built from multiple inputs.

> **Ground rule:** The candidate profile (resume + artifact) is the only source of truth.
> Do not infer, assume, or invent skills, tools, or experiences not explicitly stated.

### 5.1 Profile Inputs

- **Resume** (PDF upload or paste) — parsed for titles, skills, companies, tenure, and impact metrics
- **LinkedIn profile URL** — scraped for current role, tenure, and additional context
- **Profile artifact** — a structured document the candidate writes (or generates with Gemini) describing their background in their own words (see 5.2)
- **Onboarding preferences** — role titles, industries, locations, salary range, company size, work arrangement

### 5.2 Profile Artifact

The profile artifact is a plain text or markdown document that acts as the agent's ground truth for who this person is. It is more nuanced than a resume. Recommended contents:

- Summary of experience and domain expertise
- Specific skills, tools, and methodologies
- Types of work the candidate does best (0-to-1 vs. scaling, IC vs. lead, systems vs. execution)
- Industries where they have deep context
- Role levels they are targeting and rationale
- What they are explicitly not looking for
- Notable outcomes and impact metrics
- Soft context: team culture preferences, company stage, management style

> **For the first user (Mike):** Gemini has already generated a profile artifact based on conversation history. It covers 10 years of design experience, 4 years at Tackle.io in a senior/lead capacity across B2B SaaS, complex data dashboards, marketplace seller workflows, and enterprise product design — with key outcomes including a 77% deal size increase and onboarding 500 enterprise sellers self-serve. This artifact ships with the app as the seed profile.

### 5.3 Profile Management

- The candidate can edit the profile artifact at any time
- The agent re-scores all saved jobs when the profile is updated
- Profile completeness is surfaced as a progress indicator — the more complete the profile, the more accurate the fit scores

---

## 6. Job Discovery

### 6.1 Sources

The agent searches across:

- Wellfound
- We Work Remotely
- Remotive
- Dribbble Jobs
- LinkedIn Jobs
- Direct company career pages via Greenhouse, Lever, and Workable boards
- General web search for roles not listed on aggregators

### 6.2 Recency Rules

- Only surface jobs posted in the last 7 days
- Flag jobs posted in the last 48 hours as **HOT**
- Flag any job found outside LinkedIn as **Off-LinkedIn** — these have lower applicant volume and are treated as high priority

### 6.3 Search Criteria (Configurable Per User)

- Role titles (multi-select)
- Industries
- Location (remote / hybrid with city list)
- Company size and stage (optional)
- Salary range (optional)

---

## 7. Automated Scanning & Always-On Feed (v1)

Instead of requiring the user to click a "Scan" button and wait, the app maintains an always-on feed using a $0 backend-less architecture:

- **Scheduled Scrapes:** A free GitHub Actions workflow runs 2 times a day (7am EST and 3pm EST), scraping target job boards and running the Gemini API to search for new roles.
- **Data Sync:** The action filters, deduplicates the findings, and saves the results to a free lightweight database (like Supabase's free tier) or simply updates a JSON file in the repository.
- **Instant Load:** When the user opens the React app, it immediately loads the pre-scanned results so the latest matches are instantly available without waiting for an active scan.

---

## 8. Multi-User Support (v2)

The app is initially built for a single user. When opened to other job seekers:

### 8.1 Onboarding Flow

New users go through a guided setup:

1. Paste or upload resume
2. Enter LinkedIn profile URL
3. Answer 5-7 onboarding questions to seed the profile artifact (role level, industry experience, location, what they are looking for, what they are not)
4. Gemini generates a profile artifact from their inputs, which the user can review and edit
5. Set job preferences (titles, industries, location, salary)

### 8.2 Profile Storage

**v1 (personal use):** All profile data — resume text, profile artifact, and preferences — is stored in `localStorage` in the browser. No backend or account required. The agent loads the full profile from localStorage on every scan and application assist request. Limitation: storage is tied to a single browser on a single machine.

**v2 (multi-user):** Profile data moves to a backend database associated with a user account. This allows the profile to persist across devices and sessions. Recommended stack: Supabase for storage and auth, or Clerk for authentication paired with a lightweight database. Migration path from v1 is straightforward — export localStorage data and write it to the user's account on first login.

### 8.3 Privacy

- Resumes and profile artifacts are private by default
- No user data is used to train shared models
- Users can delete their profile and all associated data at any time

---

## 9. Technical Architecture

### 9.1 Stack

- **Frontend:** React (Vite)
- **AI layer:** Google AI Studio (Gemini) — Flash for job scan, Pro for resume tailoring/cover letter
- **Storage:** Local state for v1; user accounts + database for v2
- **API key:** Gemini API key via environment variable (`.env`) — never committed to source

### 9.2 Key API Patterns

- Job scan: single Gemini call with web search tool (or Flash model with Google Search grounding), returns structured JSON of ranked jobs
- Fit scoring: included in the scan prompt using the candidate profile as context
- Application Assets (Sidebar): The Keyword Alignment, Resume Tailoring suggestions, and Cover Letter are batched into a **single Gemini call** when the sidebar opens to conserve the 20 RPD free tier limit.
- All prompts are structured to return clean JSON — no markdown fences, no preamble

### 9.3 Environment Setup

```
VITE_GEMINI_API_KEY=AIzaSy...
```

Uses the `@google/generative-ai` SDK.

> For v1 personal use, direct browser calls are acceptable since the app is run locally. For any shared/public version, proxy through a backend so the API key is never exposed client-side.

---

## 10. Out of Scope (v1)

- Native mobile app
- Browser extension
- ATS integrations
- Automated job application submission
- Salary negotiation tools
- Interview prep (could be a natural v2 addition)

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Time from posting to user visibility | Under 24 hours |
| % of applied jobs where user was in first 50 applicants | >60% |
| Interview rate from Job Radar applications vs. baseline | 2x improvement |
| Profile completeness at first scan | >70% of fields filled |
| User-reported fit score accuracy | >80% "agree" or "strongly agree" |

---

## 12. Open Questions

- Should fit scores be explainable in more detail (e.g., a breakdown by dimension: title match, industry match, domain match)?
- What is the right cadence for re-scoring saved jobs as the profile evolves?
- For v2 multi-user: should users be able to see anonymized data on how competitive a role is (e.g., "estimated 40 applicants so far")?
- Is there value in a "reach" section — roles slightly above the candidate's current level that are worth a stretch application?
