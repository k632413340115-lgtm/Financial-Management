/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Filter } from 'lucide-react';
import { FinancialRecord } from '../types';
import { formatVND, formatDate, cn } from '../lib/utils';

interface RecordViewProps {
  records: FinancialRecord[];
  onDelete: (id: string) => void;
  type: 'income' | 'expense';
}

export const RecordView: React.FC<RecordViewProps> = ({ records, onDelete, type }) => {
  const filtered = records.filter(r => r.type === type);

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-bold text-primary uppercase border-b border-primary/10 pb-1 w-full">
          {type} History Log <span className="opacity-40 italic ml-2">Displaying all records</span>
        </h3>
      </div>

      <div className="bg-white border border-primary/10 rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-3 text-[9px] uppercase font-bold text-gray-400">Date</th>
              <th className="p-3 text-[9px] uppercase font-bold text-gray-400">Description</th>
              <th className="p-3 text-[9px] uppercase font-bold text-gray-400 text-right">Amount (VND)</th>
              <th className="p-3 text-[9px] uppercase font-bold text-gray-400 text-center">Opt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[11px]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 italic">No records in the ledger.</td>
              </tr>
            ) : (
              filtered.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-3 text-gray-500">{record.date}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-gray-800 uppercase">{record.name}</div>
                      {record.isFixed && (
                        <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">RECURRING</span>
                      )}
                    </div>
                    {record.notes && <div className="text-[9px] text-gray-400 italic">{record.notes}</div>}
                  </td>
                  <td className={cn(
                    "p-3 font-black text-right",
                    type === 'income' ? 'text-green-700' : 'text-red-700'
                  )}>
                    {new Intl.NumberFormat('vi-VN').format(record.amount)}
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => onDelete(record.id)}
                      className="p-1.5 text-gray-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
