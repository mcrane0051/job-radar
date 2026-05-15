import React, { useState } from 'react';
import { Job } from '../types';
import { JobListItem } from './JobListItem';
import { JobSidebar } from './JobSidebar';
import { useJobStatus } from '../hooks/useJobStatus';

interface JobFeedProps {
  jobs: Job[];
}

export const JobFeed: React.FC<JobFeedProps> = ({ jobs }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { getStatus, updateStatus } = useJobStatus();

  // Sort jobs: Fit score descending, then company name A-Z
  const sortedJobs = [...jobs].sort((a, b) => {
    if (b.fitScore !== a.fitScore) {
      return b.fitScore - a.fitScore;
    }
    return a.company.localeCompare(b.company);
  });

  return (
    <div className="flex h-full relative">
      <div className={`flex-1 transition-all duration-300 ${selectedJob ? 'mr-[500px]' : ''}`}>
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 py-20">
            <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg">No jobs found. Scan to find matching roles.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {sortedJobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                status={getStatus(job.id)}
                isSelected={selectedJob?.id === job.id}
                onSelect={setSelectedJob}
                onStatusChange={(newStatus) => updateStatus(job.id, newStatus)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <JobSidebar 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
};
