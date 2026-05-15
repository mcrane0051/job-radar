import React from 'react';
import { ApplicationStatus, Job } from '../types';
import { StatusBadge } from './StatusBadge';

interface JobListItemProps {
  job: Job;
  status: ApplicationStatus;
  isSelected: boolean;
  onSelect: (job: Job) => void;
  onStatusChange: (status: ApplicationStatus) => void;
}

export const JobListItem: React.FC<JobListItemProps> = ({
  job,
  status,
  isSelected,
  onSelect,
  onStatusChange
}) => {
  return (
    <div 
      className={`group border-b border-gray-800 p-4 transition-colors hover:bg-gray-800/50 ${isSelected ? 'bg-gray-800/80 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button 
              onClick={() => onSelect(job)}
              className="text-lg font-semibold text-gray-100 hover:text-blue-400 text-left truncate transition-colors"
            >
              {job.title}
            </button>
            {job.isHot && (
              <span className="inline-flex items-center rounded-md bg-red-400/10 px-2 py-0.5 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20">
                HOT
              </span>
            )}
            {job.isOffLinkedIn && (
              <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20">
                Off-LinkedIn
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="font-medium text-gray-300">{job.company}</span>
            <span>&bull;</span>
            <span>{job.location}</span>
            <span>&bull;</span>
            <span className="truncate">{job.industry}</span>
          </div>
          
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Posted {new Date(job.postedAt).toLocaleDateString()} via {job.source}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
              job.fitScore >= 8 ? 'bg-green-500/20 text-green-400' :
              job.fitScore >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {job.fitScore}
            </div>
            <span className="text-sm font-medium text-gray-400 w-20 text-right">
              {job.fitTier}
            </span>
          </div>
          
          <StatusBadge status={status} onChange={onStatusChange} />
        </div>
      </div>
    </div>
  );
};
