import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { 
  LifeBuoy, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  Headphones, 
  Menu, 
  X,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleDemoLogin = async (role) => {
    setDemoDropdownOpen(false);
    setMobileMenuOpen(false);
    await loginAsDemo(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'agent') navigate('/agent');
    else navigate('/app');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'agent') return '/agent';
    return '/app';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#0F172A] flex items-center gap-1.5">
                SupportDesk <span className="text-blue-600 font-extrabold">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <a href="/#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="/#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="/#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
          </nav>

          {/* Actions & Demo Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>One-Click Demo</span>
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Accounts
                  </div>
                  <button
                    onClick={() => handleDemoLogin('customer')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-slate-800">Customer View</div>
                      <div className="text-[11px] text-slate-400">customer@demo.com</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoLogin('agent')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Headphones className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-800">Support Agent View</div>
                      <div className="text-[11px] text-slate-400">agent@demo.com</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-semibold text-slate-800">Administrator View</div>
                      <div className="text-[11px] text-slate-400">admin@demo.com</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  icon={LayoutDashboard}
                  onClick={() => navigate(getDashboardLink())}
                >
                  Dashboard
                </Button>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button size="sm" variant="ghost">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="primary">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            Features
          </a>
          <a
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            Pricing
          </a>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">Demo Accounts</div>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleDemoLogin('customer')}>
                Customer
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleDemoLogin('agent')}>
                Agent
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleDemoLogin('admin')}>
                Admin
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button variant="primary" onClick={() => navigate(getDashboardLink())}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
