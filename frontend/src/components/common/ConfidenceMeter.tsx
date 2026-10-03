import React from 'react';

interface ConfidenceMeterProps {
  score: number; // 0.0 to 1.0
  showLabel?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score, showLabel = true }) => {
  const percentage = Math.round(score * 100);
  
  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50';
  let labelText = 'High Confidence';

  if (score < 0.40) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50';
    labelText = 'Low Confidence';
  } else if (score < 0.70) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50';
    labelText = 'Moderate Confidence';
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">AI Confidence:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${badgeColor}`}>
            {percentage}% ({labelText})
          </span>
        </div>
      )}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${barColor}`} 
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};
