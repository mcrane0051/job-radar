import React from 'react';

interface IconButtonProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  children, 
  className = '', 
  as: Component = 'button',
  style,
  ...props 
}) => {
  return (
    <Component
      className={`rounded-full transition-colors hover:bg-black/20 flex items-center justify-center cursor-pointer ${className}`}
      style={{ padding: 'var(--spacing-8)', color: 'var(--text-tertiary)', ...style }}
      {...(Component === 'button' ? { type: props.type || 'button' } : {})}
      {...props}
    >
      {children}
    </Component>
  );
};
