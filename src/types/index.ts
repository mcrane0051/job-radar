export type FitTier = 'Best Fit' | 'Strong Fit' | 'Good Fit' | 'Possible' | 'Stretch';
export type ApplicationStatus = 'New' | 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Archived';

export interface KeywordMatch {
  keyword: string;
  inProfile: boolean;
  relevance: 'required' | 'preferred';
  note?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  postedAt: string;
  fitScore: number;
  fitTier: FitTier;
  fitExplanation: string;
  source: string;
  applyUrl: string;
  isHot: boolean;
  isOffLinkedIn: boolean;
  jobDescription: string;
}

export interface ScanResult {
  jobs: Job[];
  scannedAt: string;
}
