
import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  kpi?: string;
  tag?: string;
  tagColor?: 'green' | 'red';
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, kpi, tag, tagColor = 'green' }) => {
  const tagClasses = tagColor === 'green'
    ? 'bg-green-500/20 text-green-400'
    : 'bg-red-500/20 text-red-400';

  return (
    <div className="bg-navy-medium rounded-lg p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            {kpi && <span className="text-sm font-bold bg-pink-200 text-pink-700 px-2 py-0.5 rounded-md mr-3">{kpi}</span>}
            <h2 className="text-md font-semibold text-white">{title}</h2>
            {tag && <span className={`text-xs font-bold ml-3 px-2 py-1 rounded ${tagClasses}`}>{tag}</span>}
        </div>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
