import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  BarChart2
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardMetrics, Ticket as TicketType } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';

interface DashboardPageProps {
  onNavigate: (tab: string, ticketId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setMetrics(data);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
        Loading support dashboard metrics from backend...
      </div>
    );
  }

  const kpis = metrics?.kpis || {
    total_tickets: 12,
    open_tickets: 5,
    ai_resolved: 4,
    escalated: 2,
    software_requests: 1,
    automation_success: 2
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Support Overview Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time enterprise ITSM metrics, AI self-service resolutions, and ServiceNow synchronization.</p>
        </div>
        <button 
          onClick={() => onNavigate('ai-helpdesk')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
        >
          <span>Open AI Helpdesk</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Tickets"
          value={kpis.total_tickets}
          icon={Ticket}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Open Tickets"
          value={kpis.open_tickets}
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="AI Resolved"
          value={kpis.ai_resolved}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Escalated"
          value={kpis.escalated}
          icon={AlertTriangle}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
        <MetricCard
          title="Software Reqs"
          value={kpis.software_requests}
          icon={Download}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Auto Success"
          value={kpis.automation_success}
          icon={Zap}
          iconBgColor="bg-cyan-50"
          iconColor="text-cyan-600"
        />
      </div>

      {/* Distribution Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ticket Status Distribution</h3>
            <BarChart2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {metrics?.charts.status_distribution.map((st) => (
              <div key={st.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{st.name}</span>
                  <span>{st.value} tickets</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (st.value / (kpis.total_tickets || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Priority Distribution</h3>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {metrics?.charts.priority_distribution.map((p) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{p.name}</span>
                  <span>{p.value}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      p.name.includes('P1') ? 'bg-rose-500' : p.name.includes('P2') ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, (p.value / (kpis.total_tickets || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Resolution vs Human Escalation */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI vs Human Resolution</h3>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800">AI Auto-Resolution Rate</p>
                <p className="text-xs text-emerald-600 mt-0.5">Self-healing & grounded RAG</p>
              </div>
              <span className="text-xl font-extrabold text-emerald-700">
                {Math.round((kpis.ai_resolved / (kpis.total_tickets || 1)) * 100)}%
              </span>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-800">Human Escalation Required</p>
                <p className="text-xs text-rose-600 mt-0.5">Complex or low-confidence requests</p>
              </div>
              <span className="text-xl font-extrabold text-rose-700">
                {Math.round((kpis.escalated / (kpis.total_tickets || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Helpdesk Tickets</h3>
          <button 
            onClick={() => onNavigate('tickets')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">ServiceNow ID</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metrics?.recent_tickets.map((t) => (
                <tr key={t.ticket_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-blue-600">{t.ticket_id}</td>
                  <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">{t.subject}</td>
                  <td className="py-3 px-3 text-slate-600">{t.category}</td>
                  <td className="py-3 px-3">
                    <StatusBadge label={t.priority} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge label={t.status} />
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-600">{t.servicenow_id}</td>
                  <td className="py-3 px-3 text-right">
                    <button 
                      onClick={() => onNavigate('ticket-detail', t.ticket_id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-medium rounded border border-slate-200 text-[11px] transition-colors"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
