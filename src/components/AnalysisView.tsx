/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { Activity, Info, BarChart2, TrendingUp, Shield, Cpu, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { simulateGrowthSimple } from '../lib/simulationEngine';
import { VIETNAMESE_STOCKS } from '../constants';
import { cn, formatVND } from '../lib/utils';

interface AnalysisViewProps {
  ratio: number;
  actualAllocations: { name: string; actual: number; target: number; color: string }[];
  setActualAllocations: (val: { name: string; actual: number; target: number; color: string }[]) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ ratio, actualAllocations, setActualAllocations }) => {
  const data = storage.getAnalysisData();
  const totals = storage.getMonthlyTotals();
  const expectedCAGR = 0.18;
  
  const totalWealth = totals.allTimeIncome - totals.allTimeExpense;
  const savingsRatio = totals.income > 0 ? (totals.net / totals.income) * 100 : 0;
  // Investment power: Ratio of Net Flow to Income (normalized)
  const investPower = totals.income > 0 ? (totals.net / totals.income).toFixed(1) : "0";

  const allocatedTotal = actualAllocations.reduce((acc, curr) => acc + curr.actual, 0);
  
  // Comprehensive Health Score Calculation (0-100)
  // 1. Savings Ratio (40 pts): Max score if ratio >= 30%
  const sRatioScore = Math.min(40, (savingsRatio / 30) * 40);
  
  // 2. Emergency Fund (30 pts): Max if cash >= 6 months expenses
  const cashAssets = actualAllocations.filter(a => ['Cash', 'Bank Savings'].includes(a.name)).reduce((acc, curr) => acc + (totalWealth * (curr.actual / 100)), 0);
  const emergencyScore = totals.expense > 0 ? Math.min(30, (cashAssets / (totals.expense * 6)) * 30) : 30;
  
  // 3. Budget Control (20 pts): Max if expense <= 50% of income
  const budgetRatio = totals.income > 0 ? (totals.expense / totals.income) : 100;
  const budgetScore = budgetRatio <= 0.5 ? 20 : (budgetRatio >= 1 ? 0 : Math.min(20, (0.5 / budgetRatio) * 20));

  // 4. Allocation Accuracy (10 pts): Max if diff < 5% on all
  const totalDiff = actualAllocations.reduce((acc, curr) => acc + Math.abs(curr.target - curr.actual), 0);
  let allocationScore = Math.max(0, 10 - (totalDiff / 10));

  // Penalty for monthly deficit
  const deficitPenalty = totals.net < 0 ? 30 : 0;
  const totalHealthScore = Math.max(0, Math.round(sRatioScore + emergencyScore + budgetScore + allocationScore - deficitPenalty));
  
  const getHealthGrade = (score: number) => {
    if (score >= 90) return { grade: "S+", label: "Elite", color: "text-green-600" };
    if (score >= 75) return { grade: "A", label: "Healthy", color: "text-blue-600" };
    if (score >= 60) return { grade: "B", label: "Good", color: "text-yellow-600" };
    if (score >= 45) return { grade: "C", label: "Fair", color: "text-orange-600" };
    return { grade: "D", label: "Critical", color: "text-red-600" };
  };

  const health = getHealthGrade(totalHealthScore);

  // Scenarios for growth chart
  const monthlyInvest = Math.max(0, totals.net * ratio);
  const scenarios = {
    base: simulateGrowthSimple(monthlyInvest, 30, expectedCAGR),
    conservative: simulateGrowthSimple(monthlyInvest, 30, 0.07),
    optimistic: simulateGrowthSimple(monthlyInvest, 30, 0.22)
  };

  const growthData = scenarios.base.map((d, i) => ({
    year: d.year,
    base: Math.max(0, d.value + totalWealth * Math.pow(1.1, d.year)), // Add compounded existing wealth
    conservative: Math.max(0, scenarios.conservative[i].value + totalWealth * Math.pow(1.05, d.year)),
    optimistic: Math.max(0, scenarios.optimistic[i].value + totalWealth * Math.pow(1.2, d.year))
  }));

  // Financial Freedom Year Estimation
  // Assuming a target of 10B VND for freedom or 25x annual expenses
  const annualExpenses = totals.expense * 12;
  const targetFREEDOM = annualExpenses > 0 ? annualExpenses * 25 : 10000000000;
  const freedomYear = growthData.find(d => d.base >= targetFREEDOM)?.year || ">30";

  const getColorClass = (color: string, type: 'dot' | 'bar' | 'actual') => {
    const maps: Record<string, { dot: string; bar: string; actual: string }> = {
      'red': { dot: 'bg-red-500', bar: 'bg-red-500', actual: 'bg-red-400' },
      'green': { dot: 'bg-green-600', bar: 'bg-green-600', actual: 'bg-green-400' },
      'slate': { dot: 'bg-slate-500', bar: 'bg-slate-500', actual: 'bg-slate-400' },
      'amber': { dot: 'bg-amber-500', bar: 'bg-amber-500', actual: 'bg-amber-400' },
      'blue': { dot: 'bg-blue-600', bar: 'bg-blue-600', actual: 'bg-blue-400' },
    };
    return maps[color] ? maps[color][type] : 'bg-gray-400';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-1000">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tighter uppercase leading-none">Deep Analysis</h2>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Advanced Statistical Financial Modelling</span>
        </div>
        <div className="bg-primary/5 px-4 py-2 border border-primary/10 rounded flex items-center gap-4">
           <div className="text-right">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Financial Freedom Year</span>
              <span className="text-lg font-black text-primary">Year {freedomYear}</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-secondary">
              <Info size={14} />
           </div>
        </div>
      </header>

      {/* Top KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnalysisCard 
          title="Savings Ratio" 
          value={`${savingsRatio.toFixed(1)}%`} 
          subValue={savingsRatio > 30 ? "Elite Position" : "Building Phase"}
          accent="text-primary"
        />
        <AnalysisCard 
          title="Investment Power" 
          value={`1 : ${investPower}`} 
          subValue="Invest vs Spend"
        />
        <AnalysisCard 
          title="Est. Monthly Gain" 
          value={formatVND(totalWealth * (expectedCAGR / 12))} 
          subValue="Monthly Passive"
        />
        <AnalysisCard 
          title="Health Score" 
          value={health.grade} 
          subValue={`${totalHealthScore}/100 — ${health.label}`}
          accent={health.color}
        />
      </section>

      {/* Allocation Comparison Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standard Benchmark */}
        <div className="bg-white p-6 border border-primary/5 rounded shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Standard Benchmark</h3>
            <span className="text-[9px] font-bold text-gray-400">Total Capital: {formatVND(totalWealth)}</span>
          </div>
          {totals.net <= 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center border-t border-primary/5 mt-4">
              <AlertCircle size={20} className="text-red-400 mb-2" />
              <p className="text-[9px] font-black text-red-700 uppercase tracking-widest">New Capital Inflow Halted</p>
              <p className="text-[8px] text-gray-400 text-center max-w-[200px] mt-1">Focus on covering the monthly deficit before benchmarking new allocations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actualAllocations.map(asset => (
                <div key={asset.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", getColorClass(asset.color, 'dot'))} />
                      {asset.name}
                    </span>
                    <span>{asset.target}% — {formatVND(totalWealth * (asset.target / 100))}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", getColorClass(asset.color, 'bar'))} 
                      style={{ width: `${asset.target}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Actual Allocation */}
        <div className={cn(
          "p-6 rounded shadow-lg transition-all relative overflow-hidden",
          totals.net <= 0 ? "bg-red-50 border border-red-100 text-red-900" : "bg-primary text-secondary"
        )}>
          {totals.net <= 0 ? (
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center py-10">
              <Shield size={48} className="text-red-300 mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">Allocation Strategy Locked</h3>
              <p className="text-[9px] max-w-[200px] font-medium opacity-60 leading-relaxed uppercase">
                System won't process allocation logic during periods of capital drainage. Resolve net flow deficit to unlock.
              </p>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest">Your Actual Allocation</h3>
                <div className="flex flex-col items-end">
                  <span className="text-[12px] font-black">{allocatedTotal}% ALLOCATED</span>
                  <div className="w-24 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${allocatedTotal}%` }} />
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-2 h-[220px] px-2 mb-2">
                 {actualAllocations.map((asset, idx) => (
                  <div key={asset.name} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <div className="relative w-full flex items-end justify-center h-full group">
                      {/* Target ghost bar */}
                      <div 
                        className="absolute bottom-0 w-full max-w-[40px] bg-white/10 rounded-t-lg transition-all duration-500" 
                        style={{ height: `${asset.target}%` }} 
                      />
                      {/* Actual bar */}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${asset.actual}%` }}
                        className={cn("w-full max-w-[40px] rounded-t-lg shadow-lg relative z-10", getColorClass(asset.color, 'actual'))} 
                      >
                        <div className="absolute -top-9 left-0 right-0 text-center text-[7px] font-black leading-tight pointer-events-none">
                          {asset.actual}%<br/>
                          <span className="bg-primary/80 backdrop-blur-sm px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl">
                            {formatVND(totalWealth * (asset.actual / 100))}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                    <div className="flex flex-col items-center w-full gap-1">
                      <span className="text-[7px] font-black uppercase tracking-tighter text-center h-4 line-clamp-1">{asset.name}</span>
                      <div className="relative w-full">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={asset.actual}
                          onChange={(e) => {
                            const newVal = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            const next = [...actualAllocations];
                            next[idx] = { ...next[idx], actual: newVal };
                            setActualAllocations(next);
                          }}
                          className="w-full bg-white/10 border border-white/10 text-white text-[10px] font-black py-1 px-1 rounded text-center focus:outline-none focus:border-white/40 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] opacity-40 font-bold pointer-events-none">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Shield size={120} />
          </div>
        </div>
      </section>

      {/* Rebalancing Suggestions */}
      <section className="bg-white p-6 border border-primary/5 rounded shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Rebalancing Suggestions</h3>
          {totals.net <= 0 && (
            <div className={cn("px-2 py-1 rounded animate-pulse", totals.net < 0 ? "bg-red-600" : "bg-orange-600")}>
              <span className="text-[8px] font-black text-white uppercase">
                {totals.net < 0 ? "Critical: Negative Cash Flow" : "Neutral: Zero Surplus"}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {totals.net <= 0 ? (
            <div className={cn(
              "col-span-full border-2 border-dashed p-8 rounded text-center flex flex-col items-center gap-3",
              totals.net < 0 ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"
            )}>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", totals.net < 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600")}>
                <AlertCircle size={24} />
              </div>
              <div className="max-w-md">
                <h3 className={cn("text-sm font-black uppercase", totals.net < 0 ? "text-red-700" : "text-orange-700")}>Halt Investment Strategies</h3>
                <p className={cn("text-[10px] font-medium mt-1 leading-relaxed", totals.net < 0 ? "text-red-600/80" : "text-orange-600/80")}>
                  {totals.net < 0 
                    ? `Your monthly expenses exceed your income by ${formatVND(Math.abs(totals.net))}.` 
                    : "Your monthly expenses equal your income, leaving no surplus for rebalancing."} 
                  Asset rebalancing is secondary to cash flow stabilization. 
                  Prioritize reducing debt or cutting non-essential expenses before committing further capital to investments.
                </p>
              </div>
            </div>
          ) : (
            <>
              {actualAllocations.map(asset => {
                const diff = asset.target - asset.actual;
                const currentAmount = totalWealth * (asset.actual / 100);
                const targetAmount = totalWealth * (asset.target / 100);
                const diffAmount = Math.abs(targetAmount - currentAmount);

                if (Math.abs(diff) < 2) return null;
                
                return (
                  <SuggestionCard 
                    key={asset.name}
                    assetName={asset.name}
                    diff={diff}
                    diffAmount={diffAmount}
                    currentPct={asset.actual}
                    targetPct={asset.target}
                    currentVal={currentAmount}
                    targetVal={targetAmount}
                  />
                );
              }).filter(Boolean)}
              {actualAllocations.every(asset => Math.abs(asset.target - asset.actual) < 2) && (
                 <div className="col-span-full py-8 text-center bg-green-50 rounded border border-green-100">
                    <span className="text-green-700 font-black uppercase tracking-widest text-xs">Portfolio is Perfectly Balanced</span>
                 </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Middle Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar */}
        <div className="lg:col-span-2 bg-white p-6 border border-primary/5 rounded shadow-sm">
           <h3 className="text-[10px] font-bold text-primary uppercase mb-6 flex items-center gap-2">
              <BarChart2 size={14} /> Income vs Expense Analysis
           </h3>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 700}} 
                    tickFormatter={(v) => {
                      const [y, m] = v.split('-');
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return `${months[parseInt(m)-1]} ${y}`;
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9}} 
                    tickFormatter={(v) => {
                      if (v >= 1000000) return `${(v/1000000).toFixed(1)}M`;
                      return formatVND(v);
                    }}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(116, 7, 14, 0.02)'}}
                    contentStyle={{ borderRadius: '4px', border: 'none', background: '#F4E3B2', color: '#74070E', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ 
                      fontSize: '9px', 
                      fontWeight: 'bold', 
                      paddingBottom: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }} 
                  />
                  <Bar dataKey="income" name="Income" fill="#74070E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#d4c9ae" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* AI Strategy Box */}
        <div className={cn(
          "p-6 rounded shadow-lg flex flex-col gap-6 transition-colors",
          totals.net <= 0 ? "bg-red-50 border border-red-100 text-red-900" : "bg-primary text-secondary"
        )}>
           <div className={cn("flex items-center gap-2 border-b pb-2", totals.net <= 0 ? "border-red-200" : "border-white/10")}>
              <Cpu size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest leading-none">AI Optimization Strategy</h3>
           </div>
           
           {totals.net <= 0 ? (
             <div className="space-y-6 py-4 flex flex-col items-center text-center">
                <AlertCircle size={32} className="text-red-400 opacity-50" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">Defense Active</p>
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">
                    Analytical engines have pivoted to defensive stability. Optimization logic is temporarily locked until a recurring surplus is established.
                  </p>
                </div>
             </div>
           ) : (
             <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1 italic">Insight #1: Speed to Freedom</p>
                  <p className="text-[11px] font-medium leading-relaxed">
                    Maintaining a {savingsRatio.toFixed(1)}% savings ratio places you in the {savingsRatio > 30 ? 'elite 1%' : 'top 10%'} of users. Freedom is projected in ~{freedomYear} years.
                  </p>
                </div>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1 italic">Insight #2: Portfolio Alpha</p>
                  <p className="text-[11px] font-medium leading-relaxed">
                    Current allocation risk is {actualAllocations[0].actual < 30 ? 'Low' : 'Moderate'}. {actualAllocations[0].actual < 50 ? `System suggests you could increase equity exposure. Tuning to 50% could add substantial terminal value.` : 'Your equity exposure is aggressive and optimal.'}
                  </p>
                </div>
             </div>
           )}

           <div className={cn("mt-auto pt-6 border-t flex justify-between items-center", totals.net <= 0 ? "border-red-200" : "border-white/10")}>
              <span className="text-[8px] opacity-50 italic">DeepFlow Alpha v1.4</span>
              {totals.net > 0 && (
                <button className="bg-white text-primary text-[9px] font-black px-3 py-1.5 rounded uppercase hover:bg-secondary transition-colors">Adjust Model</button>
              )}
           </div>
        </div>
      </div>

      {/* Bottom Growth Scenarios Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white p-6 border border-primary/5 rounded shadow-sm">
            <h3 className="text-[10px] font-bold text-primary uppercase mb-6 flex items-center gap-2">
              <TrendingUp size={14} /> Growth Scenarios
            </h3>
            <div className="h-[350px]">
              {totals.net <= 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale">
                  <TrendingUp size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Growth Stagnated</p>
                  <p className="text-[8px] mt-1 text-center max-w-[180px]">Projections require recurring monthly surplus. Current flow is negative.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9}} 
                      tickFormatter={(v) => {
                         if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)}B`;
                         return `${(v / 1000000).toFixed(0)}M`;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '4px', border: 'none', background: '#F4E3B2', color: '#74070E', fontSize: '10px', fontWeight: 'bold' }}
                      formatter={(v: any) => [formatVND(v), '']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle" 
                      iconSize={4}
                      wrapperStyle={{ 
                        fontSize: '7px', 
                        fontWeight: 'bold', 
                        paddingTop: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }} 
                    />
                    <Line type="monotone" dataKey="base" name="Base Case" stroke="#74070E" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="conservative" name="Conservative (7%)" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="optimistic" name="Optimistic (22%)" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
         </div>

         {/* Side Health indicators */}
         <div className="bg-white p-6 border border-primary/5 rounded flex flex-col gap-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-primary uppercase border-b border-primary/5 pb-2">Structural Health Indicators</h3>
            
            <div className="space-y-6">
              <HealthBar label="Savings Ratio (Target 30%)" value={savingsRatio} target={30} color="bg-green-500" />
              <HealthBar label="Emergency Fund (Target 6m)" value={cashAssets / (totals.expense || 1)} target={6} />
              <HealthBar label="Budget Efficiency" value={100 - (budgetRatio * 100)} target={50} color="bg-blue-500" />
            </div>

            <div className="mt-auto border-t border-primary/5 pt-4">
              <h4 className="text-[8px] font-black uppercase text-gray-400 mb-2 tracking-widest">Scoring Criteria</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                <div className="flex flex-col">
                  <span className="text-[7px] font-bold text-primary">SAVINGS (40%)</span>
                  <span className="text-[6px] text-gray-400">Ratio vs Monthly Income</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-bold text-primary">RESERVE (30%)</span>
                  <span className="text-[6px] text-gray-400">Cash vs 6m Expense</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-bold text-primary">BUDGET (20%)</span>
                  <span className="text-[6px] text-gray-400">Spend Control Efficiency</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-bold text-primary">MODEL (10%)</span>
                  <span className="text-[6px] text-gray-400">Target Allocation Match</span>
                </div>
              </div>

              <h4 className="text-[8px] font-black uppercase text-gray-400 mb-2 tracking-widest">Grade Thresholds</h4>
              <div className="flex justify-between text-[7px] font-black px-1">
                <span className="text-green-600">S+ (90+)</span>
                <span className="text-blue-600">A (75+)</span>
                <span className="text-yellow-600">B (60+)</span>
                <span className="text-orange-600">C (45+)</span>
                <span className="text-red-600">D (&lt;45)</span>
              </div>
            </div>

            <div className="mt-auto p-4 bg-primary/5 border border-primary/10 rounded italic">
               <p className="text-[10px] text-gray-500 leading-relaxed">
                 "Current structural integrity is <span className="text-primary font-bold">{savingsRatio > 20 ? 'Robust' : 'Developing'}</span>. Diversification strategy effectively mitigates idiosyncratic market risk."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

const AnalysisCard: React.FC<{ title: string, value: string, subValue: string, accent?: string }> = ({ title, value, subValue, accent = "text-primary" }) => (
  <div className="bg-white p-6 border border-primary/5 rounded shadow-sm flex flex-col gap-1 transition-all hover:border-primary/20">
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
    <span className={cn("text-2xl font-black", accent)}>{value}</span>
    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 bg-primary/5 self-start px-2 py-0.5 rounded">{subValue}</span>
  </div>
);

const HealthBar: React.FC<{ label: string, value: number, target: number, color?: string }> = ({ label, value, target, color = "bg-primary" }) => {
  const percentage = Math.min(100, (value / target) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider">
        <span className="text-gray-400">{label}</span>
        <span className="text-primary">{value.toFixed(1)} / {target}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
};

interface SuggestionCardProps {
  assetName: string;
  diff: number;
  diffAmount: number;
  currentPct: number;
  targetPct: number;
  currentVal: number;
  targetVal: number;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  assetName, diff, diffAmount, currentPct, targetPct, currentVal, targetVal 
}) => {
  const isIncrease = diff > 0;
  
  return (
    <div className={cn(
      "p-4 rounded border flex flex-col gap-3 transition-all hover:shadow-md",
      isIncrease ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{assetName}</span>
          <span className={cn("text-xs font-black uppercase", isIncrease ? "text-red-700" : "text-blue-700")}>
            {isIncrease ? "↑ Buy / Add" : "↓ Sell / Reduce"}
          </span>
        </div>
        <div className={cn("px-2 py-0.5 rounded text-[9px] font-black", isIncrease ? "bg-red-600 text-white" : "bg-blue-600 text-white")}>
          {formatVND(diffAmount)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t pt-2 border-black/5">
        <div className="flex flex-col">
          <span className="text-[7px] font-bold opacity-40 uppercase">Actual</span>
          <span className="text-[10px] font-black">{currentPct}%</span>
          <span className="text-[8px] font-medium opacity-60 leading-none">{formatVND(currentVal)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[7px] font-bold opacity-40 uppercase">Target</span>
          <span className="text-[10px] font-black">{targetPct}%</span>
          <span className="text-[8px] font-medium opacity-60 leading-none">{formatVND(targetVal)}</span>
        </div>
      </div>

      <div className="mt-1 h-0.5 w-full bg-black/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", isIncrease ? "bg-red-600" : "bg-blue-600")}
          style={{ width: `${Math.min(100, Math.abs(diff) * 2)}%` }}
        />
      </div>
    </div>
  );
};
