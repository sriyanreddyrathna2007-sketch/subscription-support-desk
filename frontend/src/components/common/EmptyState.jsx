import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is nothing to display here yet.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
