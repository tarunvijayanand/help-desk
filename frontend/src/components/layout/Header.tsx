import React from 'react';
import { Search, Bell, User, Server } from 'lucide-react';

interface HeaderProps {
  servicenowMode?: string;
}

export const Header: React.FC<HeaderProps> = ({ servicenowMode = 'MOCK' }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, knowledge base articles, or ServiceNow IDs..."
            className="w-full bg-slate-100/80 border border-slate-200/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* ServiceNow Mode Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs">
          <Server className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-slate-500 font-medium text-[11px]">ServiceNow Mode:</span>
          <span className={`px-2 py-0.5 rounded font-bold text-[10px] tracking-wide ${
            servicenowMode === 'MOCK' 
              ? 'bg-amber-100 text-amber-800 border border-amber-300/60' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
          }`}>
            {servicenowMode.toUpperCase()}
          </span>
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="h-2 w-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-xs shadow-inner">
            AC
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Alex Chen</p>
            <p className="text-[11px] text-slate-500 font-medium">IT Support Specialist</p>
          </div>
        </div>
      </div>
    </header>
  );
};
