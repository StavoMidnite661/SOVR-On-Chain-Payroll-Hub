
import React from 'react';
import type { JournalEntry } from '../types';

interface GeneralLedgerProps {
  entries: JournalEntry[];
}

export const GeneralLedger: React.FC<GeneralLedgerProps> = ({ entries }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col h-[45vh] min-h-[400px]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg text-cyan-400">General Ledger Postings</h2>
        <p className="text-xs text-gray-400">Double-entry journal from payroll events.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-xs">
        {entries.length === 0 ? (
            <p className="text-gray-500">No journal entries posted yet.</p>
        ) : (
            <div className="space-y-3">
            {entries.slice().reverse().map((entry, index) => (
                <div key={index} className="bg-gray-900 p-3 rounded-md border border-gray-700">
                    <p className="font-semibold text-gray-400">Memo: <span className="font-normal text-gray-200">{entry.memo}</span></p>
                    <table className="w-full mt-2">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th>Account</th>
                                <th>Entity</th>
                                <th className="text-right">Debit</th>
                                <th className="text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                        {entry.lines.map((line, lineIndex) => (
                            <tr key={lineIndex} className="border-t border-gray-800">
                                <td>{line.account}</td>
                                <td>{line.entity}</td>
                                <td className="text-right">{line.dc === 'D' ? (line.amountCents / 100).toFixed(2) : ''}</td>
                                <td className="text-right">{line.dc === 'C' ? (line.amountCents / 100).toFixed(2) : ''}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};
