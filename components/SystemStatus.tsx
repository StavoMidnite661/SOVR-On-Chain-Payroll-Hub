
import React from 'react';

interface SystemStatusProps {
  eventCount: number;
  journalCount: number;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ eventCount, journalCount }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex justify-between items-center text-sm">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-semibold text-green-400">SYSTEM OPERATIONAL</span>
      </div>
      <div className="flex gap-6">
        <span><span className="font-bold text-gray-400">Live Events:</span> {eventCount}</span>
        <span><span className="font-bold text-gray-400">Journal Entries:</span> {journalCount}</span>
      </div>
    </div>
  );
};
