import React, { useState } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Zap, 
  Download, 
  HelpCircle,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ChatResponse } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfidenceMeter } from '../components/common/ConfidenceMeter';
import { RAGSourceCard } from '../components/common/RAGSourceCard';

interface AIHelpdeskPageProps {
  onNavigate: (tab: string, ticketId?: string) => void;
}

export const AIHelpdeskPage: React.FC<AIHelpdeskPageProps> = ({ onNavigate }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const presetScenarios = [
    { label: 'Scenario 1: VPN Incident', query: 'My VPN is not connecting. Authentication keeps failing.' },
    { label: 'Scenario 2: Password Reset', query: 'My password has expired.' },
    { label: 'Scenario 3: Outlook Knowledge', query: 'How do I troubleshoot Outlook synchronization?' },
    { label: 'Scenario 4: VS Code Request', query: 'I need Visual Studio Code installed on my laptop.' },
    { label: 'Scenario 5: Unsupported Question', query: 'What is the policy for reimbursing luxury dinner expenses?' }
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    setLoading(true);
    setActionMessage(null);
    try {
      const res = await api.sendChat(q);
      setChatResult(res);
      setInputQuery('');
    } catch (e) {
      console.error("Chat API error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!chatResult) return;
    setLoading(true);
    try {
      const ticket = await api.createTicket({
        subject: chatResult.summary || chatResult.user_request,
        user_request: chatResult.user_request,
        intent: chatResult.intent,
        category: chatResult.category,
        subcategory: chatResult.subcategory,
        priority: chatResult.priority,
        impact: chatResult.impact,
        urgency: chatResult.urgency,
        assignment_group: chatResult.assignment_group,
        suggested_resolution: chatResult.suggested_resolution,
        confidence: chatResult.confidence,
        rag_sources: chatResult.rag_sources
      });
      setActionMessage(`Incident created successfully in ServiceNow! ID: ${ticket.servicenow_id}`);
    } catch (e) {
      setActionMessage('Failed to create incident ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutomation = async () => {
    if (!chatResult || !chatResult.automation_action) return;
    setLoading(true);
    try {
      const res = await api.executeAutomation(chatResult.automation_action, "INC001002");
      setActionMessage(`Automation '${res.action}' executed successfully! Result: ${res.result} (MOCK)`);
    } catch (e) {
      setActionMessage('Automation execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSoftware = async () => {
    if (!chatResult) return;
    setLoading(true);
    try {
      const res = await api.requestSoftware(chatResult.requested_software || "vscode");
      setActionMessage(`Software request submitted! ServiceNow Ref: ${res.servicenow_ref} | Status: ${res.provisioning_status}`);
    } catch (e) {
      setActionMessage('Software request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Scenarios bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>AI Helpdesk Self-Service Assistant</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Natural language IT support assistant powered by Hugging Face LLM & FAISS RAG semantic retrieval.</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
            RAG Grounded
          </span>
        </div>

        {/* Demo Preset Buttons */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Test Mandatory Live Scenarios:</p>
          <div className="flex flex-wrap gap-2">
            {presetScenarios.map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputQuery(sc.query);
                  handleSend(sc.query);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium rounded-lg border border-slate-200 hover:border-blue-300 transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Chat / Right AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Conversation Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Action Notification Alert */}
          {actionMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{actionMessage}</span>
              </div>
              <button onClick={() => onNavigate('tickets')} className="underline font-bold">View Tickets</button>
            </div>
          )}

          {/* User Input & Submit */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">State your IT request or question:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="e.g. 'My VPN is not connecting', 'My password has expired', 'I need Visual Studio Code'..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Analyzing...' : 'Submit'}</span>
              </button>
            </div>
          </div>

          {/* Conversation & AI Response Card */}
          {chatResult ? (
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-5">
              {/* User Message */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="h-8 w-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee Request</span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{chatResult.user_request}</p>
                </div>
              </div>

              {/* UNSUPPORTED / LOW CONFIDENCE WARNING CARD */}
              {chatResult.unsupported && (
                <div className="bg-rose-50/90 border border-rose-300 rounded-xl p-4 text-rose-900 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                    <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>Information unavailable in the approved knowledge base.</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    The requested question could not be answered using approved IT documents. To prevent AI hallucinations, an automated answer was withheld. Human escalation is required.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleCreateIncident}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Create Helpdesk Ticket</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI Grounded Response */}
              {!chatResult.unsupported && (
                <div className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-blue-600/30">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">AI Grounded Resolution</span>
                      <StatusBadge label={chatResult.workflow_type} />
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                      {chatResult.ai_response}
                    </p>
                  </div>
                </div>
              )}

              {/* RAG Knowledge Sources */}
              {chatResult.rag_sources && chatResult.rag_sources.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Retrieved Knowledge Base Sources ({chatResult.rag_sources.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {chatResult.rag_sources.map((src, idx) => (
                      <RAGSourceCard key={idx} source={src} />
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCreateIncident}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Incident</span>
                </button>

                {chatResult.automation_allowed && chatResult.automation_action && (
                  <button
                    onClick={handleRunAutomation}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Run Automation ({chatResult.automation_action})</span>
                  </button>
                )}

                {chatResult.requested_software && (
                  <button
                    onClick={handleRequestSoftware}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    <span>Request {chatResult.requested_software}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center text-slate-400 text-xs space-y-3">
              <Bot className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-600">Submit a query above or click a scenario preset to initiate AI analysis.</p>
            </div>
          )}
        </div>

        {/* Right-Side AI Summary Panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4 sticky top-20">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>AI Decision Trace Panel</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>

            {chatResult ? (
              <div className="space-y-4 text-xs">
                {/* Confidence Meter */}
                <ConfidenceMeter score={chatResult.confidence} />

                {/* Properties Table */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Workflow Type:</span>
                    <StatusBadge label={chatResult.workflow_type} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Intent:</span>
                    <span className="font-semibold text-slate-800">{chatResult.intent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="font-semibold text-slate-800">{chatResult.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Subcategory:</span>
                    <span className="font-semibold text-slate-700">{chatResult.subcategory}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Priority:</span>
                    <StatusBadge label={chatResult.priority} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Assignment Group:</span>
                    <span className="font-semibold text-blue-600">{chatResult.assignment_group}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Automation Decision:</span>
                    <span className={`font-semibold ${chatResult.automation_allowed ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {chatResult.automation_allowed ? 'Approved (Self-Heal)' : 'Manual / RAG'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">ServiceNow Ref:</span>
                    <span className="font-mono font-bold text-slate-700">INC001001 (MOCK)</span>
                  </div>
                </div>

                {/* Suggested Resolution Box */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suggested Resolution</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{chatResult.suggested_resolution}</p>
                </div>

                {/* Deep Dive Link */}
                <button
                  onClick={() => onNavigate('ai-analysis')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Full Pipeline Trace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No active query analyzed. Submit a message to populate intent classification.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
