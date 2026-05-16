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
  { type: 'Savings', ratio: 0.1, expectedGrowth: 0.07 },
  { type: 'Cash', ratio: 0.2, expectedGrowth: 0 },
  { type: 'Gold', ratio: 0.1, expectedGrowth: 0.06 },
  { type: 'USD', ratio: 0.1, expectedGrowth: 0.02 },
];

/**
 * Enhanced simulation engine for investment growth.
 * Uses Monthly Compounding: New Balance = (Current Balance + Monthly Investment) * (1 + Monthly Rate)
 * Monthly Rate = Annual CAGR / 12
 * 
 * Logic validation: 
 * Monthly: 1.2M, Rate: 18% (0.18)
 * 10 Years: ~400M
 * 30 Years: ~17B
 */
export function simulateGrowth(
  monthlyInvestment: number,
  years: number,
  stocks: Stock[]
) {
  const months = years * 12;
  
  // Track balances for each asset category
  const assetBalances: Record<string, number> = {
    Stocks: 0,
    Savings: 0,
    Cash: 0,
    Gold: 0,
    USD: 0,
  };

  // Internal rates (Annual / 12)
  const rates = {
    Savings: 0.07 / 12,
    Cash: 0,
    Gold: 0.06 / 12,
    USD: 0.02 / 12
  };

  // Track individual stocks
  const stockBalances: Record<string, number> = {};
  stocks.forEach(s => {
    stockBalances[s.symbol] = 0;
  });

  let totalContributed = 0;
  const results: MonthlySimulationResult[] = [];

  for (let m = 1; m <= months; m++) {
    // 1. Distribute monthly investment to asset classes (Total = 100% per video)
    const monthlyToStocks = monthlyInvestment * 0.50;
    const monthlyToSavings = monthlyInvestment * 0.10;
    const monthlyToCash = monthlyInvestment * 0.20;
    const monthlyToGold = monthlyInvestment * 0.10;
    const monthlyToUSD = monthlyInvestment * 0.10;

    // 2. Apply monthly interest then Add monthly contribution
    // Formula per image: balance = (balance * (1 + r)) + contribution
    // This matches FV = P * [(1+r)^n - 1] / r
    
    assetBalances.Savings = (assetBalances.Savings * (1 + rates.Savings)) + monthlyToSavings;
    assetBalances.Cash = (assetBalances.Cash + monthlyToCash); // 0 growth
    assetBalances.Gold = (assetBalances.Gold * (1 + rates.Gold)) + monthlyToGold;
    assetBalances.USD = (assetBalances.USD * (1 + rates.USD)) + monthlyToUSD;

    // 3. Growth for stocks (divided equally among provided stocks)
    if (stocks.length > 0) {
      const stockContribution = monthlyToStocks / stocks.length;
      stocks.forEach(stock => {
        // Force normalization: 18 -> 0.18, 0.18 -> 0.18
        let annualGrowth = stock.expectedAnnualGrowth;
        if (annualGrowth > 1) annualGrowth = annualGrowth / 100;
        
        const stockMonthlyRate = annualGrowth / 12;
        // Formula per image: balance = (balance * (1 + r)) + contribution
        stockBalances[stock.symbol] = (stockBalances[stock.symbol] * (1 + stockMonthlyRate)) + stockContribution;
      });
      assetBalances.Stocks = Object.values(stockBalances).reduce((a, b) => a + b, 0);
    } else {
      // Default stock growth (18%) if no stocks selected
      const defaultStockMonthlyRate = 0.18 / 12;
      assetBalances.Stocks = (assetBalances.Stocks * (1 + defaultStockMonthlyRate)) + monthlyToStocks;
    }

    const currentTotalValue = Object.values(assetBalances).reduce((a, b) => a + b, 0);
    totalContributed += monthlyInvestment;

    // Record results at the end of each year and the final month
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
 * Simplified growth simulation for validation.
 * Formula: New Balance = (Current Balance + Monthly Investment) * (1 + Monthly Rate)
 */
export function simulateGrowthSimple(
  monthlyInvestment: number,
  years: number,
  annualRate: number
) {
  const months = years * 12;
  
  // Normalize rate: 18 -> 0.18, 0.18 -> 0.18
  let rate = annualRate;
  if (rate > 1) rate = rate / 100;
  
  const monthlyRate = rate / 12;
  
  let balance = 0;
  const results: { year: number; value: number }[] = [];
  
  for (let m = 1; m <= months; m++) {
    // Formula per image: balance = (balance * (1 + r)) + contribution
    // This matches FV = P * [(1+r)^n - 1] / r
    balance = (balance * (1 + monthlyRate)) + monthlyInvestment;
    
    if (m % 12 === 0 || m === months) {
      results.push({
        year: Math.ceil(m / 12),
        value: balance
      });
    }
  }
  return results;
}
