import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5 font-medium',
    lg: 'text-sm px-3 py-1 font-semibold',
  }[size];

  // Resolve style by explicit variant name or standard status text
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  const text = (typeof children === 'string' ? children : variant).toLowerCase();

  if (text.includes('open') || text.includes('active') || text.includes('published') || text.includes('paid')) {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (text.includes('progress') || text.includes('pending') || text.includes('customer')) {
    colorStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (text.includes('urgent') || text.includes('high') || text.includes('failed') || text.includes('canceled')) {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (text.includes('warning') || text.includes('medium') || text.includes('waiting') || text.includes('past_due')) {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (text.includes('resolved') || text.includes('closed') || text.includes('archived')) {
    colorStyles = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (variant === 'primary') {
    colorStyles = 'bg-blue-100 text-blue-800 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeStyles} ${colorStyles} ${className}`}>
      {children}
    </span>
  );
};
