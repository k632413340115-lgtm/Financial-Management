/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, XCircle } from 'lucide-react';
import { FinancialRecord } from '../types';
import { cn, formatVND } from '../lib/utils';

interface FinanceFormProps {
  type: 'income' | 'expense';
  onSubmit: (data: Omit<FinancialRecord, 'id' | 'userId' | 'createdAt'>) => void;
}

export const FinanceForm: React.FC<FinanceFormProps> = ({ type, onSubmit }) => {
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = React.useState('');
  const [isFixed, setIsFixed] = React.useState(false);
  const [recurringUntil, setRecurringUntil] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    
    onSubmit({
      type,
      name,
      amount: Number(amount),
      date,
      notes,
      isFixed,
      recurringUntil: isFixed ? recurringUntil : undefined,
    });

    setName('');
    setAmount('');
    setNotes('');
    setIsFixed(false);
    setRecurringUntil('');
  };

  return (
    <form onSubmit={handleSubmit} className="density-card flex flex-col gap-3">
      <h3 className="text-[#74070E] text-[10px] font-bold uppercase border-b border-[#74070E]/10 pb-1 flex items-center gap-2">
        <Plus size={14} /> New {type} Record
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="density-label">Source/Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Salary, Freelance..."
            className="density-input"
          />
        </div>
        <div>
          <label className="density-label">Amount (VND)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="density-input font-bold"
          />
        </div>
        <div>
          <label className="density-label">Start Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="density-input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="density-label flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              className="accent-primary"
            />
            Fixed (Recurring Monthly)
          </label>
          {isFixed && (
            <div>
              <label className="text-[9px] uppercase font-bold text-gray-400">Recurring Until</label>
              <input
                type="date"
                value={recurringUntil}
                onChange={(e) => setRecurringUntil(e.target.value)}
                className="density-input mt-1"
                required={isFixed}
              />
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="density-label">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional details..."
            className="density-input"
          />
        </div>
      </div>
      <button
        type="submit"
        className="density-btn-primary w-full mt-2"
      >
        Post {type}
      </button>
    </form>
  );
};

export const FinanceSummaryCard: React.FC<{
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'net';
}> = ({ title, amount, type }) => (
  <div className="bg-white p-3 border border-primary/20 rounded shadow-sm">
    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">{title}</p>
    <p className={cn(
      "text-xl font-black",
      type === 'income' ? 'text-green-700' : type === 'expense' ? 'text-red-700' : 'text-primary'
    )}>
      {new Intl.NumberFormat('vi-VN').format(amount)} <span className="text-[9px] text-gray-400 uppercase">VND</span>
    </p>
  </div>
);
