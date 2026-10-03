import React, { useState, useEffect } from 'react';
import { Download, Code, GitBranch, Terminal, Box, CheckCircle2, Server } from 'lucide-react';
import { api } from '../services/api';
import { SoftwareItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const SoftwarePage: React.FC = () => {
  const [catalog, setCatalog] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestResult, setRequestResult] = useState<any | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await api.getSoftwareCatalog();
      setCatalog(data);
    } catch (e) {
      console.error("Failed to load software catalog:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (softwareId: string) => {
    setLoading(true);
    setRequestResult(null);
    try {
      const res = await api.requestSoftware(softwareId);
      setRequestResult(res);
    } catch (e) {
      console.error("Software request error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'code': return Code;
      case 'git-branch': return GitBranch;
      case 'terminal': return Terminal;
      default: return Box;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              <span>Self-Service Software Provisioning Catalogue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated software provisioning portal connected to ServiceNow REST API and Mock Provisioning agent.</p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
            Provisioning Mode: MOCK
          </span>
        </div>

        {/* Provisioning Confirmation Alert */}
        {requestResult && (
          <div className="p-4 bg-purple-50 border border-purple-300 text-purple-900 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-purple-800">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                Software Requested: {requestResult.software_name}
              </span>
              <StatusBadge label="MOCK" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-purple-200 font-medium">
              <div>Request ID: <strong className="font-mono text-slate-800">{requestResult.request_id}</strong></div>
              <div>ServiceNow Ref: <strong className="font-mono text-purple-800">{requestResult.servicenow_ref}</strong></div>
              <div>Status: <strong className="text-emerald-700">{requestResult.provisioning_status}</strong></div>
              <div>Mode: <strong>MOCK</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {catalog.map((item) => {
          const IconComp = getIconComponent(item.icon);
          return (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                    <IconComp className="h-6 w-6" />
                  </div>
                  {item.pre_approved && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                      Pre-Approved
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{item.category}</span>
                <button
                  onClick={() => handleRequest(item.id)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Request</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
