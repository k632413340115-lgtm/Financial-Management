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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { formatVND, cn } from './lib/utils';
import { VIETNAMESE_STOCKS } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState<FinancialRecord[]>([]);

  // Lifted Investment State
  const [investmentRatio, setInvestmentRatio] = useState(0.4);
  const [investmentCAGR, setInvestmentCAGR] = useState(0.18);
  const [investmentStocks, setInvestmentStocks] = useState<Stock[]>(VIETNAMESE_STOCKS);

  useEffect(() => {
    setRecords(storage.getRecords());
    
    // Load persisted settings
    const savedSettings = storage.getSettings();
    if (savedSettings) {
      if (savedSettings.ratio) setInvestmentRatio(savedSettings.ratio);
      if (savedSettings.cagr) setInvestmentCAGR(savedSettings.cagr);
      if (savedSettings.stocks) setInvestmentStocks(savedSettings.stocks);
    }
  }, []);

  // Save changes to settings
  useEffect(() => {
    if (investmentRatio !== undefined && investmentCAGR !== undefined && investmentStocks?.length > 0) {
      storage.saveSettings({
        ratio: investmentRatio,
        cagr: investmentCAGR,
        stocks: investmentStocks
      });
    }
  }, [investmentRatio, investmentCAGR, investmentStocks]);

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
  const portfolioDisplay = new Intl.NumberFormat('vi-VN').format(totals.net);

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

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FinanceSummaryCard title="Total Income" amount={totals.allTimeIncome} type="income" />
              <FinanceSummaryCard title="Total Expenses" amount={totals.allTimeExpense} type="expense" />
              <FinanceSummaryCard title="Monthly Yield" amount={totals.net} type="net" />
              <div className="bg-primary p-3 rounded shadow-sm">
                <p className="text-[10px] uppercase text-secondary/70 font-bold tracking-widest">Est. Monthly Inv.</p>
                <p className="text-xl text-secondary font-black">
                  {new Intl.NumberFormat('vi-VN').format(totals.net * investmentRatio)} <span className="text-[9px] opacity-60 uppercase">VND</span>
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
                  <p className="text-lg font-black text-primary">{new Intl.NumberFormat('vi-VN').format(totals.income)} VND</p>
                </div>

                <div className="bg-white p-4 border border-primary/5 rounded shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary">
                      <Activity size={16} />
                    </div>
                    <span className="text-[8px] font-bold bg-red-100 px-1 rounded text-red-600">-3%</span>
                  </div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Expenses</p>
                  <p className="text-lg font-black text-primary">{new Intl.NumberFormat('vi-VN').format(totals.expense)} VND</p>
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
                    <p className="text-lg font-black text-secondary">{new Intl.NumberFormat('vi-VN').format(totals.net)} VND</p>
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
                        if (!v || typeof v !== 'string' || !v.includes('-')) return v;
                        const [y, m] = v.split('-');
                        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const idx = parseInt(m) - 1;
                        return shortMonths[idx] ? `${shortMonths[idx]} ${y}` : v;
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
                              if (!data.month || typeof data.month !== 'string' || !data.month.includes('-')) return data.month;
                              const [y, m] = data.month.split('-');
                              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                              const idx = parseInt(m) - 1;
                              return months[idx] ? `${months[idx]} ${y}` : data.month;
                            })()}
                          </td>
                          <td className="py-3 text-[9px] font-medium text-gray-500 text-center">
                            {new Intl.NumberFormat('vi-VN').format(data.income)} VND
                          </td>
                          <td className="py-3 text-[9px] font-medium text-gray-500 text-center">
                            {new Intl.NumberFormat('vi-VN').format(data.expense)} VND
                          </td>
                          <td className="py-3 text-[10px] font-black text-primary text-right italic">
                            {new Intl.NumberFormat('vi-VN').format(data.net)} VND
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
      case 'invest':
        return (
          <InvestmentView 
            monthlyNetCashFlow={totals.net}
            ratio={investmentRatio}
            setRatio={setInvestmentRatio}
            expectedCAGR={investmentCAGR}
            setExpectedCAGR={setInvestmentCAGR}
            stocks={investmentStocks}
            setStocks={setInvestmentStocks}
          />
        );
      case 'analysis':
        return <AnalysisView ratio={investmentRatio} expectedCAGR={investmentCAGR} />;
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
