import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIAgentPanel } from './components/AIAgentPanel';
import { LiveEventLog } from './components/LiveEventLog';
import { NachaFileViewer } from './components/NachaFileViewer';
import { GeneralLedger } from './components/GeneralLedger';
import { SystemStatus } from './components/SystemStatus';
import { EmployeeManager } from './components/EmployeeManager';
import { UserManual } from './components/UserManual';
import { NOVA_NACHA_PROMPT, ORACLE_LEDGER_PROMPT, INITIAL_MOCK_EMPLOYEE_DB } from './constants';
import type { ChatMessage, PayoutEvent, JournalEntry, EmployeeBank } from './types';
import { SimulationService } from './services/simulationService';
import { GeminiService } from './services/geminiService';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [novaMessages, setNovaMessages] = useState<ChatMessage[]>([]);
  const [ledgerMessages, setLedgerMessages] = useState<ChatMessage[]>([]);
  const [isNovaLoading, setIsNovaLoading] = useState(false);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  const [liveEvents, setLiveEvents] = useState<PayoutEvent[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [nachaFile, setNachaFile] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeBank[]>(INITIAL_MOCK_EMPLOYEE_DB);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const simulationService = useRef<SimulationService | null>(null);
  
  useEffect(() => {
    simulationService.current = new SimulationService(
      (event) => setLiveEvents(prev => [event, ...prev.slice(0, 19)]),
      (entry) => setJournalEntries(prev => [entry, ...prev])
    );
    simulationService.current.updateEmployees(employees); // Initial sync
    simulationService.current.startEventStream();
    
    // Initial message from NOVA-NACHA
    setNovaMessages([{
        role: 'model',
        content: "I am NOVA-NACHA, ready to process payroll. Awaiting your instructions. To begin, type `Run Payroll-Cycle`.",
        timestamp: new Date().toISOString()
    }]);

    // Initial message from ORACLE-LEDGER
     setLedgerMessages([{
        role: 'model',
        content: "I am ORACLE-LEDGER, ready to manage the general ledger. You can ask me to `Load chart of accounts` or `Produce daily Trial Balance`.",
        timestamp: new Date().toISOString()
    }]);

    return () => {
      simulationService.current?.stopEventStream();
    };
  }, []);

  useEffect(() => {
    simulationService.current?.updateEmployees(employees);
  }, [employees]);


  const handleAddEmployee = (employee: Omit<EmployeeBank, 'employeeId'>) => {
    setEmployees(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(e => e.employeeId)) + 1 : 1;
      return [...prev, { ...employee, employeeId: newId }];
    });
  };

  const handleUpdateEmployee = (updatedEmployee: EmployeeBank) => {
    setEmployees(prev => prev.map(e => e.employeeId === updatedEmployee.employeeId ? updatedEmployee : e));
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setEmployees(prev => prev.filter(e => e.employeeId !== employeeId));
  };


  const handleRunPayrollCycle = useCallback(async () => {
    if (!simulationService.current) return;
    
    const { processedEvents, batchEntries } = await simulationService.current.processPendingPayouts();

    if (batchEntries.length === 0) {
      return { aiResponse: "No pending `PayoutExecuted` events to process. The batch is empty." };
    }

    const { nachaFile: generatedNachaFile, tag } = simulationService.current.buildNachaFile(batchEntries);
    setNachaFile(generatedNachaFile);

    simulationService.current.clearPendingEvents();

    return { 
      aiResponse: `Payroll cycle complete. Processed ${processedEvents.length} events. Built NACHA PPD batch with reference \`${tag}\`. The ACH file is ready for your review.`
    };
  }, []);
  
  const handleNovaSendMessage = useCallback(async (message: string) => {
    setIsNovaLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setNovaMessages(prev => [...prev, userMessage]);

    let aiResponseContent = "I'm sorry, I can only respond to `Run Payroll-Cycle` at this time.";

    if (message.trim().toLowerCase().includes('run payroll-cycle')) {
      const result = await handleRunPayrollCycle();
      aiResponseContent = result.aiResponse;
    } else {
       const geminiResponse = await GeminiService.getAIAssistantResponse(NOVA_NACHA_PROMPT, message, novaMessages);
       aiResponseContent = geminiResponse;
    }

    const aiMessage: ChatMessage = { role: 'model', content: aiResponseContent, timestamp: new Date().toISOString() };
    setNovaMessages(prev => [...prev, aiMessage]);
    setIsNovaLoading(false);
  }, [handleRunPayrollCycle, novaMessages]);

  const handleLedgerSendMessage = useCallback(async (message: string) => {
    setIsLedgerLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setLedgerMessages(prev => [...prev, userMessage]);
    
    const geminiResponse = await GeminiService.getAIAssistantResponse(ORACLE_LEDGER_PROMPT, message, ledgerMessages);

    const aiMessage: ChatMessage = { role: 'model', content: geminiResponse, timestamp: new Date().toISOString() };
    setLedgerMessages(prev => [...prev, aiMessage]);
    setIsLedgerLoading(false);
  }, [ledgerMessages]);


  return (
    <div className="bg-gray-900 text-gray-200 font-mono min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <Header onOpenManual={() => setIsManualOpen(true)} />
        <SystemStatus eventCount={liveEvents.length} journalCount={journalEntries.length} />

        <div className="my-6">
          <EmployeeManager
            employees={employees}
            onAdd={handleAddEmployee}
            onUpdate={handleUpdateEmployee}
            onDelete={handleDeleteEmployee}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Column 1: AI Agents */}
          <div className="flex flex-col gap-6">
            <AIAgentPanel
              title="NOVA-NACHA"
              description="NACHA Operations Executive"
              messages={novaMessages}
              onSendMessage={handleNovaSendMessage}
              isLoading={isNovaLoading}
            />
            <AIAgentPanel
              title="ORACLE-LEDGER"
              description="Ledgering Financial Officer"
              messages={ledgerMessages}
              onSendMessage={handleLedgerSendMessage}
              isLoading={isLedgerLoading}
            />
          </div>

          {/* Column 2: Events & Ledger */}
          <div className="flex flex-col gap-6">
            <LiveEventLog events={liveEvents} />
            <GeneralLedger entries={journalEntries} />
          </div>

          {/* Column 3: NACHA File */}
          <div className="lg:col-span-1">
            <NachaFileViewer content={nachaFile} />
          </div>
        </div>
      </div>
      <UserManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </div>
  );
};

export default App;