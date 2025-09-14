import React from 'react';

interface HeaderProps {
  onOpenManual: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenManual }) => {
  return (
    <header className="mb-6 flex justify-between items-start flex-wrap gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-wider">On-Chain Payroll Hub</h1>
        <p className="text-sm text-gray-400 mt-1">
          A real-time dashboard for managing NACHA-compliant payroll from smart contract events.
        </p>
      </div>
      <button
        onClick={onOpenManual}
        className="bg-gray-700 hover:bg-gray-600 text-cyan-400 font-semibold py-2 px-4 border border-gray-600 rounded-lg shadow-md transition duration-300 ease-in-out whitespace-nowrap"
        aria-label="Open User Manual"
      >
        User Manual
      </button>
    </header>
  );
};