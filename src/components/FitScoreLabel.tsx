import React from 'react';
import type { FitTier } from '../types';

interface FitScoreLabelProps {
  tier: FitTier;
  className?: string;
}

export const FitScoreLabel: React.FC<FitScoreLabelProps> = ({ tier, className = '' }) => {
  const isStretch = tier === 'Stretch';
  const isPossible = tier === 'Possible';
  const isGoodFit = tier === 'Good Fit';
  const isStrongFit = tier === 'Strong Fit';

  const isGoodFitOrPossible = isGoodFit || isPossible;
  
  // Base colors mapping to our CSS variables via Tailwind arbitrary classes
  const bgColorClass = isStretch 
    ? 'bg-[var(--color-red-400)]' 
    : isGoodFitOrPossible 
      ? 'bg-[var(--color-amber-400)]' 
      : 'bg-[var(--color-green-400)]';

  const textColorClass = isStretch 
    ? 'text-[var(--color-red-800)]' 
    : isGoodFitOrPossible 
      ? 'text-[var(--color-amber-800)]' 
      : 'text-[var(--color-green-800)]';

  return (
    <div 
      className={`inline-flex items-start px-[8px] py-[2px] relative rounded-[2px] ${bgColorClass} ${className}`}
    >
      <span 
        className={`font-extrabold leading-normal relative shrink-0 whitespace-nowrap uppercase tracking-wide text-[12px] [font-family:var(--font-mono)] [word-break:break-word] ${textColorClass}`}
      >
        {tier}
      </span>
    </div>
  );
};
