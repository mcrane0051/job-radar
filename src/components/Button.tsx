import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', children, fullWidth = false, className = '', disabled, href, target, rel, ...props }, ref) => {
    
    // Base classes for the outer container
    const baseOuter = `group relative inline-flex flex-col items-stretch p-[1px] rounded-[8px] transition-all duration-200 ${
      fullWidth ? 'w-full' : ''
    } ${
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
    }`;

    // Variant-specific outer classes
    const outerClasses = variant === 'primary' 
      ? 'bg-[var(--color-green-900)]' 
      : 'bg-transparent border border-[var(--color-green-500)] hover:border-[var(--color-green-300)] active:border-[var(--color-green-700)]';

    // Base classes for the inner rubber-dome container
    const baseInner = `relative flex flex-1 items-center justify-center min-h-[42px] px-[var(--spacing-16)] rounded-[6px] transition-all duration-200`;

    // Variant-specific inner classes
    const innerClasses = variant === 'primary'
      ? `bg-gradient-to-r from-[var(--color-green-800)] to-[var(--color-green-900)] hover:from-[#2b5945] hover:to-[#173326] active:from-[#0d1f17] active:to-[#1a382b]`
      : 'bg-transparent';

    // Inner shadow for primary variant
    const innerShadow = variant === 'primary' 
      ? 'shadow-[inset_1px_1px_2px_0px_rgba(151,212,184,0.125)]' 
      : '';

    // Text classes
    const textClasses = `font-bold uppercase tracking-wide whitespace-nowrap text-body z-10 transition-colors duration-200 ${
      variant === 'primary' 
        ? 'text-[var(--text-primary)]' 
        : 'text-[var(--color-green-500)] group-hover:text-[var(--color-green-300)] group-active:text-[var(--color-green-700)]'
    }`;

    const content = (
      <div className={`${baseInner} ${innerClasses} ${innerShadow}`}>
        <span className={textClasses} style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
          {children}
        </span>
      </div>
    );

    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={`${baseOuter} ${outerClasses} ${className}`}
          style={{ textDecoration: 'none' }}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseOuter} ${outerClasses} ${className}`}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
