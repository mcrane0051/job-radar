import { useState, useEffect } from 'react'
import { ScanButton } from './components/ScanButton'
import { JobFeed } from './components/JobFeed'
import { scanJobs } from './services/jobScanner'
import { Job, ScanResult } from './types'

function App() {
  const [isScanning, setIsScanning] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [lastScannedAt, setLastScannedAt] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  // Load existing jobs from local storage
  useEffect(() => {
    const stored = localStorage.getItem('job-radar-data')
    if (stored) {
      try {
        const data: ScanResult = JSON.parse(stored)
        setJobs(data.jobs || [])
        setLastScannedAt(data.scannedAt)
      } catch (e) {
        console.error('Failed to load previous scan data', e)
      }
    }
  }, [])

  const handleScan = async () => {
    setIsScanning(true)
    setError(null)
    
    try {
      const result = await scanJobs()
      
      // Update state
      setJobs(result.jobs)
      setLastScannedAt(result.scannedAt)
      
      // Persist to local storage
      localStorage.setItem('job-radar-data', JSON.stringify(result))
    } catch (err: any) {
      setError(err.message || "Failed to scan for jobs")
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Job Radar
          </h1>
          <p className="text-sm text-gray-500 font-medium">Michael Crane &bull; Senior / Staff Product Designer</p>
        </div>
        
        <ScanButton 
          isScanning={isScanning} 
          onScan={handleScan} 
          lastScannedAt={lastScannedAt} 
        />
      </header>

      <main className="max-w-[1600px] mx-auto">
        {error && (
          <div className="m-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}
        <JobFeed jobs={jobs} />
      </main>
    </div>
  )
}

export default App
