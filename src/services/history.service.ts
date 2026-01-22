
import { Injectable, signal, effect } from '@angular/core';
import { FinanceRecord } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'finance_ai_history';
  
  // Signal to hold the history list
  history = signal<FinanceRecord[]>([]);

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Sort by month descending
        parsed.sort((a: FinanceRecord, b: FinanceRecord) => b.month.localeCompare(a.month));
        this.history.set(parsed);
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }

  saveRecord(record: FinanceRecord) {
    this.history.update(current => {
      // Remove existing record for the same month if exists to update it
      const filtered = current.filter(r => r.month !== record.month);
      const updated = [record, ...filtered];
      // Sort again just in case
      updated.sort((a, b) => b.month.localeCompare(a.month));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  deleteRecord(id: string) {
    this.history.update(current => {
      const updated = current.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.history.set([]);
  }
}
