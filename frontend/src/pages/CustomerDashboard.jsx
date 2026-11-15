import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CreateTicketModal } from '../components/tickets/CreateTicketModal';
import { TicketDetailModal } from '../components/tickets/TicketDetailModal';
import {
  CreditCard,
  LifeBuoy,
  Bot,
  Receipt,
  Calendar,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const data = await api.getCustomerDashboard();
      setDashboardData(data);
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading customer overview..." />;
  }

  const sub = dashboardData?.subscription;
  const metrics = dashboardData?.metrics;
  const recentTickets = dashboardData?.recent_tickets || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>AI Subscription Support Desk</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            Need help troubleshooting a billing issue, upgrading your plan, or canceling an account? Our verified AI assistant and support engineers are ready to help.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              icon={Bot}
              size="sm"
              onClick={() => navigate('/app/assistant')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
            >
              Ask AI Assistant
            </Button>
            <Button
              variant="outline"
              icon={PlusCircle}
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Open Support Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Subscription */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Plan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A]">{sub?.plan_name || 'Basic'}</span>
            <span className="text-xs text-slate-500">
              ${sub?.price || 0}/{sub?.billing_interval || 'mo'}
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 cursor-pointer" onClick={() => navigate('/app/subscription')}>
            <span>Manage Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Card>

        {/* Card 2: Subscription Status */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <Badge size="lg" variant={sub?.status || 'active'}>
              {sub?.status ? sub.status.toUpperCase() : 'ACTIVE'}
            </Badge>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Automated renewal enabled
          </div>
        </Card>

        {/* Card 3: Open Support Tickets */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Open Tickets
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A]">{metrics?.open_tickets ?? 0}</span>
            <span className="text-xs text-slate-400">of {metrics?.total_tickets ?? 0} total</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 cursor-pointer" onClick={() => navigate('/app/tickets')}>
            <span>View All Tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Card>

        {/* Card 4: Next Billing Date */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Next Billing Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-[#0F172A]">
              {sub?.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : 'Active Renewal'}
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 cursor-pointer" onClick={() => navigate('/app/billing')}>
            <span>Billing History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Card>
      </div>

      {/* Subscription Overview Card */}
      <Card
        title="Subscription Overview"
        subtitle="Manage your current plan tier, renewal cycle, and automated features."
        headerAction={
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/subscription')}
          >
            Manage Subscription
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
          <div>
            <div className="text-xs text-slate-400 font-medium">Plan Name</div>
            <div className="text-base font-bold text-slate-800 mt-1">{sub?.plan_name || 'Basic'} Tier</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Monthly Price</div>
            <div className="text-base font-bold text-slate-800 mt-1">${sub?.price || 0}.00 USD</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Billing Interval</div>
            <div className="text-base font-bold text-slate-800 mt-1 capitalize">{sub?.billing_interval || 'Monthly'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Next Invoice Estimate</div>
            <div className="text-base font-bold text-emerald-600 mt-1">${sub?.price || 0}.00 (Prorated)</div>
          </div>
        </div>
      </Card>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/app/assistant')}
          className="p-5 text-left bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Chat with AI</h4>
          <p className="text-xs text-slate-500 mt-1">Get immediate answers for billing and plan inquiries.</p>
        </button>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="p-5 text-left bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Create Support Ticket</h4>
          <p className="text-xs text-slate-500 mt-1">Submit an inquiry directly to our engineering support queue.</p>
        </button>

        <button
          onClick={() => navigate('/app/subscription')}
          className="p-5 text-left bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">View Subscription</h4>
          <p className="text-xs text-slate-500 mt-1">Compare features, upgrade to Pro or Enterprise tiers.</p>
        </button>

        <button
          onClick={() => navigate('/app/billing')}
          className="p-5 text-left bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Receipt className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">View Billing History</h4>
          <p className="text-xs text-slate-500 mt-1">Review receipts and download simulated tax invoices.</p>
        </button>
      </div>

      {/* Recent Support Tickets Table */}
      <Card
        title="Recent Support Tickets"
        subtitle="Track status and conversation updates on your active tickets."
        headerAction={
          <Button
            size="sm"
            variant="primary"
            icon={PlusCircle}
            onClick={() => setCreateModalOpen(true)}
          >
            New Ticket
          </Button>
        }
        padding={false}
      >
        {recentTickets.length === 0 ? (
          <EmptyState
            title="No support tickets opened"
            description="You currently have no open inquiries or billing issues registered."
            actionText="Create Ticket"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Ticket ID</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                      {t.ticket_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {t.category}
                    </td>
                    <td className="px-6 py-4">
                      <Badge size="sm" variant={t.priority}>{t.priority}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge size="sm" variant={t.status}>{t.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(t.id);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ticket Modals */}
      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => fetchDashboard()}
      />

      <TicketDetailModal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId}
        onTicketUpdated={() => fetchDashboard()}
      />
    </div>
  );
};
