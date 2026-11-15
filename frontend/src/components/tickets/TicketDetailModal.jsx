import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  CheckCheck,
  Edit3
} from 'lucide-react';

export const TicketDetailModal = ({
  isOpen,
  onClose,
  ticketId,
  onTicketUpdated,
}) => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);

  // AI Assistant for Agents
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const messagesEndRef = useRef(null);
  const isAgentOrAdmin = role === 'agent' || role === 'admin';

  const fetchTicket = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const data = await api.getTicket(ticketId);
      setTicket(data);
    } catch (err) {
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket();
      setAiSummary(null);
    }
  }, [isOpen, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      await api.addTicketMessage(ticket.id, replyMessage.trim(), isInternalNote);
      setReplyMessage('');
      setIsInternalNote(false);
      await fetchTicket();
      if (onTicketUpdated) onTicketUpdated();
      toast.success('Message sent to ticket thread');
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await api.updateTicket(ticket.id, { status: newStatus });
      setTicket(updated);
      if (onTicketUpdated) onTicketUpdated();
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket status');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await api.updateTicket(ticket.id, { priority: newPriority });
      setTicket(updated);
      if (onTicketUpdated) onTicketUpdated();
      toast.success(`Priority updated to ${newPriority}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update priority');
    }
  };

  const handleAssignToMe = async () => {
    try {
      const updated = await api.updateTicket(ticket.id, { assigned_agent_id: user.id });
      setTicket(updated);
      if (onTicketUpdated) onTicketUpdated();
      toast.success('Ticket assigned to you');
    } catch (err) {
      toast.error(err.message || 'Failed to assign ticket');
    }
  };

  const handleAISummarize = async () => {
    setLoadingSummary(true);
    try {
      const summary = await api.summarizeTicket(ticket.id);
      setAiSummary(summary);
      toast.info('AI ticket summary generated');
    } catch (err) {
      toast.error('Failed to generate AI summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAISuggestResponse = async () => {
    setLoadingSuggestion(true);
    try {
      const res = await api.suggestResponse(ticket.id);
      setReplyMessage(res.suggestion);
      toast.info('AI response drafted into message composer. Review and edit before sending.');
    } catch (err) {
      toast.error('Failed to generate response suggestion');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? `${ticket.ticket_number}: ${ticket.subject}` : 'Loading ticket...'}
      subtitle={ticket ? `Opened by ${ticket.customer_name} (${ticket.customer_email})` : ''}
      maxWidth="max-w-3xl"
    >
      {loading || !ticket ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading ticket correspondence...</div>
      ) : (
        <div className="space-y-5">
          {/* Ticket Metadata Bar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={ticket.status}>{ticket.status}</Badge>
              <Badge variant={ticket.priority}>{ticket.priority} Priority</Badge>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">
                {ticket.category}
              </span>
              {ticket.attachment_name && (
                <span className="flex items-center gap-1 text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                  <Paperclip className="w-3 h-3 text-slate-400" />
                  {ticket.attachment_name}
                </span>
              )}
            </div>

            {/* Quick Status / Priority Dropdowns for Agents & Admins */}
            {isAgentOrAdmin ? (
              <div className="flex items-center gap-2">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Customer">Waiting for Customer</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>

                {!ticket.assigned_agent_id ? (
                  <Button size="sm" variant="secondary" onClick={handleAssignToMe}>
                    Claim Ticket
                  </Button>
                ) : (
                  <span className="text-slate-500 text-[11px]">
                    Assigned: <strong className="text-slate-700">{ticket.assigned_agent_name}</strong>
                  </span>
                )}
              </div>
            ) : (
              /* Customer quick action */
              ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={CheckCircle2}
                  onClick={() => handleStatusChange('Resolved')}
                >
                  Mark as Resolved
                </Button>
              )
            )}
          </div>

          {/* AI Assistance Panel for Agents */}
          {isAgentOrAdmin && (
            <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Agent Copilot (Demo Mode)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={loadingSummary}
                    onClick={handleAISummarize}
                    className="text-xs py-1"
                  >
                    Summarize Ticket
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    loading={loadingSuggestion}
                    onClick={handleAISuggestResponse}
                    className="text-xs py-1"
                  >
                    Suggest Response
                  </Button>
                </div>
              </div>

              {aiSummary && (
                <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="font-medium text-slate-800">{aiSummary.summary}</div>
                  <div className="flex flex-wrap gap-2 text-slate-500">
                    {aiSummary.key_points.map((pt, idx) => (
                      <span key={idx} className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {pt}
                      </span>
                    ))}
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                      Sentiment: {aiSummary.sentiment}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conversation Thread */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto p-1">
            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((m) => {
                const isCustomerSender = m.sender_role === 'customer';
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      m.is_internal_note
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : isCustomerSender
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-blue-50/50 border-blue-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-xs">{m.sender_name}</strong>
                        <span className="text-[10px] text-slate-400 capitalize">({m.sender_role})</span>
                        {m.is_internal_note && (
                          <span className="bg-amber-200 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold uppercase">
                            Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-slate-700">{m.message}</div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">No messages recorded yet.</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 space-y-2">
            {isAgentOrAdmin && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Post as Internal Staff Note (Customer won't see this)</span>
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <textarea
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={
                  isInternalNote
                    ? "Write an internal note for support staff..."
                    : "Type your reply to this ticket thread..."
                }
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                {ticket.status === 'Resolved' || ticket.status === 'Closed'
                  ? 'Replying will automatically reopen the ticket.'
                  : 'Customer and staff receive immediate updates.'}
              </span>
              <Button
                type="submit"
                variant={isInternalNote ? 'warning' : 'primary'}
                loading={sendingReply}
                disabled={!replyMessage.trim()}
                icon={Send}
                size="sm"
              >
                {isInternalNote ? 'Save Internal Note' : 'Send Reply'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
