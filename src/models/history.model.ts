
export interface FinanceRecord {
  id: string;
  month: string; // YYYY-MM
  income: number;
  totalExpense: number;
  balance: number;
  aiAdvice: string;
  breakdown: { category: string; amount: number }[];
  timestamp: number;
}
