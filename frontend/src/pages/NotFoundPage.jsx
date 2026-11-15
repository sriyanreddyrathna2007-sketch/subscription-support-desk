import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { LifeBuoy, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-['Inter',sans-serif]">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <LifeBuoy className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight">404</h1>
      <p className="mt-2 text-base font-semibold text-slate-700">Page Not Found</p>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mb-6">
        The link you followed may be broken or the support desk page may have moved.
      </p>
      <Link to="/">
        <Button variant="primary" icon={ArrowLeft}>
          Return Home
        </Button>
      </Link>
    </div>
  );
};
