import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  padding = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-xl shadow-sm transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''
      } ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-xl text-sm">
          {footer}
        </div>
      )}
    </div>
  );
};
