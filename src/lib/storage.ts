/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FinancialRecord } from '../types';

const STORAGE_KEY = 'finflow_records';
const SETTINGS_KEY = 'finflow_settings';

export const storage = {
  getRawRecords: (): FinancialRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getSettings: () => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveSettings: (settings: any) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getRecords: (): FinancialRecord[] => {
    const rawRecords = storage.getRawRecords();
    const expandedRecords: FinancialRecord[] = [];
    const now = new Date();
    const nowTime = now.getTime();
    const todayStr = now.toISOString().split('T')[0];

    rawRecords.forEach(record => {
      expandedRecords.push(record);
      
      if (record.isFixed) {
        // record.date is "YYYY-MM-DD"
        let startDate = new Date(record.date);
        const targetDay = startDate.getUTCDate();
        let current = new Date(startDate.getTime());
        
        const actualLimit = record.recurringUntil ? new Date(record.recurringUntil) : now;
        const limitStr = actualLimit.toISOString().split('T')[0];

        while (true) {
          // Move to next month safely
          const next = new Date(current.getTime());
          next.setUTCMonth(next.getUTCMonth() + 1);
          
          // Handle day-of-month overflow (e.g., Jan 31 -> Feb 28/29)
          // If the day changed, it means it wrapped to the next month's beginning
          if (next.getUTCDate() !== targetDay) {
            next.setUTCDate(0); // Set to last day of the intended month
          }
          
          const nextStr = next.toISOString().split('T')[0];
          if (nextStr > limitStr) break;

          expandedRecords.push({
            ...record,
            id: `${record.id}-recur-${next.getTime()}`,
            date: nextStr,
            isVirtual: true,
          } as any);
          current = next;
        }
      }
    });

    return expandedRecords.sort((a, b) => b.date.localeCompare(a.date));
  },

  saveRecord: (record: Omit<FinancialRecord, 'id' | 'userId' | 'createdAt'>): FinancialRecord => {
    const records = storage.getRawRecords();
    const newRecord: FinancialRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      userId: 'local-user',
      createdAt: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...records, newRecord]));
    return newRecord;
  },

  deleteRecord: (id: string) => {
    const records = storage.getRawRecords();
    // If it's a virtual record, we can't delete it directly, but the UI should show the parent.
    // For simplicity, if ID contains '-recur-', we don't delete. 
    // In a real app we'd handle "delete this or all occurrences".
    const realId = id.split('-recur-')[0];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.filter(r => r.id !== realId)));
  },
  
  getMonthlyTotals: () => {
    const records = storage.getRecords();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthStr = now.toISOString().slice(0, 7); // "YYYY-MM"

    const totals = {
      income: 0,
      expense: 0,
      net: 0,
      allTimeIncome: 0,
      allTimeExpense: 0
    };

    records.forEach(r => {
      // Overall totals should only count records that have actually occurred (past or today)
      if (r.date <= todayStr) {
        if (r.type === 'income') totals.allTimeIncome += r.amount;
        else totals.allTimeExpense += r.amount;
      }

      if (r.date.startsWith(currentMonthStr)) {
        if (r.type === 'income') totals.income += r.amount;
        else totals.expense += r.amount;
      }
    });

    totals.net = totals.income - totals.expense;
    return totals;
  },

  getAnalysisData: () => {
    const records = storage.getRecords();
    const monthlyGroups: Record<string, { income: number; expense: number }> = {};
    
    records.forEach(r => {
      const month = r.date.slice(0, 7); // YYYY-MM
      if (!monthlyGroups[month]) {
        monthlyGroups[month] = { income: 0, expense: 0 };
      }
      if (r.type === 'income') {
        monthlyGroups[month].income += r.amount;
      } else {
        monthlyGroups[month].expense += r.amount;
      }
    });

    const chartData = Object.entries(monthlyGroups)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-5); // Last 5 months as in screenshot

    return {
      monthlyHistory: chartData,
      records
    };
  }
};
