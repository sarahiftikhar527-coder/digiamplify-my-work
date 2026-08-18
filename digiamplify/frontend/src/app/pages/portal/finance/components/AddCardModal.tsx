'use client';

import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';

interface AddCardModalProps {
  currentBankName?: string;
  currentHolderName?: string;
  currentAccountNumber?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCardModal({
  currentBankName = '',
  currentHolderName = '',
  currentAccountNumber = '',
  onClose,
  onSuccess
}: AddCardModalProps) {
  const [bankName, setBankName] = useState(currentBankName || 'Faysal Bank');
  const [accountHolderName, setAccountHolderName] = useState(currentHolderName || '');
  const [accountNumber, setAccountNumber] = useState(currentAccountNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!bankName.trim() || !accountHolderName.trim() || !accountNumber.trim()) {
      setError('Please fill in all card details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/finance/employee/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bankName,
          accountHolderName,
          accountNumber
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update card details');
      }

      setSuccessMsg('Card details saved successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving card info.');
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
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Link Payment Card</h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-light">Update your main account bank card information</p>
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
              Bank Name / Card Network
            </label>
            <input
              type="text"
              placeholder="e.g. VISA - Faysal Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/60 font-light"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/60 font-light"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
              Account / Card Number
            </label>
            <input
              type="text"
              placeholder="e.g. 4532 1234 5678 9287"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
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
              {isSubmitting ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
