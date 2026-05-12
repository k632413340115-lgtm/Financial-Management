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
  { type: 'Stocks', ratio: 0.5, expectedGrowth: 0.18 },
  { type: 'Savings', ratio: 0.2, expectedGrowth: 0.07 },
  { type: 'Cash', ratio: 0.1, expectedGrowth: 0 },
  { type: 'Gold', ratio: 0.1, expectedGrowth: 0.06 },
  { type: 'USD', ratio: 0.1, expectedGrowth: 0.02 },
];

/**
 * Enhanced simulation engine for investment growth.
 * Uses Monthly Compounding: New Balance = (Current Balance + Monthly Investment) * (1 + Monthly Rate)
 * Monthly Rate = Annual CAGR / 12
 */
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
    // 1. Distribute monthly investment to asset classes (100% allocation)
    const monthlyToStocks = monthlyInvestment * 0.5;
    const monthlyToSavings = monthlyInvestment * 0.2;
    const monthlyToCash = monthlyInvestment * 0.1;
    const monthlyToGold = monthlyInvestment * 0.1;
    const monthlyToUSD = monthlyInvestment * 0.1;

    // 2. Growth for non-stock assets (Annual CAGR / 12)
    assetBalances.Savings = (assetBalances.Savings + monthlyToSavings) * (1 + 0.07 / 12);
    assetBalances.Cash = (assetBalances.Cash + monthlyToCash); // Cash has 0 growth
    assetBalances.Gold = (assetBalances.Gold + monthlyToGold) * (1 + 0.06 / 12);
    assetBalances.USD = (assetBalances.USD + monthlyToUSD) * (1 + 0.02 / 12);

    // 3. Growth for stocks (divided equally among provided stocks)
    if (stocks.length > 0) {
      const stockContribution = monthlyToStocks / stocks.length;
      stocks.forEach(stock => {
        // Validation: If Rate is > 1 (e.g. 18), divide by 100 to get decimal
        const cagr = stock.expectedAnnualGrowth > 1 ? stock.expectedAnnualGrowth / 100 : stock.expectedAnnualGrowth;
        const monthlyRate = cagr / 12;
        stockBalances[stock.symbol] = (stockBalances[stock.symbol] + stockContribution) * (1 + monthlyRate);
      });
      assetBalances.Stocks = Object.values(stockBalances).reduce((a, b) => a + b, 0);
    } else {
      // If no stocks provided, treat stock portion as cash
      assetBalances.Cash += monthlyToStocks;
      assetBalances.Stocks = 0;
    }

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

/**
 * Simplified growth simulation for validation or quick checks.
 * Monthly Compounding: New Balance = (Current Balance + Monthly Investment) * (1 + Monthly Rate)
 */
export function simulateGrowthSimple(
  monthlyInvestment: number,
  years: number,
  annualRate: number
) {
  const months = years * 12;
  // Validation: If Rate is > 1 (e.g. 18), divide by 100
  const cagr = annualRate > 1 ? annualRate / 100 : annualRate;
  const monthlyRate = cagr / 12;
  
  let balance = 0;
  const results: { year: number; value: number }[] = [];
  
  for (let m = 1; m <= months; m++) {
    // Calculation Loop: New Balance = (Current Balance + Monthly Investment) * (1 + Monthly Rate)
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
