/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stock, AssetAllocation } from '../types';

export interface MonthlySimulationResult {
  month: number;
  year: number;
  investmentValue: number;
  totalContributed: number;
  byAsset: Record<string, number>;
}

export const DEFAULT_ALLOCATIONS: AssetAllocation[] = [
  { type: 'Stocks', ratio: 0.5, expectedGrowth: 0.175 },
  { type: 'Savings', ratio: 0.1, expectedGrowth: 0.07 },
  { type: 'Cash', ratio: 0.1, expectedGrowth: 0 },
  { type: 'Gold', ratio: 0.1, expectedGrowth: 0.06 },
  { type: 'USD', ratio: 0.1, expectedGrowth: 0.02 },
  // 10% remaining for "Other" to hit 100% or user can adjust. 
  // User sum was 90%, I'll stick to 90% as requested and see if I should add a filler.
];

export function simulateGrowth(
  monthlyInvestment: number,
  years: number,
  stocks: Stock[]
) {
  const months = years * 12;
  
  let totalContributed = 0;
  const assetBalances: Record<string, number> = {
    Stocks: 0,
    Savings: 0,
    Cash: 0,
    Gold: 0,
    USD: 0,
  };
  
  // Track individual stocks
  const stockBalances: Record<string, number> = {};
  stocks.forEach(s => stockBalances[s.symbol] = 0);

  const results: MonthlySimulationResult[] = [];

  for (let m = 1; m <= months; m++) {
    // 1. Distribute monthly investment to asset classes
    const monthlyToStocks = monthlyInvestment * 0.5;
    const monthlyToSavings = monthlyInvestment * 0.1;
    const monthlyToCash = monthlyInvestment * 0.1;
    const monthlyToGold = monthlyInvestment * 0.1;
    const monthlyToUSD = monthlyInvestment * 0.1;

    // 2. Growth for non-stock assets
    assetBalances.Savings = (assetBalances.Savings + monthlyToSavings) * (1 + Math.pow(1 + 0.07, 1/12) - 1);
    assetBalances.Cash = (assetBalances.Cash + monthlyToCash);
    assetBalances.Gold = (assetBalances.Gold + monthlyToGold) * (1 + Math.pow(1 + 0.06, 1/12) - 1);
    assetBalances.USD = (assetBalances.USD + monthlyToUSD) * (1 + Math.pow(1 + 0.02, 1/12) - 1);

    // 3. Growth for stocks (divided equally into 5)
    const stockContribution = monthlyToStocks / stocks.length;
    stocks.forEach(stock => {
      const stockRate = Math.pow(1 + stock.expectedAnnualGrowth, 1 / 12) - 1;
      stockBalances[stock.symbol] = (stockBalances[stock.symbol] + stockContribution) * (1 + stockRate);
    });

    assetBalances.Stocks = Object.values(stockBalances).reduce((a, b) => a + b, 0);
    
    const currentTotalValue = Object.values(assetBalances).reduce((a, b) => a + b, 0);
    totalContributed += monthlyInvestment;

    if (m % 12 === 0 || m === months) {
      results.push({
        month: m,
        year: Math.ceil(m / 12),
        investmentValue: currentTotalValue,
        totalContributed,
        byAsset: { ...assetBalances },
      });
    }
  }

  return results;
}

export function simulateGrowthSimple(
  monthlyInvestment: number,
  years: number,
  annualRate: number
) {
  const months = years * 12;
  const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;
  let balance = 0;
  const results: { year: number; value: number }[] = [];
  
  for (let m = 1; m <= months; m++) {
    balance = (balance + monthlyInvestment) * (1 + monthlyRate);
    if (m % 12 === 0 || m === months) {
      results.push({
        year: Math.ceil(m / 12),
        value: balance
      });
    }
  }
  return results;
}
