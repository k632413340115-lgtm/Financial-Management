/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FinancialRecord {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  name: string;
  notes?: string;
  isFixed?: boolean;
  recurringUntil?: string;
  createdAt: number;
}

export interface Stock {
  symbol: string;
  name: string;
  expectedAnnualGrowth: number;
  description: string;
}

export interface AssetAllocation {
  type: 'Stocks' | 'Savings' | 'Cash' | 'Gold' | 'USD';
  ratio: number;
  expectedGrowth: number;
}

export interface SimulationSummary {
  year: number;
  totalAssets: number;
  investedAmount: number;
  growth: number;
}
