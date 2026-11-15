import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/common/Sidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingSpinner text="Checking session authorization..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If not authorized for this portal, redirect to appropriate portal
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'agent') return <Navigate to="/agent" replace />;
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-['Inter',sans-serif]">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
