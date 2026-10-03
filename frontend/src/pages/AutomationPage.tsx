import React, { useState, useEffect } from 'react';
import { Zap, Play, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { AuditTimeline } from '../components/common/AuditTimeline';

export const AutomationPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('password_reset');
  const [ticketIdInput, setTicketIdInput] = useState('INC001001');
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunManualAutomation = async () => {
    setLoading(true);
    try {
      const res = await api.executeAutomation(selectedAction, ticketIdInput);
      setExecutionResult(res);
      await loadAudit();
    } catch (e) {
      console.error("Error executing manual automation:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-600" />
              <span>Self-Healing IT Automation Monitor</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated password resets, account unlocks, and service restarts with mock safety execution and validation.</p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
            Execution Mode: MOCK
          </span>
        </div>

        {/* Manual Test Automation Controls */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Execute Manual Self-Heal Action:</label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="password_reset">Password Reset (Active Directory)</option>
              <option value="account_unlock">Account Unlock (Active Directory)</option>
              <option value="service_restart">Service Restart (GlobalProtect VPN Agent)</option>
            </select>

            <input
              type="text"
              value={ticketIdInput}
              onChange={(e) => setTicketIdInput(e.target.value)}
              placeholder="Target Ticket ID..."
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
            />

            <button
              onClick={handleRunManualAutomation}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{loading ? 'Executing...' : 'Run Automation'}</span>
            </button>
          </div>
        </div>

        {/* Execution Output Banner */}
        {executionResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Automation Action: {executionResult.action}
              </span>
              <StatusBadge label="MOCK" />
            </div>
            <p className="text-slate-700 font-medium">{executionResult.result}</p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-200">
              <span>Validation: <strong>{executionResult.validation}</strong></span>
              <span>Execution Time: <strong>{executionResult.execution_time}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>Automation Execution Audit Timeline</span>
        </h3>

        <AuditTimeline logs={auditLogs} />
      </div>
    </div>
  );
};
