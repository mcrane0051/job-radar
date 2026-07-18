import { scanJobsStream } from '../src/services/jobScanner.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JOBS_FILE = path.join(__dirname, '../public/jobs.json');

async function run() {
  console.log('Starting automated job scan...');
  
  let existingJobs: any[] = [];
  try {
    if (fs.existsSync(JOBS_FILE)) {
      const data = fs.readFileSync(JOBS_FILE, 'utf-8');
      existingJobs = JSON.parse(data).jobs || [];
    }
  } catch (e) {
    console.warn('Could not read existing jobs.json, starting fresh.');
  }

  // Mark all existing jobs as not new
  const activeExistingJobs = existingJobs
    .filter(job => {
      if (!job.scannedAt) return true;
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      return new Date(job.scannedAt).getTime() >= fourteenDaysAgo.getTime();
    })
    .map(job => ({ ...job, isNew: false }));

  const newJobs: any[] = [];
  
  try {
    const result = await scanJobsStream((job) => {
      console.log(`Found job: ${job.title} at ${job.company}`);
      newJobs.push({ ...job, isNew: true });
    });

    const combinedJobs = [...newJobs, ...activeExistingJobs];

    fs.writeFileSync(JOBS_FILE, JSON.stringify({
      jobs: combinedJobs,
      scannedAt: result.scannedAt
    }, null, 2));

    console.log(`\nScan complete! Found ${newJobs.length} new jobs.`);
    console.log(`Total active jobs saved to public/jobs.json: ${combinedJobs.length}`);
  } catch (error) {
    console.error('Error during scan:', error);
    process.exit(1);
  }
}

run();
