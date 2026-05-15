import { useState, useEffect } from 'react';
import { ApplicationStatus } from '../types';

const STORAGE_KEY = 'job-radar-status';

export const useJobStatus = () => {
  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setStatuses(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse job statuses from local storage", e);
      }
    }
  }, []);

  const updateStatus = (jobId: string, status: ApplicationStatus) => {
    setStatuses(prev => {
      const updated = { ...prev, [jobId]: status };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getStatus = (jobId: string): ApplicationStatus => {
    return statuses[jobId] || 'New';
  };

  return { statuses, updateStatus, getStatus };
};
