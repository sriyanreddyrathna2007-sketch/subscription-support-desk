import React, { useState } from 'react';
import { AIChatbot } from '../components/chat/AIChatbot';
import { CreateTicketModal } from '../components/tickets/CreateTicketModal';
import { useToast } from '../context/ToastContext';

export const AIAssistantPage = () => {
  const toast = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [ticketInitialData, setTicketInitialData] = useState({});

  const handleOpenTicket = (data) => {
    setTicketInitialData(data);
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">AI Support Assistant</h1>
        <p className="text-xs text-slate-500 mt-1">
          Instant answers to subscription and billing inquiries, strictly grounded in approved documentation.
        </p>
      </div>

      <AIChatbot onOpenCreateTicket={handleOpenTicket} />

      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialData={ticketInitialData}
        onCreated={(t) => {
          toast.success(`Support ticket ${t.ticket_number} created from chat!`);
        }}
      />
    </div>
  );
};
