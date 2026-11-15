import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { TicketDetailModal } from '../components/tickets/TicketDetailModal';
import {
  Headphones,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Filter,
  UserCheck,
  Bot
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchAgentData = async () => {
    try {
      const resp = await api.getAgentDashboard();
      setData(resp);
    } catch (err) {
      toast.error('Failed to load agent metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading agent workspace..." />;
  }

  const metrics = data?.metrics || {};
  const queue = data?.queue || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Support Agent Desk</h1>
            <Badge size="md" variant="progress">Agent Role</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Triaging ticket queue with AI-assisted summaries and response drafting.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI Copilot Active (Editable Suggestions)</span>
        </div>
      </div>

      {/* 5 Agent Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Assigned To Me
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">
            {metrics.assigned_to_me ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tickets in personal queue</div>
        </Card>

        {/* Metric 2 */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Open Tickets
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <LifeBuoy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">
            {metrics.open_tickets ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Global active queue</div>
        </Card>

        {/* Metric 3 */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Urgent Priority
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {metrics.urgent_tickets ?? 0}
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">Immediate action needed</div>
        </Card>

        {/* Metric 4 */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Resolved Tickets
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">
            {metrics.resolved_tickets ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Successfully closed</div>
        </Card>

        {/* Metric 5 */}
        <Card className="hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Avg Resolution
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#0F172A]">
            {metrics.avg_resolution_hours}h
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Within target SLA</div>
        </Card>
      </div>

      {/* Ticket Queue Table */}
      <Card
        title="Live Support Queue"
        subtitle="Click any ticket to inspect context, generate AI summaries, and dispatch responses."
        padding={false}
      >
        {queue.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            description="There are currently no tickets pending in the support queue."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Ticket #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                      {t.ticket_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{t.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{t.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-sm truncate">
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
                    <td className="px-6 py-4 text-slate-600">
                      {t.assigned_agent_name !== 'Unassigned' ? (
                        <span className="font-medium text-slate-800">{t.assigned_agent_name}</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium text-[10px]">
                          Unassigned
                        </span>
                      )}
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
                        Respond & AI Copilot
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId}
        onTicketUpdated={() => fetchAgentData()}
      />
    </div>
  );
};
