import { scanJobsStream } from '../src/services/jobScanner.js';
import * as fs from 'fs';
import * as path from 'path';

// This script is meant to be run via `npx tsx scripts/runScanner.ts` in a Node environment (like GitHub Actions).

async function main() {
  console.log("Starting automated job scan...");
  
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const jobsFile = path.join(publicDir, 'jobs.json');
  
  // Read existing jobs to prevent duplicates (optional, but good for keeping history)
  let existingJobs: any[] = [];
  if (fs.existsSync(jobsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(jobsFile, 'utf-8'));
      existingJobs = data.jobs || [];
    } catch (e) {
      console.error("Failed to parse existing jobs.json. Starting fresh.");
    }
  }

  // Filter out jobs older than 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const cutoffTime = fourteenDaysAgo.getTime();

  const activeExistingJobs = existingJobs.filter(job => {
    if (!job.scannedAt) return true;
    return new Date(job.scannedAt).getTime() >= cutoffTime;
  }).map(job => ({ ...job, isNew: false }));
  
  let latestJobs = [...activeExistingJobs];

  try {
    const result = await scanJobsStream((newJob) => {
      console.log(`Found job: ${newJob.title} at ${newJob.company}`);
      // Only add if not a duplicate
      if (!latestJobs.some(j => j.id === newJob.id)) {
        latestJobs = [{ ...newJob, isNew: true }, ...latestJobs];
      }
    });

    const outputData = {
      jobs: latestJobs,
      scannedAt: result.scannedAt
    };

    fs.writeFileSync(jobsFile, JSON.stringify(outputData, null, 2));
    console.log(`\nScan complete! Saved ${latestJobs.length} jobs to public/jobs.json.`);
    
  } catch (error) {
    console.error("Scan failed:", error);
    process.exit(1);
  }
}

main();
