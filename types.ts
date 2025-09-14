
export interface EmployeeBank {
  employeeId: number;
  name: string;
  individualId: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  payPreference: 'ACH' | 'ONCHAIN';
}

export interface PayoutEvent {
  id: string; // transaction hash
  employeeId: number;
  wallet: string;
  token: string;
  amountBaseUnits: string;
  payTime: number; // unix timestamp
}

export interface JournalEntry {
  ts: string;
  memo: string;
  lines: {
    account: string;
    dc: 'D' | 'C';
    amountCents: number;
    entity: 'TRUST' | 'LLC';
  }[];
}

export interface NachaEntry {
    transactionCode: "22" | "32"; // Checking Credit | Savings Credit
    rdfiRouting: string; // 9 digits
    dfiAccount: string; // up to 17
    amountCents: number; // integer cents
    individualId: string; // 15
    individualName: string; // 22
    addenda: 0;
    traceSeq: number; // 7-digit seq
}

export interface NachaBatch {
    companyName: string;
    companyId: string;
    entryDesc: string; // e.g. PAYROLL
    effectiveDateYYMMDD: string;
    odfiId8: string; // first 8 digits of ODFI
    serviceClass: "200"; // credits only
    secCode: "PPD";
    entries: NachaEntry[];
}

export interface NachaFileHeader {
    immediateDest: string; // 10 chars: " " + routing(9)
    immediateOrigin: string; // 10 chars
    destName: string; // 23
    originName: string; // 23
    fileIdMod: string; // A..Z
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: string;
}
