import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Ticket, 
  BrainCircuit, 
  BookOpen, 
  Zap, 
  Download, 
  History,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-helpdesk', label: 'AI Helpdesk', icon: Bot },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'ai-analysis', label: 'AI Analysis', icon: BrainCircuit },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'software-requests', label: 'Software Requests', icon: Download },
    { id: 'audit-logs', label: 'Audit Logs', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none shadow-xl z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/50">
          <ShieldCheck className="h-5.5 w-5.5" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white leading-tight tracking-tight">AI ITSM Helpdesk</h1>
          <p className="text-xs text-slate-400 font-medium">Enterprise SaaS Support</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-950/40 translate-x-0.5'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span>FAISS Vector Index:</span>
          <span className="text-emerald-400 font-medium">Active (8 KB Docs)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>AI Engine:</span>
          <span className="text-blue-400 font-medium">Hugging Face LLM</span>
        </div>
      </div>
    </aside>
  );
};
