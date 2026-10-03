import React from 'react';
import { Clock, CheckCircle2, Shield, Cpu, Tag } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditTimelineProps {
  logs: AuditLog[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs font-medium">
        No audit log events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {logs.map((log, idx) => (
        <div key={log.id || idx} className="relative group">
          {/* Node Dot */}
          <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-sm">
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">{log.action}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold rounded-full">
                  {log.status}
                </span>
                {log.mode && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-full">
                    {log.mode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Clock className="h-3 w-3" />
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{log.result}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100/80">
              <div className="flex items-center gap-1">
                <Cpu className="h-3 w-3 text-slate-400" />
                <span>Actor: <strong className="text-slate-600">{log.actor}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-slate-400" />
                <span>Ref: <strong className="text-blue-600">{log.ticket_id}</strong></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
