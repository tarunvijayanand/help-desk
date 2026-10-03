import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Ticket as TicketIcon, 
  Server, 
  Bot, 
  User, 
  CheckCircle2, 
  Zap, 
  Clock, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Ticket } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RAGSourceCard } from '../components/common/RAGSourceCard';
import { AuditTimeline } from '../components/common/AuditTimeline';

interface TicketDetailPageProps {
  ticketId: string;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await api.getTicketById(ticketId);
      setTicket(data);
    } catch (e) {
      console.error("Error loading ticket detail:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        Loading ticket details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-blue-600">{ticket.ticket_id}</span>
              <StatusBadge label={ticket.status} />
              <StatusBadge label={ticket.priority} />
            </div>
            <h2 className="text-base font-bold text-slate-800 mt-0.5">{ticket.subject}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <Server className="h-4 w-4 text-slate-500" />
          <span className="text-slate-500 font-medium">ServiceNow ID:</span>
          <span className="font-mono font-bold text-slate-800">{ticket.servicenow_id}</span>
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded">
            {ticket.servicenow_mode || 'MOCK'}
          </span>
        </div>
      </div>

      {/* 3-Column Structured Helpdesk Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Request & Conversation */}
        <div className="lg:col-span-2 space-y-5">
          {/* Employee Request Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-slate-600" />
              <span>Original Employee Request</span>
            </h3>
            <p className="text-xs text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200/80 leading-relaxed font-medium">
              "{ticket.user_request}"
            </p>
          </div>

          {/* AI Decision Analysis Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bot className="h-4 w-4 text-blue-600" />
              <span>AI Decision & Suggested Resolution</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-100 space-y-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Suggested Resolution</span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">{ticket.suggested_resolution || 'RAG Grounded Procedure'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-medium block text-[11px]">Intent Detection:</span>
                  <span className="font-bold text-slate-800">{ticket.intent}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-medium block text-[11px]">Category / Subcategory:</span>
                  <span className="font-bold text-slate-800">{ticket.category} / {ticket.subcategory}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RAG Sources Used */}
          {ticket.rag_sources && ticket.rag_sources.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>RAG Retrieval Knowledge Chunks</span>
              </h3>
              <div className="space-y-3">
                {ticket.rag_sources.map((src, i) => (
                  <RAGSourceCard key={i} source={src} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Ticket Metadata & Audit Timeline */}
        <div className="space-y-5">
          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Ticket Metadata
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                <StatusBadge label={ticket.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Priority:</span>
                <StatusBadge label={ticket.priority} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Impact:</span>
                <span className="font-semibold text-slate-800">{ticket.impact}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Urgency:</span>
                <span className="font-semibold text-slate-800">{ticket.urgency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Assignment Group:</span>
                <span className="font-semibold text-blue-600">{ticket.assignment_group}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">AI Confidence:</span>
                <span className="font-bold text-emerald-600">{Math.round((ticket.confidence || 0.9) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Audit Log Timeline</span>
            </h3>

            <AuditTimeline logs={[
              {
                timestamp: ticket.created_at,
                action: "Ticket Intake & Classification",
                ticket_id: ticket.servicenow_id,
                status: "Success",
                result: `Incident assigned to ${ticket.assignment_group}`,
                actor: "Intelligent Intake Agent",
                mode: ticket.servicenow_mode,
                details: {}
              }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
};
