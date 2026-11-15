import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500 active:bg-blue-800',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-400',
    outline: 'border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 focus:ring-blue-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:ring-amber-400',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};
