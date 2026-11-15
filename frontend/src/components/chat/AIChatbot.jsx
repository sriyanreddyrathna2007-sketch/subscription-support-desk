import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  BookOpen,
  ArrowRight,
  LifeBuoy,
  HelpCircle,
  RefreshCw,
  Info
} from 'lucide-react';

export const AIChatbot = ({ onOpenCreateTicket }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am SupportDesk AI, your automated subscription assistant.\n\nI can answer questions regarding billing, plan upgrades, payment troubleshooting, refund policies, and account access based on our verified support documentation.\n\nHow can I help you today?`,
      is_demo_mode: true,
      created_at: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Why did my payment fail?",
    "How can I upgrade my plan?",
    "How do I cancel my subscription?",
    "How can I request a refund?",
    "Why is my premium account not working?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.chatWithAI(text, conversationId);
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        is_demo_mode: response.is_demo_mode,
        kb_references: response.kb_references,
        suggest_ticket: response.suggest_ticket,
        suggested_category: response.suggested_category,
        suggested_subject: response.suggested_subject,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      toast.error(err.message || 'Failed to communicate with AI Assistant');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I encountered a communication error with our server. Please try asking again or create a support ticket directly.',
          is_error: true,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    if (conversationId) {
      try {
        await api.clearAIConversation(conversationId);
      } catch (e) {
        console.warn("Could not delete conversation remotely:", e);
      }
    }
    setConversationId(null);
    setMessages([
      {
        id: 'welcome-fresh',
        role: 'assistant',
        content: "Conversation history cleared. How else can I assist your subscription needs today?",
        is_demo_mode: true,
        created_at: new Date().toISOString()
      }
    ]);
    toast.info("Chat conversation cleared");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Chatbot Header */}
      <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">SupportDesk AI Assistant</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Verified against approved company knowledge base</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo Mode Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Demo Mode</span>
          </div>

          <button
            onClick={handleClearChat}
            title="Clear Conversation"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo notice alert banner */}
      <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2 text-xs text-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            Answers are grounded in company support policies and customer subscription state. Real AI credentials can be plugged via <code className="bg-blue-100/80 px-1 py-0.5 rounded font-mono text-[11px]">AI_API_KEY</code>.
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#2563EB] text-white rounded-tr-xs shadow-sm'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
              }`}
            >
              {/* Message content */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              {/* Knowledge Base Citations */}
              {msg.kb_references && msg.kb_references.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/70 text-xs text-slate-500">
                  <div className="font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Documentation Referenced:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.kb_references.map((ref, idx) => (
                      <span
                        key={idx}
                        className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium text-[11px]"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Offer to Create Support Ticket */}
              {msg.suggest_ticket && onOpenCreateTicket && (
                <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">Need direct human agent review?</span>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={LifeBuoy}
                    onClick={() =>
                      onOpenCreateTicket({
                        subject: msg.suggested_subject || "Issue reported via AI Assistant",
                        category: msg.suggested_category || "Other"
                      })
                    }
                  >
                    Open Support Ticket
                  </Button>
                </div>
              )}

              {/* Demo Mode Label Footer on Bot Messages */}
              {msg.role === 'assistant' && msg.is_demo_mode && (
                <div className="mt-2 text-[10px] text-slate-400 text-right">
                  Generated via SupportDesk Policy Engine (Demo Mode)
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 text-slate-500 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2">
              <span className="text-xs font-medium">Assistant is searching documentation</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200/70 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3.5 h-3.5" />
            Suggested:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300 border border-slate-200/90 rounded-full px-3 py-1 font-medium transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your subscription question (e.g., 'Why was my card declined?')..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            loading={loading}
            icon={Send}
            variant="primary"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
