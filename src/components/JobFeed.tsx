import React from 'react';
import type { Job } from '../types';
import { JobListItem } from './JobListItem';

interface JobFeedProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job | null) => void;
}

export const JobFeed: React.FC<JobFeedProps> = ({ jobs, selectedJob, onSelectJob }) => {
  // Sort jobs: Newest batch first, then Fit score descending, then company name A-Z
  const sortedJobs = [...jobs].sort((a, b) => {
    const timeA = a.scannedAt ? new Date(a.scannedAt).getTime() : 0;
    const timeB = b.scannedAt ? new Date(b.scannedAt).getTime() : 0;
    
    if (timeA !== timeB) {
      return timeB - timeA; // Newest batches at the top
    }

    if (b.fitScore !== a.fitScore) {
      return b.fitScore - a.fitScore;
    }
    return a.company.localeCompare(b.company);
  });

  return (
    <div className="flex relative">
      <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedJob ? 'sm:mr-[500px]' : ''}`}>
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 py-20">
            <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg">
              No jobs found. The cloud scanner will run automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 'var(--spacing-8)' }}>
            {sortedJobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onSelect={onSelectJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
