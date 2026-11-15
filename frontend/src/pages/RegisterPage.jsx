import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { LifeBuoy, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning('Please complete all registration fields.');
      return;
    }
    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(name, email, password);
      toast.success(`Welcome to SupportDesk AI, ${newUser.name}!`);
      navigate('/app');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.');
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
          Create customer account
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/90 rounded-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              New accounts are automatically provisioned with a <strong>Basic Plan</strong> and instant AI assistant capabilities.
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Complete Registration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
