import React from 'react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400">User Manual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close user manual">
            <CloseIcon />
          </button>
        </header>

        <main className="p-6 overflow-y-auto text-gray-300 space-y-6 text-sm">
            <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Welcome to the On-Chain Payroll Hub</h3>
                <p>
                    This dashboard simulates a real-time, NACHA-compliant payroll system that operates from on-chain smart contract events. You can manage employees, interact with specialized AI agents, and observe the entire lifecycle of a payroll run, from a blockchain transaction to a generated ACH file ready for bank submission.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">How It Works</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>
                        <strong>Employee Management:</strong> The "Employee & Payroll Management" panel is your control center for employee data. You can add, edit, and delete employees who are eligible for payroll. The simulation will use this list to generate payout events.
                    </li>
                    <li>
                        <strong>Live Payout Events:</strong> The system automatically simulates `PayoutExecuted` events from a smart contract. These appear in the "Live Payout Events" log, representing payments made to employee wallets.
                    </li>
                    <li>
                        <strong>AI Agents:</strong> You have two AI assistants. <strong>NOVA-NACHA</strong> is the operations executive responsible for creating ACH files. <strong>ORACLE-LEDGER</strong> is the financial officer who manages the double-entry accounting ledger.
                    </li>
                    <li>
                        <strong>NACHA File & General Ledger:</strong> When you instruct NOVA-NACHA to run a payroll cycle, it processes the pending events, generates a compliant NACHA file, and posts corresponding journal entries to the General Ledger.
                    </li>
                </ul>
            </section>
            
            <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">How to Use the Hub</h3>
                <ol className="list-decimal list-inside space-y-2">
                    <li>
                        <strong>Manage Employees:</strong> Use the management panel to add your own employees or modify the existing ones. Make sure their pay preference is set to 'ACH' to have them included in the payroll run.
                    </li>
                    <li>
                        <strong>Observe Events:</strong> Watch as new payout events for your ACH employees appear in the "Live Payout Events" log.
                    </li>
                    <li>
                        <strong>Run Payroll:</strong> In the <strong>NOVA-NACHA</strong> chat panel, type the command <code className="bg-gray-900 text-cyan-300 px-2 py-1 rounded-md text-xs">Run Payroll-Cycle</code> and press Send.
                    </li>
                    <li>
                        <strong>Review Results:</strong> Observe the "NACHA PPD File" viewer populate with the generated file. Simultaneously, see the balanced debit/credit entries appear in the "General Ledger Postings".
                    </li>
                    <li>
                        <strong>Query the Ledger:</strong> Ask <strong>ORACLE-LEDGER</strong> questions about the finances, such as <code className="bg-gray-900 text-cyan-300 px-2 py-1 rounded-md text-xs">What is the balance of the ACH Clearing account?</code> or <code className="bg-gray-900 text-cyan-300 px-2 py-1 rounded-md text-xs">Show me the last journal entry</code>.
                    </li>
                </ol>
            </section>
        </main>
      </div>
    </div>
  );
};
