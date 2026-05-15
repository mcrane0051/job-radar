import React from 'react';
import { ApplicationStatus } from '../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  onChange: (newStatus: ApplicationStatus) => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  New: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Saved: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Applied: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Interview: 'bg-green-500/10 text-green-400 border-green-500/20',
  Offer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onChange }) => {
  const statuses: ApplicationStatus[] = ['New', 'Saved', 'Applied', 'Interview', 'Offer', 'Archived'];

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as ApplicationStatus)}
        className={`appearance-none cursor-pointer border rounded-full px-3 py-1 text-xs font-medium outline-none transition-colors ${STATUS_COLORS[status]}`}
      >
        {statuses.map(s => (
          <option key={s} value={s} className="bg-gray-900 text-white">
            {s}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg className="h-3 w-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};
