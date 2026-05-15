import React from 'react';
import { Job } from '../types';

interface JobSidebarProps {
  job: Job | null;
  onClose: () => void;
}

export const JobSidebar: React.FC<JobSidebarProps> = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="w-[500px] border-l border-gray-800 bg-gray-900 overflow-y-auto flex-shrink-0 h-full fixed right-0 top-0 shadow-2xl z-50">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur z-10 border-b border-gray-800 p-6">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            job.fitScore >= 8 ? 'bg-green-500/10 text-green-400' :
            job.fitScore >= 5 ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-gray-500/10 text-gray-400'
          }`}>
            {job.fitScore}/10 — {job.fitTier}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 pr-8">{job.title}</h2>
        <div className="text-lg text-gray-400 mb-6">{job.company}</div>

        <a 
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-center font-semibold rounded-lg transition-colors"
        >
          Apply Now →
        </a>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        
        {/* Fit Explanation */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Fit Rationale</h3>
          <p className="text-gray-300 leading-relaxed text-sm bg-gray-800/50 p-4 rounded-lg border border-gray-800">
            {job.fitExplanation}
          </p>
        </section>

        {/* Keyword Match */}
        {job.keywords && job.keywords.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Resume Keyword Match</h3>
            <div className="space-y-3">
              {job.keywords.map((kw, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5">
                    {kw.inProfile ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <div>
                    <span className={`font-medium ${kw.inProfile ? 'text-gray-200' : 'text-gray-400'}`}>
                      {kw.keyword}
                    </span>
                    <span className="text-gray-500 ml-2 text-xs">({kw.relevance})</span>
                    {kw.note && <p className="text-gray-500 text-xs mt-1">{kw.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full JD */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Job Description</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-400 whitespace-pre-wrap font-sans">
            {job.jobDescription || "No description provided."}
          </div>
        </section>

      </div>
    </div>
  );
};
