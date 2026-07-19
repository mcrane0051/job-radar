import { useState, useEffect } from 'react'
import { ScanButton } from './components/ScanButton'
import { JobFeed } from './components/JobFeed'
import { JobSidebar } from './components/JobSidebar'
import { RadarBackground } from './components/RadarBackground'
import logoTech from './assets/logo-tech.svg'
import type { Job, ScanResult } from './types'
import { SettingsModal } from './components/SettingsModal'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
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
        const response = await fetch(`./jobs.json?t=${new Date().getTime()}`, { cache: 'no-store' });
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
          // Merge local properties into remote jobs
          combinedJobs = combinedJobs.map(remoteJob => {
            const localJob = localJobs.find(j => j.id === remoteJob.id);
            if (localJob) {
              return {
                ...remoteJob,
                status: localJob.status || remoteJob.status,
                coverLetter: localJob.coverLetter || remoteJob.coverLetter,
                resumeTailoring: localJob.resumeTailoring || remoteJob.resumeTailoring,
                keywords: localJob.keywords || remoteJob.keywords
              };
            }
            return remoteJob;
          });

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
        
        <div className="flex items-center" style={{ gap: 'var(--spacing-16)' }}>
          <ScanButton 
            lastScannedAt={lastScannedAt}
          />
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 -mr-2 rounded-full hover:bg-[var(--surface-3)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="API Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

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
            setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j))
            if (selectedJob?.id === updatedJob.id) {
              setSelectedJob(updatedJob)
            }
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </main>
    </RadarBackground>
  )
}

export default App
