import React, { useRef, useState } from 'react';
import type { Job } from '../types';

interface TruncatedTooltipProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  tooltipStyle?: React.CSSProperties;
}

const TruncatedTooltip: React.FC<TruncatedTooltipProps> = ({ text, className, style, tooltipStyle }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const checkTruncation = () => {
    if (textRef.current) {
      const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsTruncated(isOverflowing);
    }
  };

  return (
    <div 
      className="relative min-w-0 flex-shrink"
      onMouseEnter={() => {
        checkTruncation();
        setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        ref={textRef}
        className={className}
        style={style}
      >
        {text}
      </span>
      {isTruncated && (
        <div
          className={`absolute bottom-full left-0 mb-1 z-50 rounded pointer-events-none tooltip-anim ${showTooltip ? 'visible' : ''}`}
          style={tooltipStyle}
        >
          {text}
        </div>
      )}
    </div>
  );
};

interface JobListItemProps {
  job: Job;
  isSelected: boolean;
  onSelect: (job: Job) => void;
}

export const JobListItem: React.FC<JobListItemProps> = ({
  job,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(job)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(job);
        }
      }}
      className={`job-card ${isSelected ? 'active' : ''}`}
    >
      {/* Best Fit Score — left side */}
      <div
        className="flex items-center justify-center flex-shrink-0 relative w-[40px] h-[40px] sm:w-[64px] sm:h-[64px]"
      >
        {/* Circle ring */}
        <svg 
          className="w-full h-full max-w-[40px] sm:max-w-[48px]" 
          viewBox="0 0 48 48" 
          fill="none"
        >
          <circle
            cx="24"
            cy="24"
            r="23"
            stroke="var(--color-green-600)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        {/* Score number */}
        <span
          className="absolute"
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '24px',
            color: 'var(--text-primary)',
          }}
        >
          {job.fitScore}
        </span>
      </div>

      {/* Job Details */}
      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{ gap: 'var(--spacing-8)' }}
      >
        {/* Job header row: title, company, NEW tag, LinkedIn */}
        <div
          className="flex items-start sm:items-center min-w-0 w-full"
          style={{ gap: 'var(--spacing-16)' }}
        >
          {/* Title + Company */}
          <div
            className="flex flex-col items-start sm:flex-row sm:items-baseline min-w-0 shrink gap-1 sm:gap-[var(--spacing-12)]"
          >
            <TruncatedTooltip
              text={job.title}
              className="custom-truncate block"
              style={{
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '28px',
                color: 'var(--text-primary)',
              }}
              tooltipStyle={{
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--color-green-800)',
                color: 'var(--text-primary)',
                padding: 'var(--spacing-8) var(--spacing-12)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                whiteSpace: 'normal',
                width: 'max-content',
                maxWidth: '400px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              }}
            />

            <span
              style={{
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '24px',
                color: 'var(--text-secondary)',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {job.company}
            </span>
          </div>

          {/* Right-aligned tags/icons container on mobile */}
          <div className="flex items-center gap-4 ml-auto sm:ml-0 shrink-0">
            {/* NEW tag */}
            {job.isNew && (
              <span
                style={{
                  backgroundColor: 'var(--color-green-800)',
                  padding: '2px var(--spacing-8)',
                  borderRadius: '2px',
                  fontWeight: 800,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase' as const,
                  flexShrink: 0,
                }}
              >
                NEW
              </span>
            )}
  
            {/* LinkedIn icon */}
            {job.source.toLowerCase().includes('linkedin') && (
              <span
                title="Sourced from LinkedIn"
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-green-800)',
                }}
              >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="var(--text-primary)"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </span>
          )}
          </div>
        </div>

        {/* Location + Industry */}
        <TruncatedTooltip
          text={`${job.location} • ${job.industry}${job.specialty ? ` | ${job.specialty}` : ''}`}
          className="custom-truncate block"
          style={{
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '24px',
            color: 'var(--text-secondary)',
          }}
          tooltipStyle={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--color-green-800)',
            color: 'var(--text-secondary)',
            padding: 'var(--spacing-8) var(--spacing-12)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth: '500px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* Posted date + source */}
        <TruncatedTooltip
          text={`Posted ${new Date(job.postedAt).toLocaleDateString()} via ${job.source}`}
          className="custom-truncate block"
          style={{
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: 'var(--text-tertiary)',
          }}
          tooltipStyle={{
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--color-green-800)',
            color: 'var(--text-tertiary)',
            padding: 'var(--spacing-8) var(--spacing-12)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth: '400px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          }}
        />
      </div>
    </div>
  );
};
