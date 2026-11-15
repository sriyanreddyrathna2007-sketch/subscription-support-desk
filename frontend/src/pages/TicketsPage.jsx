import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { CreateTicketModal } from '../components/tickets/CreateTicketModal';
import { TicketDetailModal } from '../components/tickets/TicketDetailModal';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';

export const TicketsPage = () => {
  const { user, role } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchTickets = async () => {
    try {
      const data = await api.listTickets({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        search: searchTerm,
      });
      setTickets(data);
    } catch (err) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  if (loading && tickets.length === 0) {
    return <LoadingSpinner text="Loading tickets..." />;
  }

  const isAgentOrAdmin = role === 'agent' || role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {isAgentOrAdmin ? 'Support Tickets Queue' : 'My Support Tickets'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAgentOrAdmin
              ? 'Review customer issues, assign tickets, and provide assisted AI responses.'
              : 'Track and manage your inquiries with our technical and billing desk.'}
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Support Ticket
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticket number or subject (press Enter)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Customer">Waiting for Customer</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[11px]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Billing">Billing</option>
                <option value="Subscription">Subscription</option>
                <option value="Payment Failure">Payment Failure</option>
                <option value="Cancellation">Cancellation</option>
                <option value="Refund">Refund</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Account Access">Account Access</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[11px]">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        {tickets.length === 0 ? (
          <EmptyState
            title="No support tickets match criteria"
            description="Try modifying your status or category filters, or create a new support ticket."
            actionText="Create Support Ticket"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Ticket ID</th>
                  {isAgentOrAdmin && <th className="px-6 py-3.5">Customer</th>}
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  {isAgentOrAdmin && <th className="px-6 py-3.5">Assigned Agent</th>}
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                      {t.ticket_number}
                    </td>

                    {isAgentOrAdmin && (
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{t.customer_name}</div>
                        <div className="text-[10px] text-slate-400">{t.customer_email}</div>
                      </td>
                    )}

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

                    {isAgentOrAdmin && (
                      <td className="px-6 py-4 text-slate-600">
                        {t.assigned_agent_name ? (
                          <span className="font-medium text-slate-800">{t.assigned_agent_name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(t.updated_at).toLocaleDateString()}
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
                        Open Ticket
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
        onCreated={() => fetchTickets()}
      />

      <TicketDetailModal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId}
        onTicketUpdated={() => fetchTickets()}
      />
    </div>
  );
};
