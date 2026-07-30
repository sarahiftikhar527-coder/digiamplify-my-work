'use client';

import React from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  reference: string;
  amount: string;
  amountRaw?: number;
  type: string;
  date: string;
  status: string;
}

interface EmployeeTransactionsTableProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: 'ALL' | 'SUCCESSFUL' | 'PENDING' | 'FAILED';
  setStatusFilter: (val: 'ALL' | 'SUCCESSFUL' | 'PENDING' | 'FAILED') => void;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (val: boolean) => void;
  filteredTransactions: Transaction[];
  transactionsCount: number;
}

export default function EmployeeTransactionsTable({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  showFilterDropdown,
  setShowFilterDropdown,
  filteredTransactions,
  transactionsCount
}: EmployeeTransactionsTableProps) {
  return (
    <div className="lg:col-span-3 bg-[#0c0c0c] border border-neutral-900 rounded-xl p-8 shadow-md animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-900">
        <h3 className="text-base font-bold tracking-wide select-none">Transactions</h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 bg-[#050505] border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500/50 font-light"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2.5 bg-[#be0919] hover:bg-[#a60715] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2.5 w-44 bg-[#0c0c0c] border border-neutral-800 rounded-lg shadow-xl py-2 z-20">
                {(['ALL', 'SUCCESSFUL', 'PENDING', 'FAILED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                      statusFilter === st ? 'text-[#be0919] bg-white/5' : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    {st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full custom-scrollbar pb-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider select-none">
              <th className="pb-4">Transaction</th>
              <th className="pb-4">Date</th>
              <th className="pb-4">Time</th>
              <th className="pb-4">Amount</th>
              <th className="pb-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-955 text-sm">
            {transactionsCount === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm sm:text-base text-neutral-500 font-light select-none">
                  No transaction history
                </td>
              </tr>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const dateObj = new Date(tx.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });

                const isCredit = tx.type === 'SALARY' || tx.type === 'BONUS';

                return (
                  <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4.5 flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg shrink-0 ${
                        isCredit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {isCredit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-semibold text-white block text-sm sm:text-[15px]">{tx.title}</span>
                        <span className="text-xs text-neutral-400 block mt-1">{tx.reference || '—'}</span>
                      </div>
                    </td>
                    <td className="py-4.5 text-neutral-300 font-light text-sm">{formattedDate}</td>
                    <td className="py-4.5 text-neutral-300 font-light text-sm">{formattedTime}</td>
                    <td className={`py-4.5 font-semibold text-sm sm:text-[15px] ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCredit ? '+' : '-'}${tx.amountRaw || tx.amount}
                    </td>
                    <td className="py-4.5 text-right">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase border whitespace-nowrap ${
                        tx.status.toLowerCase() === 'successful'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : tx.status.toLowerCase() === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm sm:text-base text-neutral-500 font-light select-none">
                  No transactions found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
