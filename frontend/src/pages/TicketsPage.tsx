import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, Ticket as TicketIcon } from 'lucide-react';
import { api } from '../services/api';
import { Ticket } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface TicketsPageProps {
  onSelectTicket: (ticketId: string) => void;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({ onSelectTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getTickets({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter
      });
      setTickets(data);
    } catch (e) {
      console.error("Failed to load tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = (tickets || []).filter(t => {
    if (!t) return false;
    const term = searchTerm.toLowerCase();
    const ticketId = (t.ticket_id || '').toLowerCase();
    const subject = (t.subject || '').toLowerCase();
    const servicenowId = (t.servicenow_id || '').toLowerCase();
    const assignmentGroup = (t.assignment_group || '').toLowerCase();

    return (
      ticketId.includes(term) ||
      subject.includes(term) ||
      servicenowId.includes(term) ||
      assignmentGroup.includes(term)
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Controls Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-blue-600" />
              <span>ITSM Ticket Management</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Compact Zoho Desk style support ticket queue synchronized with ServiceNow REST API.</p>
          </div>
          <button 
            onClick={loadTickets}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by ID, subject, ServiceNow ref..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Moderate</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Network">Network</option>
              <option value="Identity & Access">Identity & Access</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Software Catalog">Software Catalog</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            Fetching tickets from backend database...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <TicketIcon className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No tickets found in MongoDB Atlas for the selected filters.</p>
            <p className="text-slate-400 text-[11px]">Go to the AI Helpdesk page to submit a new request, or click Refresh.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignment Group</th>
                  <th className="py-3 px-4">AI Status</th>
                  <th className="py-3 px-4">ServiceNow ID</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredTickets.map((t) => (
                  <tr key={t.ticket_id || t.servicenow_id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{t.ticket_id || 'TCK-NEW'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">{t.subject || t.user_request}</td>
                    <td className="py-3 px-4 text-slate-600">{t.category || 'General IT'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge label={t.priority || 'P3'} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge label={t.status || 'Open'} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{t.assignment_group || 'Service Desk'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-200">
                        {t.ai_status || 'AI Analyzed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{t.servicenow_id || 'INC001001'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectTicket(t.ticket_id || t.servicenow_id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded border border-slate-200 font-semibold text-[11px] transition-all flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
