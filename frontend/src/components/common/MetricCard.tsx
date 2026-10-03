import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600'
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} border border-slate-100`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
