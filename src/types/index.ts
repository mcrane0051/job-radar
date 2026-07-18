export type FitTier = 'Strong Fit' | 'Good Fit' | 'Possible' | 'Stretch';
export type ApplicationStatus = 'New' | 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Archived';

export interface KeywordAlignment {
  exact_match: string[];
  implicit_match: Array<string | {
    jobKeyword: string;
    resumeKeyword: string;
  }>;
  missing: string[];
}

export interface ResumeEdit {
  section: string;
  edit: string;
  reason: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyDomain?: string;
  industry: string;
  location: string;
  postedAt: string;
  fitScore: number;
  fitTier: FitTier;
  fitExplanation: string;
  source: string;
  applyUrl: string;
  isOffLinkedIn: boolean;
  jobDescription: string;
  specialty?: string;
  salary?: string;
  scannedAt?: string;
  keywords?: KeywordAlignment;
  coverLetter?: string;
  resumeTailoring?: ResumeEdit[];
  outreachData?: { contact: any; draft: any };
  isNew?: boolean;
}

export interface ScanResult {
  jobs: Job[];
  scannedAt: string;
}
