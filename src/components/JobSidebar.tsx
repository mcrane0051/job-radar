import React, { useState, useEffect, useRef } from 'react';
import type { Job } from '../types';
import { generateJobAssets } from '../services/sidebarGenerator';
import { findRecruiterEmails, type RecruiterContact } from '../services/hunter';
import { generateOutreachDraft, type OutreachDraft } from '../services/outreachGenerator';
import { FitScoreLabel } from './FitScoreLabel';
import { Button } from './Button';
import { IconButton } from './IconButton';

const Accordion = ({ title, icon, children, defaultOpen = false }: { title: string, icon?: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div 
      className="flex flex-col rounded-[8px] transition-colors overflow-hidden" 
      style={{ backgroundColor: 'var(--surface-3)' }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
        style={{ padding: 'var(--spacing-8) var(--spacing-16)' }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-h4" style={{ color: 'var(--text-secondary)' }}>{title}</h4>
        </div>
        <IconButton 
          as="div"
          className="transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </IconButton>
      </button>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateRows: isOpen ? '1fr' : '0fr', 
          transition: 'grid-template-rows 0.2s ease-out' 
        }}
      >
        <div className="overflow-hidden">
          <div style={{ padding: '0 var(--spacing-16) var(--spacing-16) var(--spacing-16)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface JobSidebarProps {
  job: Job | null;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateJob?: (job: Job) => void;
}

export const JobSidebar: React.FC<JobSidebarProps> = ({ job, isOpen, onClose, onUpdateJob }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Outreach State
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [outreachData, setOutreachData] = useState<{ contact: RecruiterContact, draft: OutreachDraft } | null>(null);
  const [customDomain, setCustomDomain] = useState<string>('');

  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !sidebarRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (deltaX > 0) { // Only swipe right
      sidebarRef.current.style.transform = `translateX(${deltaX}px)`;
      sidebarRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !sidebarRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    
    // Reset inline styles
    touchStartX.current = null;
    sidebarRef.current.style.transform = '';
    sidebarRef.current.style.transition = '';

    if (deltaX > 100) {
      onClose();
    }
  };

  useEffect(() => {
    if (job) {
      setOutreachData(job.outreachData || null);
      setEmailError(null);
      setCustomDomain('');
    }
  }, [job?.id]);

  if (!job) return null;

  const handleGenerateAssets = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const assets = await generateJobAssets(job);
      if (onUpdateJob) {
        onUpdateJob({
          ...job,
          keywords: assets.keywords,
          coverLetter: assets.coverLetter,
          resumeTailoring: assets.resumeTailoring
        });
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate assets");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailRecruiter = async () => {
    if (job.outreachData) {
      setOutreachData(job.outreachData);
      return;
    }

    setIsEmailing(true);
    setEmailError(null);
    try {
      // 1. Fetch contact from Hunter using custom domain -> AI extracted domain -> raw company name
      const domainToSearch = customDomain || job.companyDomain;
      const contacts = await findRecruiterEmails(job.company, domainToSearch);
      if (contacts.length === 0) {
        throw new Error(`No HR/Recruiter emails found for ${domainToSearch || job.company}. Try providing a custom domain below.`);
      }
      
      const bestContact = contacts[0]; // Take the first matched HR contact

      // 2. Draft the email with Gemini
      const draft = await generateOutreachDraft(job, bestContact);
      
      const newOutreach = { contact: bestContact, draft };
      setOutreachData(newOutreach);
      if (onUpdateJob) {
        onUpdateJob({ ...job, outreachData: newOutreach });
      }
    } catch (e: any) {
      setEmailError(e.message || "Failed to find recruiter or generate draft.");
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div 
      ref={sidebarRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 sm:inset-auto sm:absolute sm:right-0 sm:top-0 overflow-y-auto flex-shrink-0 h-full z-50 transform transition-transform w-full sm:w-[500px] ${
        isOpen 
          ? 'translate-x-0 ease-out duration-150' 
          : 'translate-x-full ease-in duration-150'
      }`}
      style={{ 
        backgroundColor: 'var(--surface-1)', 
        borderLeft: '1px solid var(--color-green-800)',
        scrollbarGutter: 'stable'
      }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-10"
        style={{ 
          backgroundColor: 'var(--surface-1)',
          borderBottom: '1px solid var(--color-green-800)', 
          padding: 'var(--spacing-24)' 
        }}
      >
        <IconButton 
          onClick={onClose}
          className="absolute"
          style={{ top: 'var(--spacing-16)', right: 'var(--spacing-16)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>

        <h3 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-4)', paddingRight: 'var(--spacing-32)' }}>
          {job.title}
          {job.specialty && (
            <span className="text-h4 block mt-1" style={{ color: 'var(--text-secondary)' }}>
              {job.specialty}
            </span>
          )}
        </h3>
        <div className="text-h4" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-24)' }}>
          {job.company} {job.salary ? `• Salary: ${job.salary}` : ''}
        </div>

        <div className="flex" style={{ gap: 'var(--spacing-12)' }}>
          <Button 
            variant="ghost"
            onClick={handleEmailRecruiter}
            disabled={isEmailing}
            className="flex-1"
          >
            {isEmailing ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Drafting...
              </div>
            ) : "Email Recruiter"}
          </Button>
          
          <Button 
            variant="primary"
            href={`https://www.google.com/search?q=${encodeURIComponent(job.title + ' at ' + job.company + ' careers')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            Apply Now →
          </Button>
        </div>
        
        {/* Outreach UI Expansion */}
        {(outreachData || emailError) && (
          <div className="relative rounded border" style={{ marginTop: 'var(--spacing-16)', padding: 'var(--spacing-16)', backgroundColor: 'var(--surface-0)', borderColor: 'var(--color-green-800)', boxShadow: '0 20px 40px var(--surface-0), 0 8px 16px var(--surface-0)' }}>
            <button 
              onClick={() => { setOutreachData(null); setEmailError(null); }}
              className="absolute flex items-center justify-center rounded-full transition-colors hover:bg-green-900"
              style={{ top: 'var(--spacing-8)', right: 'var(--spacing-8)', width: '24px', height: '24px', color: 'var(--text-tertiary)' }}
              title="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {emailError && (
              <div style={{ marginBottom: 'var(--spacing-12)' }}>
                <p className="text-small" style={{ color: 'var(--status-error)', marginBottom: 'var(--spacing-8)' }}>{emailError}</p>
                <div className="flex" style={{ gap: 'var(--spacing-8)' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. redditinc.com" 
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1 rounded text-body focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--color-green-800)', padding: 'var(--spacing-4) var(--spacing-12)', color: 'var(--text-primary)' }}
                  />
                  <button onClick={handleEmailRecruiter} className="rounded text-body font-medium" style={{ padding: 'var(--spacing-4) var(--spacing-12)', backgroundColor: 'var(--color-green-900)', color: 'var(--text-primary)' }}>Retry</button>
                </div>
              </div>
            )}

            {outreachData && (
              <div>
                <div style={{ marginBottom: 'var(--spacing-12)' }}>
                  <div className="text-small uppercase font-bold" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>To:</div>
                  <div className="text-body rounded border" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-1)', padding: 'var(--spacing-8) var(--spacing-12)', borderColor: 'var(--color-green-800)' }}>
                    {outreachData.contact.firstName} {outreachData.contact.lastName} &lt;{outreachData.contact.email}&gt;
                  </div>
                </div>
                <div style={{ marginBottom: 'var(--spacing-16)' }}>
                  <div className="text-small uppercase font-bold" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>Subject:</div>
                  <input 
                    type="text"
                    value={outreachData.draft.subject}
                    onChange={(e) => {
                      const updated = { ...outreachData, draft: { ...outreachData.draft, subject: e.target.value } };
                      setOutreachData(updated);
                      if (onUpdateJob) onUpdateJob({ ...job, outreachData: updated });
                    }}
                    className="w-full text-body rounded border focus:outline-none focus:ring-1 transition-colors"
                    style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-1)', padding: 'var(--spacing-8) var(--spacing-12)', borderColor: 'var(--color-green-800)' }}
                  />
                </div>
                <div style={{ marginBottom: 'var(--spacing-16)' }}>
                  <div className="text-small uppercase font-bold" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>Body:</div>
                  <textarea 
                    value={outreachData.draft.body}
                    onChange={(e) => {
                      const updated = { ...outreachData, draft: { ...outreachData.draft, body: e.target.value } };
                      setOutreachData(updated);
                      if (onUpdateJob) onUpdateJob({ ...job, outreachData: updated });
                    }}
                    rows={12}
                    className="w-full text-body rounded border whitespace-pre-wrap focus:outline-none focus:ring-1 transition-colors resize-y"
                    style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-1)', padding: 'var(--spacing-8) var(--spacing-12)', borderColor: 'var(--color-green-800)' }}
                  />
                </div>
                <a 
                  href={`mailto:${outreachData.contact.email}?subject=${encodeURIComponent(outreachData.draft.subject)}&body=${encodeURIComponent(outreachData.draft.body)}`}
                  className="block w-full text-center font-bold rounded-lg transition-colors text-body"
                  style={{ padding: 'var(--spacing-12) 0', backgroundColor: 'var(--text-primary)', color: 'var(--surface-0)' }}
                >
                  Open in Gmail
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col" style={{ padding: 'var(--spacing-24)', gap: 'var(--spacing-24)' }}>
        
        {/* Fit Explanation */}
        <section>
          <div className="flex items-center" style={{ gap: 'var(--spacing-12)', marginBottom: 'var(--spacing-12)' }}>
            <h4 className="text-h4" style={{ color: 'var(--text-secondary)' }}>Match Reasoning</h4>
            <FitScoreLabel tier={job.fitTier} />
          </div>
          <p className="text-body leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {job.fitExplanation}
          </p>
        </section>

        {/* Full JD Accordion */}
        <Accordion title="Job description">
          <div className="text-body whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {job.jobDescription || "No description provided."}
          </div>
        </Accordion>

        {/* Application Assistant Accordion */}
        <Accordion 
          title="Application assistant"
          icon={
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="0.000103" y="12" width="16.9706" height="16.9706" rx="2.82843" transform="rotate(-45 0.000103 12)" fill="var(--color-green-400)"/>
              <path d="M10.9437 5.74851C11.2532 4.84894 12.5254 4.84894 12.8349 5.74851L14.0059 9.15236C14.1062 9.44361 14.335 9.67244 14.6262 9.77264L18.0301 10.9437C18.9297 11.2532 18.9297 12.5254 18.0301 12.8349L14.6262 14.0059C14.335 14.1062 14.1062 14.335 14.0059 14.6262L12.8349 18.0301C12.5254 18.9297 11.2532 18.9297 10.9437 18.0301L9.77264 14.6262C9.67244 14.335 9.44361 14.1062 9.15236 14.0059L5.74851 12.8349C4.84894 12.5254 4.84894 11.2532 5.74851 10.9437L9.15236 9.77264C9.44361 9.67244 9.67244 9.44361 9.77264 9.15236L10.9437 5.74851Z" fill="var(--color-green-900)"/>
            </svg>
          }
        >
          {error && (
            <div className="rounded-lg text-body border" style={{ marginBottom: 'var(--spacing-16)', padding: 'var(--spacing-12)', backgroundColor: 'var(--surface-0)', borderColor: 'var(--status-error)', color: 'var(--status-error)' }}>
              {error}
            </div>
          )}

          {(!job.keywords || Array.isArray(job.keywords)) ? (
            <button 
              onClick={handleGenerateAssets}
              disabled={isGenerating}
              className="w-full group flex items-start text-left cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 rounded-[8px]" 
              style={{ 
                backgroundColor: 'var(--surface-3)', 
                padding: 'var(--spacing-16) var(--spacing-8)',
                gap: 'var(--spacing-8)',
                boxShadow: 'inset 0px 0px 4px 0px rgba(0,0,0,0.14), -2px 4px 2px rgba(0,0,0,0.14)'
              }}
            >
              <div className="shrink-0 flex items-center justify-center" style={{ width: '40px', height: '40px' }}>
                <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                  <path d="M18.8788 13.3267C19.2095 12.3653 20.5692 12.3653 20.8999 13.3267L22.1514 16.9644C22.2585 17.2757 22.503 17.5202 22.8143 17.6273L26.452 18.8788C27.4133 19.2095 27.4133 20.5692 26.452 20.8999L22.8143 22.1514C22.503 22.2585 22.2585 22.503 22.1514 22.8143L20.8999 26.452C20.5692 27.4133 19.2095 27.4133 18.8788 26.452L17.6273 22.8143C17.5202 22.503 17.2757 22.2585 16.9644 22.1514L13.3267 20.8999C12.3653 20.5692 12.3653 19.2095 13.3267 18.8788L16.9644 17.6273C17.2757 17.5202 17.5202 17.2757 17.6273 16.9644L18.8788 13.3267Z" fill="var(--color-green-500)"/>
                  <path d="M6.85109 4.48877C6.87797 3.71336 7.87024 3.40999 8.32613 4.03781L10.0511 6.41339C10.1987 6.61665 10.4318 6.74056 10.6828 6.74926L13.6169 6.85096C14.3923 6.87784 14.6957 7.87011 14.0679 8.326L11.6923 10.051C11.489 10.1986 11.3651 10.4317 11.3564 10.6827L11.2547 13.6168C11.2278 14.3922 10.2356 14.6956 9.77968 14.0677L8.05466 11.6922C7.90706 11.4889 7.67402 11.365 7.42297 11.3563L4.4889 11.2546C3.71349 11.2277 3.41012 10.2354 4.03794 9.77954L6.41352 8.05453C6.61679 7.90693 6.74069 7.67389 6.7494 7.42283L6.85109 4.48877Z" fill="var(--color-red-400)"/>
                  <path d="M29.744 2.32638C30.1191 1.55678 31.2555 1.69632 31.4333 2.5338L32.106 5.70272C32.1636 5.97387 32.3429 6.20336 32.592 6.32481L35.5041 7.74417C36.2737 8.11928 36.1341 9.2557 35.2966 9.43348L32.1277 10.1062C31.8566 10.1638 31.6271 10.3431 31.5056 10.5922L30.0863 13.5043C29.7112 14.2739 28.5747 14.1343 28.397 13.2968L27.7243 10.1279C27.6667 9.85678 27.4874 9.62729 27.2382 9.50584L24.3262 8.08648C23.5566 7.71137 23.6961 6.57495 24.5336 6.39717L27.7025 5.72445C27.9737 5.66689 28.2032 5.48759 28.3246 5.23842L29.744 2.32638Z" fill="var(--color-green-200)"/>
                </svg>
              </div>
              <div className="flex flex-col justify-center" style={{ gap: 'var(--spacing-4)' }}>
                <p className="text-body font-medium" style={{ color: 'var(--text-secondary)' }}>
                  AI-generated customized cover letter & resume keywords
                </p>
                <div>
                  {isGenerating ? (
                    <div className="flex items-center gap-2 font-medium text-body" style={{ color: 'var(--color-green-400)' }}>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      GENERATING ASSETS...
                    </div>
                  ) : (
                    <span className="text-body font-medium tracking-wide transition-colors duration-200" style={{ color: 'var(--color-green-400)' }}>
                      CREATE ASSETS
                    </span>
                  )}
                </div>
              </div>
            </button>
          ) : (
            <div className="space-y-8">
              {/* Keyword Match */}
              <div>
                <h4 className="text-body uppercase tracking-wide font-bold" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-12)' }}>Resume Keyword Match</h4>
                <div className="flex flex-col" style={{ gap: 'var(--spacing-16)' }}>
                  {job.keywords.exact_match.length > 0 && (
                    <div>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
                        <span className="rounded-full" style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-green-500)' }}></span>
                        <span className="text-small font-bold" style={{ color: 'var(--text-secondary)' }}>Exact matches</span>
                      </div>
                      <div className="flex flex-wrap" style={{ gap: 'var(--spacing-8)', paddingLeft: 'var(--spacing-16)' }}>
                        {job.keywords.exact_match.map((kw, i) => (
                          <span key={i} className="text-small rounded border" style={{ padding: 'var(--spacing-4) var(--spacing-8)', backgroundColor: 'var(--surface-1)', color: 'var(--color-green-400)', borderColor: 'var(--color-green-800)' }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.keywords.missing.length > 0 && (
                    <div>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
                        <span className="rounded-full" style={{ width: '8px', height: '8px', backgroundColor: 'var(--status-error)' }}></span>
                        <span className="text-small font-bold" style={{ color: 'var(--text-secondary)' }}>Missing experience</span>
                      </div>
                      <div className="flex flex-wrap" style={{ gap: 'var(--spacing-8)', paddingLeft: 'var(--spacing-16)' }}>
                        {job.keywords.missing.map((kw, i) => (
                          <span key={i} className="text-small rounded border" style={{ padding: 'var(--spacing-4) var(--spacing-8)', backgroundColor: 'var(--surface-1)', color: 'var(--status-error)', borderColor: 'var(--color-red-800)' }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.keywords.implicit_match.length > 0 && (
                    <div>
                      <div className="flex items-center" style={{ gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
                        <span className="rounded-full" style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-amber-500)' }}></span>
                        <span className="text-small font-bold" style={{ color: 'var(--text-secondary)' }}>Close matches</span>
                      </div>
                      <div className="flex flex-col border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-green-800)' }}>
                        <div className="flex border-b items-center" style={{ borderColor: 'var(--color-green-800)' }}>
                          <div className="flex-1 p-3 text-small" style={{ color: 'var(--color-green-500)' }}>
                            Job keywords
                          </div>
                          <div className="flex-1 p-3 border-l text-small" style={{ borderColor: 'var(--color-green-800)', color: 'var(--text-secondary)' }}>
                            Resume keywords
                          </div>
                        </div>
                        {job.keywords.implicit_match.map((mapping, i) => {
                          if (typeof mapping === 'string') {
                            return (
                              <div key={i} className="flex border-b last:border-b-0 items-start" style={{ borderColor: 'var(--color-green-800)' }}>
                                <div className="flex-1 p-3 text-small" style={{ color: 'var(--color-green-500)' }}>
                                  {mapping}
                                </div>
                                <div className="flex-1 p-3 border-l text-small" style={{ borderColor: 'var(--color-green-800)', color: 'var(--text-secondary)' }}>
                                  —
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={i} className="flex border-b last:border-b-0 items-start" style={{ borderColor: 'var(--color-green-800)' }}>
                              <div className="flex-1 p-3 text-small" style={{ color: 'var(--color-green-500)' }}>
                                {mapping.jobKeyword}
                              </div>
                              <div className="flex-1 p-3 border-l text-small" style={{ borderColor: 'var(--color-green-800)', color: 'var(--text-secondary)' }}>
                                {mapping.resumeKeyword}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Tailoring */}
              {job.resumeTailoring && Array.isArray(job.resumeTailoring) && job.resumeTailoring.length > 0 && (
                <div>
                  <h4 className="text-body uppercase tracking-wide font-bold" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-8)' }}>Resume Tailoring</h4>
                  <div className="flex flex-col" style={{ gap: 'var(--spacing-12)' }}>
                    {job.resumeTailoring.map((suggestion, i) => (
                      <div key={i} className="flex flex-col rounded-lg border" style={{ backgroundColor: 'var(--surface-0)', borderColor: 'var(--color-green-800)', padding: 'var(--spacing-16)', gap: 'var(--spacing-8)' }}>
                        <h5 className="text-small font-bold" style={{ color: 'var(--color-green-400)' }}>{suggestion.section}</h5>
                        <div className="text-body font-medium whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                          "{suggestion.edit}"
                        </div>
                        <div className="text-small leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="font-bold">Why:</span> {suggestion.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {job.coverLetter && (
                <div>
                  <h4 className="text-body uppercase tracking-wide font-bold" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-8)' }}>Cover Letter Draft</h4>
                  <div className="relative text-body leading-relaxed rounded-lg border whitespace-pre-wrap" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-0)', padding: 'var(--spacing-16)', borderColor: 'var(--color-green-800)' }}>
                    <div className="absolute" style={{ top: 'var(--spacing-8)', right: 'var(--spacing-8)' }}>
                      <div className="relative flex flex-col items-center">
                        {copied && (
                          <div className="absolute bottom-full mb-1 text-small font-bold tracking-wide" style={{ color: 'var(--color-green-400)' }}>
                            COPIED
                          </div>
                        )}
                        <IconButton 
                          onClick={() => {
                            navigator.clipboard.writeText(job.coverLetter!);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 3000);
                          }}
                          title="Copy to clipboard"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </IconButton>
                      </div>
                    </div>
                    <div style={{ paddingRight: 'var(--spacing-32)' }}>
                      {job.coverLetter}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Accordion>

      </div>
    </div>
  );
};
