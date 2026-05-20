/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { FinanceForm, FinanceSummaryCard } from './components/FinanceComponents';
import { RecordView } from './components/RecordView';
import { InvestmentView } from './components/InvestmentView';
import { AnalysisView } from './components/AnalysisView';
import { storage } from './lib/storage';
import { FinancialRecord, Stock } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, CreditCard, DollarSign, TrendingUp, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ComposedChart, Area } from 'recharts';
import { formatVND, cn } from './lib/utils';
import { VIETNAMESE_STOCKS } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<FinancialRecord[]>([]);

  // Lifted Investment State
  const [investmentRatio, setInvestmentRatio] = useState(0.4);
  const [investmentCAGR, setInvestmentCAGR] = useState(0.18);
  const [investmentStocks, setInvestmentStocks] = useState<Stock[]>(VIETNAMESE_STOCKS);
  const [actualAllocations, setActualAllocations] = useState([
    { name: 'Stocks', actual: 40, target: 50, color: 'red' },
    { name: 'Bank Savings', actual: 5, target: 10, color: 'green' },
    { name: 'Cash', actual: 45, target: 20, color: 'slate' },
    { name: 'Gold', actual: 5, target: 10, color: 'amber' },
    { name: 'USD Reserve', actual: 5, target: 10, color: 'blue' },
  ]);

  useEffect(() => {
    setRecords(storage.getRecords());
    
    // Load persisted settings
    const savedSettings = storage.getSettings();
    if (savedSettings) {
      if (savedSettings.ratio) setInvestmentRatio(savedSettings.ratio);
      if (savedSettings.cagr) setInvestmentCAGR(savedSettings.cagr);
      if (savedSettings.stocks) setInvestmentStocks(savedSettings.stocks);
      if (savedSettings.allocations) setActualAllocations(savedSettings.allocations);
    }
  }, []);

  // Save changes to settings
  useEffect(() => {
    storage.saveSettings({
      ratio: investmentRatio,
      cagr: investmentCAGR,
      stocks: investmentStocks,
      allocations: actualAllocations
    });
  }, [investmentRatio, investmentCAGR, investmentStocks, actualAllocations]);

  const handleAddRecord = (data: Omit<FinancialRecord, 'id' | 'userId' | 'createdAt'>) => {
    storage.saveRecord(data);
    setRecords(storage.getRecords());
  };

  const handleDeleteRecord = (id: string) => {
    storage.deleteRecord(id);
    setRecords(storage.getRecords());
  };

  const totals = storage.getMonthlyTotals();
  const analysis = storage.getAnalysisData();
  const portfolioDisplay = formatVND(totals.net);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex flex-col gap-6">
            <header className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-black text-primary tracking-tighter uppercase leading-none">Financial Dashboard</h2>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Personal Equity Monitoring Terminal</span>
              </div>
            </header>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FinanceSummaryCard title="Total Income" amount={totals.allTimeIncome} type="income" />
              <FinanceSummaryCard title="Total Expense" amount={totals.allTimeExpense} type="expense" />
              <FinanceSummaryCard title="Monthly Surplus" amount={totals.net} type="net" />
              <div className={cn("p-3 rounded shadow-sm transition-colors", totals.net > 0 ? "bg-primary" : "bg-red-700")}>
                <p className="text-[10px] uppercase text-secondary/70 font-bold tracking-widest truncate">
                  {totals.net > 0 ? `Potential (${Math.round(investmentRatio * 100)}%)` : "DEFICIT ALERT"}
                </p>
                <p className="text-xl text-secondary font-black">
                  {formatVND(Math.max(0, totals.net * investmentRatio))}
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Monthly Cash Flow Left Column */}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-4 border border-primary/5 rounded shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-[8px] font-bold bg-primary/10 px-1 rounded text-primary">+12%</span>
                  </div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Revenue</p>
                  <p className="text-lg font-black text-primary">{formatVND(totals.income)}</p>
                </div>

                <div className="bg-white p-4 border border-primary/5 rounded shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary">
                      <Activity size={16} />
                    </div>
                    <span className="text-[8px] font-bold bg-red-100 px-1 rounded text-red-600">-3%</span>
                  </div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Expenses</p>
                  <p className="text-lg font-black text-primary">{formatVND(totals.expense)}</p>
                </div>

                <div className="bg-primary p-4 rounded shadow-md flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-secondary">
                          <BarChart2 size={16} />
                       </div>
                       <span className="text-[8px] font-bold bg-white/20 px-1 rounded text-secondary italic">STABLE</span>
                    </div>
                    <p className="text-[8px] font-bold text-secondary/60 uppercase tracking-widest mb-1">Net Cash Position</p>
                    <p className="text-lg font-black text-secondary">{formatVND(totals.net)}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className="mt-4 w-full bg-white/10 hover:bg-white/20 py-2 rounded text-[9px] font-bold uppercase tracking-widest border border-white/10"
                  >
                    Deep Scan Profile
                  </button>
                </div>
              </div>

              {/* Performance Metrics Chart Area */}
              <div className="lg:col-span-2 bg-white p-6 border border-primary/10 rounded shadow-sm h-[380px] flex flex-col">
                <h3 className="text-[10px] font-bold text-primary uppercase mb-6 flex items-center gap-2">
                  <Activity size={14} /> Performance Metrics
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={analysis.monthlyHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fontWeight: 700}} 
                      tickFormatter={(v) => {
                        const [y, m] = v.split('-');
                        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${shortMonths[parseInt(m)-1]} ${y}`;
                      }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9}}
                      tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(116, 7, 14, 0.02)'}}
                      contentStyle={{ borderRadius: '4px', border: 'none', background: '#F4E3B2', color: '#74070E', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#74070E' }}
                    />
                    <Bar dataKey="income" name="Income" fill="#74070E" radius={[2, 2, 0, 0]} barSize={20} />
                    <Bar dataKey="expense" name="Expense" fill="#d4c9ae" radius={[2, 2, 0, 0]} barSize={20} />
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
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Statistics Section */}
              <div className="bg-white p-6 border border-primary/10 rounded shadow-sm h-[380px] flex flex-col">
                <h3 className="text-[10px] font-bold text-primary uppercase mb-4 flex items-center gap-2">
                  <BarChart2 size={14} /> Monthly Statistics View
                </h3>
                <div className="flex-1 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-primary/5">
                        <th className="py-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest">Month</th>
                        <th className="py-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center">Income</th>
                        <th className="py-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center">Expense</th>
                        <th className="py-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest text-right">Net Flow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {analysis.monthlyHistory.slice().reverse().map((data: any, idx: number) => (
                        <tr key={data.month} className={cn("group transition-colors", idx === 0 ? "bg-primary/5" : "hover:bg-primary/[0.02]")}>
                          <td className="py-3 text-[10px] font-black text-primary italic">
                            {(() => {
                              const [y, m] = data.month.split('-');
                              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                              return `${months[parseInt(m)-1]} ${y}`;
                            })()}
                          </td>
                          <td className="py-3 text-[9px] font-medium text-gray-500 text-center">
                            {formatVND(data.income)}
                          </td>
                          <td className="py-3 text-[9px] font-medium text-gray-500 text-center">
                            {formatVND(data.expense)}
                          </td>
                          <td className="py-3 text-[10px] font-black text-primary text-right italic">
                            {formatVND(data.net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 space-y-2 border-t border-primary/5 pt-4">
                  <div className="flex justify-between text-[9px] font-bold uppercase">
                    <span className="text-gray-400">Savings Rate</span>
                    <span className="text-green-600">{(totals.income > 0 ? (totals.net/totals.income)*100 : 0).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-600 h-full" 
                      style={{ width: `${Math.min(100, totals.income > 0 ? (totals.net/totals.income)*100 : 0)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'income':
        return (
          <div className="flex flex-col gap-6">
            <FinanceForm type="income" onSubmit={handleAddRecord} />
            <RecordView records={records} onDelete={handleDeleteRecord} type="income" />
          </div>
        );
      case 'expense':
        return (
          <div className="flex flex-col gap-6">
            <FinanceForm type="expense" onSubmit={handleAddRecord} />
            <RecordView records={records} onDelete={handleDeleteRecord} type="expense" />
          </div>
        );
      case 'cashflow':
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Cash Flow Header Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 border border-primary/10 rounded shadow-sm">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Average Monthly Surplus</p>
                <p className="text-2xl font-black text-primary">
                  {formatVND(analysis.monthlyHistory.reduce((acc, curr) => acc + curr.net, 0) / (analysis.monthlyHistory.length || 1))}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '65%' }} />
                  </div>
                  <span className="text-[8px] font-black text-green-600 uppercase">Healthy</span>
                </div>
              </div>
              <div className="bg-white p-5 border border-primary/10 rounded shadow-sm">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Savings Efficiency</p>
                <p className="text-2xl font-black text-primary">
                  {((totals.income > 0 ? totals.net / totals.income : 0) * 100).toFixed(1)}%
                </p>
                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase italic">Percent of income retained</p>
              </div>
              <div className="bg-primary p-5 rounded shadow-lg text-secondary">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Net Retained</p>
                <p className="text-2xl font-black">{formatVND(totals.allTimeIncome - totals.allTimeExpense)}</p>
                <p className="text-[9px] font-bold opacity-40 mt-1 uppercase">Cumulative Cashflow History</p>
              </div>
            </div>

            {/* Main Diagnostic Chart */}
            <div className="bg-white p-6 border border-primary/10 rounded shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-primary" /> Integrated Cash Flow Diagnostic
                </h3>
                <p className="text-[9px] text-gray-400 font-medium mt-1">Simultaneous tracking of Inflows, Outflows, and Net Residual</p>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analysis.monthlyHistory}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#868859" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#868859" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F4E3B2" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F4E3B2" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fontWeight: 700}} 
                      tickFormatter={(v) => {
                        const [y, m] = v.split('-');
                        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${shortMonths[parseInt(m)-1]} ${y}`;
                      }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9}}
                      innerTickSize={0}
                      tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(116, 7, 14, 0.05)', radius: [4, 4, 0, 0] }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid rgba(116, 7, 14, 0.1)', 
                        background: 'rgba(255, 255, 255, 0.96)', 
                        backdropFilter: 'blur(8px)',
                        padding: '10px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }}
                      itemStyle={{ padding: '0px' }}
                      labelStyle={{ fontSize: '9px', fontWeight: '900', color: '#74070E', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      formatter={(v: any, name: string) => [
                        <span key={name} className="font-mono font-black text-[9px]">{formatVND(v)}</span>, 
                        <span key={`${name}-label`} className="text-[8px] font-bold uppercase opacity-60 mr-2">{name}</span>
                      ]}
                    />
                    <Area type="monotone" dataKey="income" name="Gross Income" stroke="#868859" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="Total Expense" stroke="#B4A16C" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    <Bar dataKey="net" name="Net Surplus" fill="#74070E" radius={[4, 4, 0, 0]} barSize={30}>
                      {analysis.monthlyHistory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#74070E' : '#ef4444'} />
                      ))}
                    </Bar>
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle" 
                      iconSize={8}
                      wrapperStyle={{ 
                        fontSize: '9px', 
                        fontWeight: 'black', 
                        paddingBottom: '30px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }} 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed History Table */}
            <div className="bg-white border border-primary/10 rounded shadow-sm overflow-hidden">
               <div className="p-4 border-b border-primary/5 bg-primary/5">
                 <h3 className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Historical Cash Registry</h3>
               </div>
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-primary/5 bg-gray-50/50">
                      <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Reporting Period</th>
                      <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Inflow</th>
                      <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Outflow</th>
                      <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Efficiency</th>
                      <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Net Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5 font-mono">
                    {analysis.monthlyHistory.slice().reverse().map((data: any) => {
                      const efficiency = data.income > 0 ? (data.net / data.income) * 100 : 0;
                      return (
                        <tr key={data.month} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-primary uppercase">
                                {(() => {
                                  const [y, m] = data.month.split('-');
                                  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                  return months[parseInt(m)-1];
                                })()}
                              </span>
                              <span className="text-[8px] font-bold text-gray-400 tracking-widest">{data.month.split('-')[0]} FINANCE REPORT</span>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center text-[10px] font-bold text-green-600">
                            +{formatVND(data.income)}
                          </td>
                          <td className="px-3 py-4 text-center text-[10px] font-bold text-red-500">
                            -{formatVND(data.expense)}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span className={cn(
                              "text-[8px] font-black px-2 py-0.5 rounded leading-none inline-block",
                              efficiency > 30 ? "bg-green-100 text-green-700" : 
                              efficiency > 10 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                            )}>
                              {efficiency.toFixed(0)}% RATE
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={cn(
                              "text-[12px] font-black italic",
                              data.net >= 0 ? "text-primary" : "text-red-700"
                            )}>
                              {data.net >= 0 ? '+' : ''}{formatVND(data.net)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </div>
        );
      case 'invest':
        return (
          <InvestmentView 
            monthlyNetCashFlow={totals.net}
            ratio={investmentRatio}
            setRatio={setInvestmentRatio}
            stocks={investmentStocks}
            setStocks={setInvestmentStocks}
          />
        );
      case 'analysis':
        return <AnalysisView ratio={investmentRatio} actualAllocations={actualAllocations} setActualAllocations={setActualAllocations} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab} portfolioValue={portfolioDisplay}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 5 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
