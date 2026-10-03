import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Filter } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { AuditTimeline } from '../components/common/AuditTimeline';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-slate-700" />
              <span>System-Wide Audit Event Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Immutable audit record of all AI classifications, self-healing automations, software requests, and ServiceNow updates.</p>
          </div>
          <button
            onClick={loadLogs}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Audit Timeline Component */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <AuditTimeline logs={logs} />
      </div>
    </div>
  );
};
