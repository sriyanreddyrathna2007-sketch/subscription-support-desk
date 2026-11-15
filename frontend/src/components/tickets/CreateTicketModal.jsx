import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LifeBuoy, Paperclip } from 'lucide-react';

export const CreateTicketModal = ({ isOpen, onClose, onCreated, initialData = {} }) => {
  const toast = useToast();
  const [subject, setSubject] = useState(initialData.subject || '');
  const [category, setCategory] = useState(initialData.category || 'Billing');
  const [priority, setPriority] = useState(initialData.priority || 'Medium');
  const [description, setDescription] = useState(initialData.description || '');
  const [attachmentName, setAttachmentName] = useState(initialData.attachmentName || '');
  const [loading, setLoading] = useState(false);

  // Update when initialData changes
  React.useEffect(() => {
    if (initialData.subject) setSubject(initialData.subject);
    if (initialData.category) setCategory(initialData.category);
    if (initialData.description) setDescription(initialData.description);
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.warning('Please provide both a subject and detailed description.');
      return;
    }

    setLoading(true);
    try {
      const ticket = await api.createTicket({
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
        attachment_name: attachmentName.trim() || null,
      });

      toast.success(`Support ticket ${ticket.ticket_number} created successfully!`);
      // Reset form
      setSubject('');
      setDescription('');
      setAttachmentName('');
      onClose();
      if (onCreated) onCreated(ticket);
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Support Ticket"
      subtitle="Our support specialists and AI routing engine will assist you promptly."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue (e.g., Duplicate charge on renewal)"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low - General Question</option>
              <option value="Medium">Medium - Normal Issue</option>
              <option value="High">High - Blocking Operations</option>
              <option value="Urgent">Urgent - Service Interruption</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the problem in detail. Include any relevant error messages or dates..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Optional attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            <span>Attachment Name (Optional)</span>
          </label>
          <input
            type="text"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="e.g. invoice_receipt_error.png"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={LifeBuoy}>
            Submit Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
