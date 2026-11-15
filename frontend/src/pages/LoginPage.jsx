import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { LifeBuoy, Mail, Lock, UserCheck, Headphones, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login, loginAsDemo } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (userRole) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'agent') navigate('/agent');
    else navigate('/app');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      redirectByRole(loggedUser.role);
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleName) => {
    setLoading(true);
    try {
      const loggedUser = await loginAsDemo(roleName);
      toast.success(`Logged in as ${loggedUser.name} (${loggedUser.role})`);
      redirectByRole(loggedUser.role);
    } catch (err) {
      toast.error('Failed to log in with demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">
            SupportDesk <span className="text-blue-600">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            register a new customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/90 rounded-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Instant Demo Login
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 transition-all text-center"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold">Customer</span>
                <span className="text-[9px] text-slate-400">Alex Mercer</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('agent')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-blue-800 transition-all text-center"
              >
                <Headphones className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-[11px] font-bold">Support Agent</span>
                <span className="text-[9px] text-slate-400">Sarah Jenkins</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 text-purple-800 transition-all text-center"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 mb-1" />
                <span className="text-[11px] font-bold">Administrator</span>
                <span className="text-[9px] text-slate-400">Marcus Vance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
