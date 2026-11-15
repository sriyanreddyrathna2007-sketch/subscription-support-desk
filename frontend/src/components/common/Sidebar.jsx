import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';
import {
  LayoutDashboard,
  CreditCard,
  LifeBuoy,
  BotMessageSquare,
  Receipt,
  User,
  LogOut,
  Users,
  ShieldAlert,
  BookOpen,
  ArrowRightLeft,
  ChevronRight,
  Headphones,
  ShieldCheck,
  Settings,
  Download
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, role, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickSwitch = async (targetRole) => {
    await loginAsDemo(targetRole);
    if (targetRole === 'admin') navigate('/admin');
    else if (targetRole === 'agent') navigate('/agent');
    else navigate('/app');
  };

  // Customer navigation links
  const customerLinks = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'My Subscription', path: '/app/subscription', icon: CreditCard },
    { name: 'Support Tickets', path: '/app/tickets', icon: LifeBuoy },
    { name: 'AI Assistant', path: '/app/assistant', icon: BotMessageSquare, badge: 'AI' },
    { name: 'Billing History', path: '/app/billing', icon: Receipt },
    { name: 'Profile', path: '/app/profile', icon: User },
  ];

  // Agent navigation links
  const agentLinks = [
    { name: 'Agent Dashboard', path: '/agent', icon: LayoutDashboard },
    { name: 'Ticket Queue', path: '/agent/tickets', icon: LifeBuoy },
    { name: 'Knowledge Base', path: '/agent/kb', icon: BookOpen },
    { name: 'Test AI Assistant', path: '/app/assistant', icon: BotMessageSquare },
    { name: 'Profile', path: '/app/profile', icon: User },
  ];

  // Admin navigation links
  const adminLinks = [
    { name: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Subscription Plans', path: '/admin/plans', icon: CreditCard },
    { name: 'Ticket Management', path: '/agent/tickets', icon: LifeBuoy },
    { name: 'Knowledge Base', path: '/admin/kb', icon: BookOpen },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { name: 'Profile', path: '/app/profile', icon: User },
  ];

  let currentLinks = customerLinks;
  let roleTitle = 'Customer Portal';
  let roleBadgeColor = 'primary';

  if (role === 'admin') {
    currentLinks = adminLinks;
    roleTitle = 'Admin Console';
    roleBadgeColor = 'urgent';
  } else if (role === 'agent') {
    currentLinks = agentLinks;
    roleTitle = 'Agent Workspace';
    roleBadgeColor = 'progress';
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand & Portal Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F172A] leading-tight">SupportDesk AI</div>
            <div className="text-[11px] font-medium text-slate-400">{roleTitle}</div>
          </div>
        </NavLink>
        <Badge size="sm" variant={roleBadgeColor}>
          {role}
        </Badge>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Cross-role quick switchers */}
        <div className="pt-6 px-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
            <span>Switch Role Demo</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200/70">
            <button
              onClick={() => handleQuickSwitch('customer')}
              title="Switch to Customer view"
              className={`text-[11px] py-1 rounded font-medium transition-all ${
                role === 'customer'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => handleQuickSwitch('agent')}
              title="Switch to Agent view"
              className={`text-[11px] py-1 rounded font-medium transition-all ${
                role === 'agent'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Agent
            </button>
            <button
              onClick={() => handleQuickSwitch('admin')}
              title="Switch to Admin view"
              className={`text-[11px] py-1 rounded font-medium transition-all ${
                role === 'admin'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Download Project ZIP directly from web */}
        <div className="pt-3 px-3">
          <a
            href="/api/download-project"
            download="subscription-support-desk.zip"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Project ZIP</span>
          </a>
        </div>
      </nav>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
