import { useState, useEffect } from 'react'
import { ScanButton } from './components/ScanButton'
import { JobFeed } from './components/JobFeed'
import { JobSidebar } from './components/JobSidebar'
import { RadarBackground } from './components/RadarBackground'
import logoTech from './assets/logo-tech.svg'
import type { Job, ScanResult } from './types'

function App() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [lastScannedAt, setLastScannedAt] = useState<string | undefined>()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [displayJob, setDisplayJob] = useState<Job | null>(null)

  useEffect(() => {
    if (selectedJob) setDisplayJob(selectedJob)
  }, [selectedJob])

  // Load existing jobs from remote /jobs.json and local storage
  useEffect(() => {
    const loadInitialJobs = async () => {
      let combinedJobs: Job[] = [];
      let latestScanAt: string | undefined = undefined;

      // 1. Fetch remote jobs from GitHub automation
      try {
        const response = await fetch('./jobs.json');
        if (response.ok) {
          const remoteData = await response.json();
          combinedJobs = remoteData.jobs || [];
          latestScanAt = remoteData.scannedAt;
        }
      } catch (e) {
        console.warn("No remote jobs.json found, skipping.");
      }

      // 2. Merge with any local manually scanned jobs
      const stored = localStorage.getItem('job-radar-data')
      if (stored) {
        try {
          const localData: ScanResult = JSON.parse(stored)
          const localJobs = localData.jobs || [];
          const newLocalJobs = localJobs.filter(
            (localJob) => !combinedJobs.some((remoteJob) => remoteJob.id === localJob.id)
          );
          combinedJobs = [...combinedJobs, ...newLocalJobs];

          if (localData.scannedAt && (!latestScanAt || new Date(localData.scannedAt) > new Date(latestScanAt))) {
            latestScanAt = localData.scannedAt;
          }
        } catch (e) {
          console.error("Failed to parse local job data", e);
        }
      }

      // 3. Process the merged list
      const migratedJobs = combinedJobs.map(job => {
        if (job.specialty) return job;
        
        // Try to split on common title separators: ", " or " - "
        const separators = [', ', ' - '];
        for (const sep of separators) {
          const parts = job.title.split(sep);
          if (parts.length > 1) {
            const coreTitle = parts[0].trim();
            const specialty = parts.slice(1).join(sep).trim();
            return {
              ...job,
              title: coreTitle,
              specialty: specialty
            };
          }
        }
        return job;
      });
      
      // Filter out jobs older than 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const cutoffTime = fourteenDaysAgo.getTime();

      const activeJobs = migratedJobs.filter(job => {
        if (!job.scannedAt) return true;
        return new Date(job.scannedAt).getTime() >= cutoffTime;
      });

      setJobs(activeJobs)
      setLastScannedAt(latestScanAt)
    };

    loadInitialJobs();
  }, [])



  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(current => {
      const newJobs = current.map(j => j.id === updatedJob.id ? updatedJob : j);
      localStorage.setItem('job-radar-data', JSON.stringify({
        jobs: newJobs,
        scannedAt: lastScannedAt
      }));
      return newJobs;
    });
  };

  return (
    <RadarBackground>
      <header 
        className="flex justify-between items-center z-10 shrink-0 p-4 sm:p-[var(--spacing-40)_var(--spacing-40)_var(--spacing-24)] border-b border-[var(--color-green-800)]" 
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="flex flex-col justify-center" style={{ gap: 'var(--spacing-8)' }}>
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logoTech}
              alt="Job Radar Logo"
              style={{ height: '32px', width: 'auto' }}
            />
          </div>
          
          {/* Operator Text (Hidden on mobile) */}
          <p
            className="hidden sm:block"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: 'var(--text-secondary)',
            }}
          >
            OPERATOR: MICHAEL CRANE &bull; PRODUCT DESIGNER
          </p>
        </div>
        
        <ScanButton 
          lastScannedAt={lastScannedAt}
        />
      </header>

      {/* Scrollable content area — layout container */}
      <main className="flex-1 min-w-0 flex relative overflow-hidden">
        {/* Scrollable feed area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-[var(--spacing-40)]">
          {/* Active targets count */}
          <div
            style={{
              paddingBottom: 'var(--spacing-8)',
              marginBottom: 'var(--spacing-8)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: 'var(--text-secondary)',
            }}
          >
            ACTIVE TARGETS [{String(jobs.length).padStart(2, '0')}]
          </div>

          <JobFeed 
            jobs={jobs}  
            selectedJob={selectedJob}
            onSelectJob={setSelectedJob}
          />
        </div>

        <JobSidebar 
          job={displayJob} 
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)} 
          onUpdateJob={(updatedJob) => {
            setSelectedJob(updatedJob);
            handleUpdateJob(updatedJob);
          }}
        />
      </main>
    </RadarBackground>
  )
}

export default App
