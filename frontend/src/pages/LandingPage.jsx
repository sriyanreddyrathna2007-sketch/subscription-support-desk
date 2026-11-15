import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CreditCard,
  LifeBuoy,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  Headphones,
  UserCheck
} from 'lucide-react';

export const LandingPage = () => {
  const { loginAsDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly

  const handleDemoAccess = async (role) => {
    await loginAsDemo(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'agent') navigate('/agent');
    else navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Next-Generation Subscription Support Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight max-w-4xl mx-auto leading-tight">
            Subscription Support, <br className="hidden sm:inline" />
            <span className="text-[#2563EB]">Simplified with AI</span>.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Help customers manage billing, resolve failed payments, and self-serve instantly with our AI assistant grounded in your support policies. Powered by intelligent ticketing and multi-role dashboards.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="primary" icon={ArrowRight}>
                Get Started
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-12 p-4 max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Experience Real-Time User Roles (One-Click Instant Login)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleDemoAccess('customer')}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold transition-all"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Customer Portal</span>
              </button>
              <button
                onClick={() => handleDemoAccess('agent')}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 text-xs font-semibold transition-all"
              >
                <Headphones className="w-4 h-4 text-blue-600" />
                <span>Support Agent Desk</span>
              </button>
              <button
                onClick={() => handleDemoAccess('admin')}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-800 text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Administrator Console</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Preview Section */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              AI-Powered Resolution
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
              Instant, verified answers without human wait times
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              Trained on company documentation, our chatbot resolves 70% of subscription inquiries on the spot.
            </p>
          </div>

          {/* Interactive Chatbot Mockup */}
          <div className="max-w-3xl mx-auto bg-slate-50 rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">SupportDesk AI Copilot</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Online &bull; Grounded in Support KB</div>
                </div>
              </div>
              <Badge variant="warning" size="sm">Demo Assistant</Badge>
            </div>

            <div className="p-6 space-y-4">
              {/* User question bubble */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs max-w-md shadow-xs">
                  Why was my card declined when renewing my Pro plan?
                </div>
              </div>

              {/* Bot response bubble */}
              <div className="flex justify-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs max-w-lg leading-relaxed shadow-xs">
                  <p className="font-semibold text-slate-900 mb-1">Common causes for renewal declines:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Card expiration or incorrect billing address zip code</li>
                    <li>Bank security blocking automated SaaS transactions</li>
                    <li>3D-Secure two-factor authorization timeout</li>
                  </ul>
                  <p className="mt-2 text-slate-600">
                    You can update your card in the <strong>My Subscription</strong> tab anytime to re-attempt processing without service loss.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Source: Troubleshooting Failed Payments</span>
                    <span className="text-blue-600 font-semibold cursor-pointer">Open Ticket &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Platform Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
              Everything you need to deliver world-class subscription care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Subscription & Billing Portal</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Allow customers to view plan statuses, upgrade or downgrade tiers, review itemized billing histories, and manage renewals seamlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Knowledge-Grounded AI Chat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                An intelligent assistant strictly constrained by approved documentation. It never hallucinates policies and auto-suggests ticket creation when needed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Agent Copilot & Queues</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empower support staff with 1-click AI ticket summaries, auto-drafted customer replies they can review, and priority SLA queues.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Role-Based Security (RBAC)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Strict separation between Customers, Support Agents, and Administrators. Ownership checks ensure customers only see their own tickets.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Admin Resource Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manage user accounts, assign support agent roles, publish knowledge-base articles, adjust subscription plans, and inspect audit logs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Real-Time Audit Trail</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Immutable activity logging captures all subscription changes, ticket message dispatches, role promotions, and cancellations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Workflow</h2>
            <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">How SupportDesk AI Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl mb-4 shadow-md">
                1
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Instant Self-Service AI</h3>
              <p className="text-sm text-slate-500">
                Customers ask questions regarding failed payments, invoices, or upgrades. The AI delivers verified step-by-step guidance.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl mb-4 shadow-md">
                2
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Automated Ticket Escalation</h3>
              <p className="text-sm text-slate-500">
                If an issue requires human attention, the chatbot drafts a ticket pre-filled with context, category, and suggested priority.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl mb-4 shadow-md">
                3
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Agent Copilot Resolution</h3>
              <p className="text-sm text-slate-500">
                Support engineers review ticket summaries, examine customer subscription states, review AI-drafted replies, and close cases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Pricing Preview */}
      <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Transparent Plans</h2>
            <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">Simple, predictable pricing</p>
            <p className="mt-3 text-slate-600 text-sm">
              Upgrade or cancel anytime from your customer dashboard with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Basic</h3>
                <p className="text-xs text-slate-500 mt-1">Essential tools for individuals and small setups.</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#0F172A]">$19</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1 Team Workspace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Standard Email Support (24h SLA)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Up to 50 AI Assistant queries / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Monthly billing cycle</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleDemoAccess('customer')}
                >
                  Start Basic Demo
                </Button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl p-7 border-2 border-blue-600 shadow-lg relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Pro</h3>
                <p className="text-xs text-slate-500 mt-1">Priority support and expanded limits for growing teams.</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#0F172A]">$49</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited Team Workspaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Priority Support Queue (4h SLA)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited AI Assistant chats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Custom domain & webhook notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Itemized PDF Invoice Downloads</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleDemoAccess('customer')}
                >
                  Start Pro Demo
                </Button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">Dedicated SLA, account management & enterprise security.</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#0F172A]">$199</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dedicated Support Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1-Hour Guaranteed Response SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Fine-tuned AI Model Integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>SSO, SAML & Advanced Audit Logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>99.99% Uptime Guarantee</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleDemoAccess('admin')}
                >
                  View Admin Console
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-[#0F172A]">SupportDesk AI</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <a href="#features" className="hover:text-blue-600">Features</a>
              <a href="#pricing" className="hover:text-blue-600">Pricing</a>
              <a href="#how-it-works" className="hover:text-blue-600">How It Works</a>
              <Link to="/login" className="hover:text-blue-600">Customer Login</Link>
              <Link to="/register" className="hover:text-blue-600">Create Account</Link>
            </div>

            <div className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} SupportDesk AI Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
