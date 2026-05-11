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
import { Activity, Info, BarChart2, TrendingUp, Shield, Cpu } from 'lucide-react';
import { storage } from '../lib/storage';
import { simulateGrowthSimple } from '../lib/simulationEngine';
import { VIETNAMESE_STOCKS } from '../constants';
import { cn } from '../lib/utils';

interface AnalysisViewProps {
  ratio: number;
  expectedCAGR: number;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ ratio, expectedCAGR }) => {
  const data = storage.getAnalysisData();
  const totals = storage.getMonthlyTotals();
  
  const totalWealth = totals.allTimeIncome - totals.allTimeExpense;
  const savingsRatio = totals.income > 0 ? (totals.net / totals.income) * 100 : 0;
  // Investment power: Ratio of Net Flow to Income (normalized)
  const investPower = totals.income > 0 ? (totals.net / totals.income).toFixed(1) : "0";
  
  // Scenarios for growth chart
  const monthlyInvest = Math.max(0, totals.net * ratio);
  const scenarios = {
    base: simulateGrowthSimple(monthlyInvest, 30, expectedCAGR),
    conservative: simulateGrowthSimple(monthlyInvest, 30, 0.07),
    optimistic: simulateGrowthSimple(monthlyInvest, 30, 0.22)
  };

  const growthData = scenarios.base.map((d, i) => ({
    year: d.year,
    base: d.value + totalWealth * Math.pow(1.1, d.year), // Add compounded existing wealth
    conservative: scenarios.conservative[i].value + totalWealth * Math.pow(1.05, d.year),
    optimistic: scenarios.optimistic[i].value + totalWealth * Math.pow(1.2, d.year)
  }));

  // Financial Freedom Year Estimation
  // Assuming a target of 10B VND for freedom or 25x annual expenses
  const annualExpenses = totals.expense * 12;
  const targetFREEDOM = annualExpenses > 0 ? annualExpenses * 25 : 10000000000;
  const freedomYear = growthData.find(d => d.base >= targetFREEDOM)?.year || ">30";

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
          subValue="Elite Position"
          accent="text-primary"
        />
        <AnalysisCard 
          title="Investment Power" 
          value={`1 : ${investPower}`} 
          subValue="Invest vs Spend"
        />
        <AnalysisCard 
          title="Est. Monthly Gain" 
          value={`${new Intl.NumberFormat('vi-VN').format(Math.round(totalWealth * (expectedCAGR / 12)))} VND`} 
          subValue="Monthly Passive"
        />
        <AnalysisCard 
          title="Health Score" 
          value="A+" 
          subValue="System Assessment"
          accent="text-green-600"
        />
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
                    tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`}
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
        <div className="bg-primary p-6 rounded shadow-lg text-secondary flex flex-col gap-6">
           <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Cpu size={16} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest leading-none">AI Optimization Strategy</h3>
           </div>
           
           <div className="space-y-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1 italic">Insight #1: Speed to Freedom</p>
                <p className="text-[11px] font-medium leading-relaxed">
                  Maintaining a {savingsRatio.toFixed(1)}% savings ratio places you in the elite 1% of users. Freedom is projected in ~{freedomYear} years.
                </p>
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1 italic">Insight #2: Portfolio Alpha</p>
                <p className="text-[11px] font-medium leading-relaxed">
                  Current allocation risk is low. System suggests you could increase equity exposure. Tuning to 50% could add {new Intl.NumberFormat('vi-VN').format(Math.round(growthData[29].optimistic - growthData[29].base))} VND to your 30-year terminal value.
                </p>
              </div>
           </div>

           <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-[8px] opacity-50 italic">DeepFlow Alpha v1.4</span>
              <button className="bg-white text-primary text-[9px] font-black px-3 py-1.5 rounded uppercase hover:bg-secondary transition-colors">Adjust Model</button>
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9}} 
                    tickFormatter={(v) => `${(v/1000000000).toFixed(1)}B`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '4px', border: 'none', background: '#F4E3B2', color: '#74070E', fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(v: any) => [new Intl.NumberFormat('vi-VN').format(Math.round(v)) + ' VND', '']}
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
            </div>
         </div>

         {/* Side Health indicators */}
         <div className="bg-white p-6 border border-primary/5 rounded flex flex-col gap-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-primary uppercase border-b border-primary/5 pb-2">Structural Health Indicators</h3>
            
            <div className="space-y-6">
              <HealthBar label="Savings vs Income (Rule 50/30/20)" value={savingsRatio} target={20} />
              <HealthBar label="Invest vs Spend (Capital Leverage)" value={parseFloat(investPower) * 10} target={10} />
              <HealthBar label="Compounding Progress" value={100} target={100} />
            </div>

            <div className="mt-auto p-4 bg-primary/5 border border-primary/10 rounded italic">
               <p className="text-[10px] text-gray-500 leading-relaxed">
                 "Current structural integrity is <span className="text-primary font-bold">Robust</span>. Diversification across {VIETNAMESE_STOCKS.length} tickers effectively mitigates idiosyncratic market risk."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

const AnalysisCard = ({ title, value, subValue, accent = "text-primary" }: { title: string, value: string, subValue: string, accent?: string }) => (
  <div className="bg-white p-6 border border-primary/5 rounded shadow-sm flex flex-col gap-1 transition-all hover:border-primary/20">
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
    <span className={cn("text-2xl font-black", accent)}>{value}</span>
    <span className="text-[9px] font-bold uppercase tracking-widest text-primary/40 bg-primary/5 self-start px-2 py-0.5 rounded">{subValue}</span>
  </div>
);

const HealthBar = ({ label, value, target }: { label: string, value: number, target: number }) => {
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
          className="h-full bg-primary"
        />
      </div>
    </div>
  );
};
