// src/demo/mockDatabase.ts
// Base de datos en memoria y persistente en cliente (Local/File-based DB) para Stampy.

export interface ReceiptRecord {
  id: string;
  name: string;
  category: string;
  amount: number;
  formattedAmount: string;
  status: string;
  time: string;
  mode: 'BUSINESS' | 'PERSONAL';
  isDeductible: boolean;
  taxAmount: number;
}

export interface FinancialMetrics {
  business: {
    cogsPercentage: number;
    payrollPercentage: number;
    primeCostTotal: number;
    primeCostStatus: string;
    totalExpenses: number;
    totalDeductibleTax: number;
  };
  personal: {
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    totalExpenses: number;
  };
}

export interface OwnersBridgeState {
  lastWithdrawalAmount: number;
  formattedWithdrawal: string;
  totalTransferredMonthly: number;
  status: string;
}

export const INITIAL_RECEIPTS: ReceiptRecord[] = [
  {
    id: 'rec-001',
    name: 'Central de Abastos S.A.',
    category: 'Insumo Cocina',
    amount: 1450.00,
    formattedAmount: '$1,450.00',
    status: '[ ✦ OK ]',
    time: 'Hoy 11:42 AM',
    mode: 'BUSINESS',
    isDeductible: true,
    taxAmount: 232.00,
  },
  {
    id: 'rec-002',
    name: 'CFE Suministrador Básicos',
    category: 'Gasto Fijo',
    amount: 3210.00,
    formattedAmount: '$3,210.00',
    status: '[ ✦ OK ]',
    time: 'Ayer 04:15 PM',
    mode: 'BUSINESS',
    isDeductible: true,
    taxAmount: 513.60,
  },
  {
    id: 'rec-003',
    name: 'Gasolinera Shell #402',
    category: 'Operativo',
    amount: 850.00,
    formattedAmount: '$850.00',
    status: '[ ✦ OK ]',
    time: '02 Oct 09:30 AM',
    mode: 'BUSINESS',
    isDeductible: true,
    taxAmount: 136.00,
  },
  {
    id: 'rec-004',
    name: 'Supermercado Central',
    category: 'Despensa Personal',
    amount: 620.00,
    formattedAmount: '$620.00',
    status: '[ ✦ OK ]',
    time: '01 Oct 07:15 PM',
    mode: 'PERSONAL',
    isDeductible: false,
    taxAmount: 0,
  },
  {
    id: 'rec-005',
    name: 'Farmacia San Jorge',
    category: 'Salud & Bienestar',
    amount: 340.50,
    formattedAmount: '$340.50',
    status: '[ ✦ OK ]',
    time: '30 Sep 02:20 PM',
    mode: 'PERSONAL',
    isDeductible: false,
    taxAmount: 0,
  },
];

class MockDatabase {
  private receipts: ReceiptRecord[] = [...INITIAL_RECEIPTS];
  private bridge: OwnersBridgeState = {
    lastWithdrawalAmount: 25000.00,
    formattedWithdrawal: '$25,000.00 MXN',
    totalTransferredMonthly: 50000.00,
    status: 'Atómico',
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('stampy_demo_receipts');
        if (stored) {
          this.receipts = JSON.parse(stored);
        }
      } catch {
        // Fallback to initial receipts
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('stampy_demo_receipts', JSON.stringify(this.receipts));
      } catch {
        // Ignore storage errors in sandbox
      }
    }
  }

  public getAllReceipts(): ReceiptRecord[] {
    return [...this.receipts];
  }

  public getReceiptsByMode(mode: 'BUSINESS' | 'PERSONAL'): ReceiptRecord[] {
    return this.receipts.filter((r) => r.mode === mode);
  }

  public insertReceipt(item: Omit<ReceiptRecord, 'id' | 'formattedAmount' | 'taxAmount'>): ReceiptRecord {
    const formattedAmount = `$${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    const taxAmount = item.isDeductible ? +(item.amount * 0.16).toFixed(2) : 0;

    const newRecord: ReceiptRecord = {
      ...item,
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      formattedAmount,
      taxAmount,
    };

    this.receipts = [newRecord, ...this.receipts];
    this.saveToStorage();
    return newRecord;
  }

  public getMetrics(): FinancialMetrics {
    const bizReceipts = this.getReceiptsByMode('BUSINESS');
    const persReceipts = this.getReceiptsByMode('PERSONAL');

    const totalBiz = bizReceipts.reduce((acc, r) => acc + r.amount, 0);
    const totalDeductibleTax = bizReceipts
      .filter((r) => r.isDeductible)
      .reduce((acc, r) => acc + r.taxAmount, 0);

    const totalPers = persReceipts.reduce((acc, r) => acc + r.amount, 0);

    return {
      business: {
        cogsPercentage: 31.4,
        payrollPercentage: 22.8,
        primeCostTotal: 54.2,
        primeCostStatus: '✓ Bajo control',
        totalExpenses: totalBiz,
        totalDeductibleTax,
      },
      personal: {
        needsPercentage: 48.5,
        wantsPercentage: 28.0,
        savingsPercentage: 23.5,
        totalExpenses: totalPers,
      },
    };
  }

  public getBridgeState(): OwnersBridgeState {
    return { ...this.bridge };
  }

  public resetDatabase() {
    this.receipts = [...INITIAL_RECEIPTS];
    this.saveToStorage();
  }
}

export const mockDb = new MockDatabase();
export default mockDb;
