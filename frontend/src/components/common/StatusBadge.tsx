import React from 'react';

interface StatusBadgeProps {
  label: string;
  type?: 'status' | 'priority' | 'ai' | 'mode' | 'custom';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, type = 'status' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  const l = label ? label.toLowerCase() : '';

  if (l === 'open' || l === 'new') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (l === 'in progress' || l === 'provisioning') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (l === 'resolved' || l === 'ai resolved' || l === 'success' || l === 'closed complete' || l === 'provisioned (mock)') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (l === 'escalated' || l === 'p1' || l === 'p1 - critical' || l === 'failed') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
  } else if (l === 'p2' || l === 'high') {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (l === 'p3' || l === 'moderate') {
    colorClasses = 'bg-blue-50 text-blue-600 border-blue-200';
  } else if (l === 'p4' || l === 'low') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (l === 'mock') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${colorClasses}`}>
      {label}
    </span>
  );
};
