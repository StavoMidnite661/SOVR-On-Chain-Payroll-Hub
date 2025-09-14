import type { PayoutEvent, JournalEntry, NachaEntry, NachaBatch, NachaFileHeader, EmployeeBank } from '../types';

// Helper functions for NACHA file generation
const padLeft = (s: string, len: number, ch: string = "0"): string => s.padStart(len, ch);
const padRight = (s: string, len: number, ch: string = " "): string => s.padEnd(len, ch);

const mapAccountTypeCode = (type: 'CHECKING' | 'SAVINGS'): '22' | '32' => {
  return type === 'CHECKING' ? '22' : '32';
};

export class SimulationService {
  private eventInterval: number | null = null;
  private pendingEvents: PayoutEvent[] = [];
  private onNewEventCallback: (event: PayoutEvent) => void;
  private onNewJournalEntryCallback: (entry: JournalEntry) => void;
  private traceSeq: number = 1;
  private employees: EmployeeBank[] = [];

  constructor(
    onNewEvent: (event: PayoutEvent) => void,
    onNewJournalEntry: (entry: JournalEntry) => void
  ) {
    this.onNewEventCallback = onNewEvent;
    this.onNewJournalEntryCallback = onNewJournalEntry;
  }

  public updateEmployees(employees: EmployeeBank[]): void {
    this.employees = employees;
  }

  public startEventStream(): void {
    this.stopEventStream(); // Ensure no multiple intervals running
    this.eventInterval = window.setInterval(() => {
      const achEmployees = this.employees.filter(e => e.payPreference === 'ACH');
      if (achEmployees.length === 0) return;
      const randomEmployee = achEmployees[Math.floor(Math.random() * achEmployees.length)];
      
      const event: PayoutEvent = {
        id: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        employeeId: randomEmployee.employeeId,
        wallet: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        token: '0xUSDC_ADDRESS',
        amountBaseUnits: String(Math.floor(Math.random() * (5000 - 1000) + 1000) * 1000000), // 1000-5000 USDC
        payTime: Math.floor(Date.now() / 1000),
      };
      
      this.pendingEvents.push(event);
      this.onNewEventCallback(event);
    }, 5000);
  }

  public stopEventStream(): void {
    if (this.eventInterval) {
      clearInterval(this.eventInterval);
      this.eventInterval = null;
    }
  }

  public clearPendingEvents(): void {
      this.pendingEvents = [];
  }

  private convertToCents(amountBaseUnits: string): number {
    const decimals = 6; // Assuming 6 decimals for USDC
    const asBig = BigInt(amountBaseUnits);
    const cents = (asBig * 100n) / (10n ** BigInt(decimals));
    return Number(cents);
  }

  public async processPendingPayouts(): Promise<{
    processedEvents: PayoutEvent[],
    batchEntries: NachaEntry[]
  }> {
    const batchEntries: NachaEntry[] = [];
    const processedEvents = [...this.pendingEvents];

    for (const event of processedEvents) {
      const bankInfo = this.employees.find(e => e.employeeId === event.employeeId);
      if (!bankInfo || bankInfo.payPreference !== 'ACH') {
        continue;
      }

      const amountCents = this.convertToCents(event.amountBaseUnits);

      batchEntries.push({
        transactionCode: mapAccountTypeCode(bankInfo.accountType),
        rdfiRouting: bankInfo.routingNumber,
        dfiAccount: bankInfo.accountNumber,
        amountCents: amountCents,
        individualId: bankInfo.individualId,
        individualName: bankInfo.name.toUpperCase().slice(0, 22),
        addenda: 0,
        traceSeq: this.traceSeq++,
      });

      const journalEntry: JournalEntry = {
        ts: new Date().toISOString(),
        memo: `Payroll ACH queued for employee #${event.employeeId}`,
        lines: [
          { account: "6000-Payroll-Expense", dc: "D", amountCents, entity: "LLC" },
          { account: "2100-ACH-Clearing", dc: "C", amountCents, entity: "LLC" },
        ],
      };
      this.onNewJournalEntryCallback(journalEntry);
    }
    return { processedEvents, batchEntries };
  }

  public buildNachaFile(batchEntries: NachaEntry[]): { nachaFile: string, tag: string } {
    const now = new Date();
    const fileDate = `${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const fileTime = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const tag = `${fileDate}_${fileTime}`;
    const effectiveDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const effectiveDateYYMMDD = `${effectiveDate.getFullYear().toString().slice(2)}${(effectiveDate.getMonth() + 1).toString().padStart(2, '0')}${effectiveDate.getDate().toString().padStart(2, '0')}`;
    
    const hdr: NachaFileHeader = {
        immediateDest: " 123456789",
        immediateOrigin: "9876543210",
        destName: "YOUR ODFI BANK",
        originName: "SOVR DEV HOLDINGS LLC",
        fileIdMod: "A",
    };

    const batch: NachaBatch = {
        companyName: "SOVR DEV HOLDINGS",
        companyId: "1234567890",
        entryDesc: "PAYROLL",
        effectiveDateYYMMDD: effectiveDateYYMMDD,
        odfiId8: "12345678",
        serviceClass: "200",
        secCode: "PPD",
        entries: batchEntries
    };

    const records: string[] = [];

    records.push([
        "1", "01", padRight(hdr.immediateDest, 10), padRight(hdr.immediateOrigin, 10),
        fileDate, fileTime, hdr.fileIdMod, "094", "10", "1",
        padRight(hdr.destName, 23), padRight(hdr.originName, 23), padRight("", 8)
    ].join(""));
    
    records.push([
        "5", batch.serviceClass, padRight(batch.companyName, 16), padRight("", 20),
        padRight(batch.companyId, 10), batch.secCode, padRight(batch.entryDesc, 10),
        padRight("", 6), batch.effectiveDateYYMMDD, "   ", "1", padLeft(batch.odfiId8, 8),
        padLeft(String(1), 7)
    ].join(""));

    let batchEntryCount = 0;
    let batchHash = 0;
    let batchCredits = 0;

    for (const e of batch.entries) {
        batchEntryCount++;
        const rdfi8 = e.rdfiRouting.slice(0, 8);
        const checkDigit = e.rdfiRouting.slice(8, 9);
        const amount = padLeft(String(e.amountCents), 10);
        const trace = padLeft(batch.odfiId8, 8) + padLeft(String(e.traceSeq), 7);
        
        records.push([
            "6", e.transactionCode, rdfi8, checkDigit, padRight(e.dfiAccount, 17), amount,
            padRight(e.individualId, 15), padRight(e.individualName, 22), "0", trace
        ].join(""));

        batchHash += parseInt(rdfi8, 10);
        batchCredits += e.amountCents;
    }

    records.push([
        "8", batch.serviceClass, padLeft(String(batchEntryCount), 6),
        padLeft(String(batchHash % (10**10)), 10),
        padLeft(String(0), 12),
        padLeft(String(batchCredits), 12),
        padRight(batch.companyId, 10), padRight("", 19), padLeft(batch.odfiId8, 8),
        padLeft(String(1), 7)
    ].join(""));

    const totalEntries = batchEntryCount;
    const batchCount = 1;
    let recordCount = records.length;
    
    while ((recordCount + 1) % 10 !== 0) {
        records.push(padRight("9", 94, "9"));
        recordCount++;
    }

    const blocks = (recordCount + 1) / 10;

    records.push([
        "9", padLeft(String(batchCount), 6), padLeft(String(blocks), 6),
        padLeft(String(totalEntries), 8), padLeft(String(batchHash % (10**10)), 10),
        padLeft(String(0), 12),
        padLeft(String(batchCredits), 12),
        padRight("", 39)
    ].join(""));

    return { nachaFile: records.join("\n") + "\n", tag };
  }
}