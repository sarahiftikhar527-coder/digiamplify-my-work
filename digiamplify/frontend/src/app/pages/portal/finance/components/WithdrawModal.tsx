'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, CheckCircle2 } from 'lucide-react';

interface WithdrawModalProps {
  netSalary: string;
  bankName: string;
  accountNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawModal({
  netSalary,
  bankName,
  accountNumber,
  onClose,
  onSuccess
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/finance/employee/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: numAmount,
          description: description.trim() || 'Salary Withdrawal'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process withdrawal');
      }

      setSuccessMsg('Withdrawal processed successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An error occurred during withdrawal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 select-none">
          <div className="p-3 bg-red-500/10 rounded-xl text-[#be0919]">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Withdraw Funds</h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-light">Transfer funds to your linked bank account</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-[#050505] border border-neutral-900 rounded-xl flex justify-between items-center select-none">
          <div>
            <span className="text-xs text-neutral-500 block">Available Net Salary</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{netSalary}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-500 block">Payout Destination</span>
            <span className="text-xs font-semibold text-neutral-300 mt-0.5 block">{bankName || 'Main Bank'}</span>
            <span className="text-[10px] text-neutral-500 font-mono">**** {accountNumber.slice(-4)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
              Withdrawal Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/60 font-light"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
              Reference Note / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Personal Transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/60 font-light"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#be0919] hover:bg-[#990714] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
