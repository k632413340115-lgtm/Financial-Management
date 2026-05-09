/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stock } from './types';

export const COLORS = {
  primary: '#74070E', // Deep Red
  secondary: '#F4E3B2', // Cream/Gold
  accent: '#A52A2A',
  success: '#16a34a',
  error: '#dc2626',
  background: '#FDFCF8',
};

export const VIETNAMESE_STOCKS: Stock[] = [
  {
    symbol: 'VNM',
    name: 'Vinamilk',
    expectedAnnualGrowth: 0.15,
    description: 'Vietnam Dairy Products JSC',
  },
  {
    symbol: 'FPT',
    name: 'FPT Corporation',
    expectedAnnualGrowth: 0.18,
    description: 'Technology and Telecommunications',
  },
  {
    symbol: 'HPG',
    name: 'Hoa Phat Group',
    expectedAnnualGrowth: 0.16,
    description: 'Steel and Industrial Production',
  },
  {
    symbol: 'VCB',
    name: 'Vietcombank',
    expectedAnnualGrowth: 0.17,
    description: 'Joint Stock Commercial Bank for Foreign Trade of Vietnam',
  },
  {
    symbol: 'VIC',
    name: 'Vingroup',
    expectedAnnualGrowth: 0.19,
    description: 'Conglomerate - Real Estate, Tech, Industry',
  },
];

export const SIMULATION_PERIODS = [10, 20, 30];
export const INVESTMENT_RATIO_MIN = 0.3;
export const INVESTMENT_RATIO_MAX = 0.5;
export const DEFAULT_ANNUAL_GROWTH = 0.175; // Average of 15-20%
