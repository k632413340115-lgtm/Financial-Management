/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Info, Settings2, RefreshCcw } from 'lucide-react';
import { VIETNAMESE_STOCKS, SIMULATION_PERIODS } from '../constants';
import { simulateGrowth } from '../lib/simulationEngine';
import { formatVND, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Stock } from '../types';

interface InvestmentViewProps {
  monthlyNetCashFlow: number;
  ratio: number;
  setRatio: (val: number) => void;
  expectedCAGR: number;
  setExpectedCAGR: (val: number) => void;
  stocks: Stock[];
  setStocks: (val: Stock[]) => void;
}

const ASSET_CLASSES = [
  { name: 'Stocks', ratio: 0.5, color: '#f87171' },
  { name: 'Savings', ratio: 0.1, color: '#16a34a' },
  { name: 'Gold', ratio: 0.1, color: '#eab308' },
  { name: 'USD', ratio: 0.1, color: '#2563eb' },
  { name: 'Cash', ratio: 0.1, color: '#64748b' },
];

export const InvestmentView: React.FC<InvestmentViewProps> = ({ 
  monthlyNetCashFlow,
  ratio,
  setRatio,
  expectedCAGR,
  setExpectedCAGR,
  stocks,
  setStocks
}) => {
  const [isEditingStocks, setIsEditingStocks] = React.useState(false);

  const monthlyInvestment = Math.max(0, monthlyNetCashFlow * ratio);
  
  const simulationData = React.useMemo(() => {
    // Apply expectedCAGR to all stocks for the simulation
    const adjustedStocks = stocks.map(s => ({ ...s, expectedAnnualGrowth: expectedCAGR }));
    const rawData = simulateGrowth(monthlyInvestment, 30, adjustedStocks);
    
    // Flatten byAsset for Recharts
    return rawData.map(d => ({
      ...d,
      ...d.byAsset
    }));
  }, [monthlyInvestment, stocks, expectedCAGR]);

  const milestones = SIMULATION_PERIODS.map(years => {
    const data = simulationData.find(d => d.year === years);
    return {
      years,
      value: data?.investmentValue || 0,
      contributed: data?.totalContributed || 0,
      label: years === 30 ? 'FINANCIAL FREEDOM' : years === 10 ? 'CONSERVATIVE MILESTONE' : 'COMPOUNDED GROWTH'
    };
  });

  const handleStockChange = (index: number, field: keyof Stock, value: string | number) => {
    const newStocks = [...stocks];
    newStocks[index] = { ...newStocks[index], [field]: value };
    setStocks(newStocks);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-700">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Side: Parameters & Allocation */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <section className="bg-primary p-4 rounded-lg text-secondary flex flex-col gap-3 shadow-lg">
            <div className="flex justify-between items-center border-b border-secondary/20 pb-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Strategy Parameters</h2>
              <button 
                onClick={() => setIsEditingStocks(!isEditingStocks)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Edit Stock Portfolio"
              >
                <Settings2 size={12} />
              </button>
            </div>
            
            <div>
              <div className="flex justify-between text-[11px] mb-2 font-bold italic">
                <span>Net Cash Flow Investment Ratio</span>
                <span>{Math.round(ratio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.5"
                step="0.01"
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className="w-full h-1 bg-secondary/30 rounded-full appearance-none cursor-pointer accent-secondary"
              />
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-[11px] mb-1 font-bold italic">
                <span>EXPECTED CAGR</span>
                <span className="text-secondary font-black">{Math.round(expectedCAGR * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.2"
                step="0.005"
                value={expectedCAGR}
                onChange={(e) => setExpectedCAGR(Number(e.target.value))}
                className="w-full h-1 bg-secondary/30 rounded-full appearance-none cursor-pointer accent-secondary"
              />
              <div className="text-[7px] uppercase font-bold opacity-60 tracking-wider mt-1">Equity Market Growth Rate (15% - 20%)</div>
            </div>

            <div className="mt-2 space-y-2">
              <div className="text-[9px] uppercase font-bold opacity-60 tracking-widest leading-none">Asset Class Allocation (90% Requested)</div>
              <div className="h-2 w-full flex rounded-full overflow-hidden border border-white/10">
                {ASSET_CLASSES.map(asset => (
                  <div 
                    key={asset.name} 
                    style={{ width: `${(asset.ratio / 0.9) * 100}%`, backgroundColor: asset.color }} 
                    title={asset.name}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                 {ASSET_CLASSES.map(asset => (
                   <div key={asset.name} className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span className="text-[8px] font-bold uppercase">{asset.name} ({asset.ratio * 100}%)</span>
                   </div>
                 ))}
              </div>
            </div>
          </section>

          <section className="density-card bg-white h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-bold text-primary uppercase">Equity Concentration (20% Each)</h3>
              {isEditingStocks && (
                <button 
                  onClick={() => setStocks(VIETNAMESE_STOCKS)}
                  className="text-[8px] font-bold text-gray-400 hover:text-primary flex items-center gap-1"
                >
                  <RefreshCcw size={8} /> RESET
                </button>
              )}
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {stocks.map((stock, idx) => (
                 <div key={idx} className="p-2 bg-gray-50 rounded border border-primary/5 transition-all hover:border-primary/20">
                    {isEditingStocks ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          className="density-input text-[10px] py-1" 
                          value={stock.symbol} 
                          onChange={(e) => handleStockChange(idx, 'symbol', e.target.value.toUpperCase())}
                          placeholder="SYMB"
                        />
                        <input 
                          type="number"
                          className="density-input text-[10px] py-1" 
                          value={stock.expectedAnnualGrowth} 
                          onChange={(e) => handleStockChange(idx, 'expectedAnnualGrowth', Number(e.target.value))}
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-[10px] font-bold text-primary">{stock.symbol}</div>
                          <div className="text-[8px] text-gray-400 truncate w-32 uppercase font-medium">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-green-700">+{Math.round(stock.expectedAnnualGrowth * 100)}%</div>
                          <div className="text-[8px] text-gray-400 font-bold uppercase">CAGR</div>
                        </div>
                      </div>
                    )}
                 </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Data Grid */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <section className="bg-white p-4 border border-primary/10 rounded shadow-sm h-[320px]">
            <h3 className="text-[10px] font-bold text-primary uppercase mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Wealth Projection Terminal
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={simulationData}>
                <defs>
                  {ASSET_CLASSES.map(asset => (
                    <linearGradient key={`grad-${asset.name}`} id={`color-${asset.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={asset.color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={asset.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fill: '#999', fontWeight: 600}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  tick={{fontSize: 9, fill: '#999'}}
                />
                <Tooltip 
                   contentStyle={{ 
                     borderRadius: '8px', 
                     border: '1px solid #e5e7eb', 
                     backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                     fontSize: '10px',
                     fontWeight: 'bold',
                     boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                     backdropFilter: 'blur(4px)'
                   }}
                   itemStyle={{ padding: '2px 0' }}
                   formatter={(v: number, name: string) => [new Intl.NumberFormat('vi-VN').format(Math.round(v)) + ' VND', name]}
                   labelFormatter={(label) => `Year ${label} Distribution`}
                />
                {ASSET_CLASSES.slice().reverse().map(asset => (
                  <Area 
                    key={asset.name}
                    type="monotone" 
                    dataKey={asset.name} 
                    stackId="1"
                    stroke={asset.color} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#color-${asset.name})`} 
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </section>

          <div className="grid grid-cols-3 gap-3">
            {milestones.map((m, idx) => (
              <div 
                key={m.years}
                className={cn(
                  "p-3 rounded border flex flex-col gap-1 transition-all hover:scale-[1.02]",
                  idx === 2 ? "bg-primary text-secondary border-transparent shadow-lg" : "bg-gray-50 border-primary/10"
                )}
              >
                <div className="flex justify-between items-center overflow-hidden">
                  <span className="text-[8px] font-bold uppercase truncate">{m.years}y {m.label}</span>
                </div>
                <div className="text-lg font-black truncate">
                  {new Intl.NumberFormat('vi-VN').format(m.value)}
                </div>
                <div className="text-[8px] opacity-60 uppercase tracking-widest font-bold">
                  Contribution Total: {new Intl.NumberFormat('vi-VN').format(m.contributed)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Portfolio Allocation section */}
      <section className="mt-4 p-6 bg-white/40 rounded-lg border border-primary/5 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">Simulated Portfolio Allocation (Top Equities)</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#74070E]/40 mt-1">Capital Distribution Analysis</p>
          </div>
          <button 
            onClick={() => setIsEditingStocks(!isEditingStocks)}
            className="flex items-center gap-2 border border-primary/20 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm"
          >
            <Settings2 size={12} /> Configure Equities
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stocks.map((stock, idx) => (
            <div key={idx} className="bg-white/60 p-5 rounded-lg border border-primary/10 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-2 group hover:border-[#74070E]/30 min-h-[140px]">
              <div>
                 <div className="text-[12px] font-black text-[#74070E] tracking-widest uppercase">{stock.symbol}</div>
                 <div className="text-[7px] text-[#74070E]/40 font-black uppercase tracking-tighter mt-0.5">{stock.name}</div>
              </div>
              
              <div className="mt-3">
                <div className="text-[14px] font-black text-primary">
                  {new Intl.NumberFormat('vi-VN').format(Math.round((monthlyInvestment * 0.5) / stocks.length))} VND
                </div>
                <div className="text-[7px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Monthly Lot</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
