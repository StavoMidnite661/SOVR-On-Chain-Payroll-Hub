
import React from 'react';
import type { PayoutEvent } from '../types';

interface LiveEventLogProps {
  events: PayoutEvent[];
}

export const LiveEventLog: React.FC<LiveEventLogProps> = ({ events }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col h-[45vh] min-h-[400px]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg text-cyan-400">Live Payout Events</h2>
        <p className="text-xs text-gray-400">Listening for `PayoutExecuted` on-chain...</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-xs">
        {events.length === 0 ? (
            <p className="text-gray-500">No events detected yet.</p>
        ) : (
            <ul className="space-y-2">
                {events.map((event) => (
                    <li key={event.id} className="bg-gray-900 p-2 rounded-md border border-gray-700">
                        <p><span className="font-semibold text-gray-400">Tx:</span> <a href={`#`} className="text-blue-400 hover:underline truncate block">{event.id}</a></p>
                        <p><span className="font-semibold text-gray-400">Employee ID:</span> {event.employeeId}</p>
                        <p><span className="font-semibold text-gray-400">Amount:</span> {(parseInt(event.amountBaseUnits) / 10**6).toFixed(2)} USDC</p>
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
};
