import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { RAGSource } from '../../types';

interface RAGSourceCardProps {
  source: RAGSource;
}

export const RAGSourceCard: React.FC<RAGSourceCardProps> = ({ source }) => {
  const percentage = Math.round(source.score * 100);

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 space-y-2">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">{source.title}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-100/70 border border-blue-200 text-blue-800 px-2 py-0.5 rounded text-[11px] font-semibold">
          <CheckCircle2 className="h-3 w-3 text-blue-600" />
          <span>Similarity: {percentage}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed font-mono bg-white p-2.5 rounded border border-slate-200/80">
        "{source.chunk}"
      </p>
      <div className="text-[11px] text-slate-400 text-right">
        Source document: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{source.source}</code>
      </div>
    </div>
  );
};
