import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Customer pages
import { CustomerDashboard } from './pages/CustomerDashboard';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { BillingPage } from './pages/BillingPage';
import { TicketsPage } from './pages/TicketsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';

// Agent & Admin pages
import { AgentDashboard } from './pages/AgentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Portal Protected Routes */}
            <Route element={<DashboardLayout allowedRoles={['customer', 'agent', 'admin']} />}>
              <Route path="/app" element={<CustomerDashboard />} />
              <Route path="/app/subscription" element={<SubscriptionPage />} />
              <Route path="/app/billing" element={<BillingPage />} />
              <Route path="/app/tickets" element={<TicketsPage />} />
              <Route path="/app/assistant" element={<AIAssistantPage />} />
              <Route path="/app/profile" element={<ProfilePage />} />
            </Route>

            {/* Support Agent Workspace Protected Routes */}
            <Route element={<DashboardLayout allowedRoles={['agent', 'admin']} />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/tickets" element={<TicketsPage />} />
              <Route path="/agent/kb" element={<AdminDashboard />} />
            </Route>

            {/* Administrator Console Protected Routes */}
            <Route element={<DashboardLayout allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/plans" element={<AdminDashboard />} />
              <Route path="/admin/kb" element={<AdminDashboard />} />
              <Route path="/admin/audit-logs" element={<AdminDashboard />} />
            </Route>

            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
