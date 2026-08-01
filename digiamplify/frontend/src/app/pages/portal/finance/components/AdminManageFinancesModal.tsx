'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  bankName: string;
  accountNumber: string;
  salary: string;
  bonus: string;
}

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

interface AdminManageFinancesModalProps {
  selectedEmp: Employee;
  isEditingPayment: boolean;
  setIsEditingPayment: (val: boolean) => void;
  showAddTxForm: boolean;
  setShowAddTxForm: (val: boolean) => void;
  empTransactions: Transaction[];
  handleAddTransaction: (txData: { title: string; amount: number; type: string; status: string; reference?: string }) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleSavePaymentSettings: (settings: { bankName: string; accountNumber: string; accountHolderName: string; salary: string; bonus: string; currency: string }) => Promise<void>;
  onClose: () => void;
}

export default function AdminManageFinancesModal({
  selectedEmp,
  isEditingPayment,
  setIsEditingPayment,
  showAddTxForm,
  setShowAddTxForm,
  empTransactions,
  handleAddTransaction,
  handleDeleteTransaction,
  handleSavePaymentSettings,
  onClose
}: AdminManageFinancesModalProps) {
  
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [salary, setSalary] = useState('');
  const [bonus, setBonus] = useState('');
  const [currency, setCurrency] = useState('USD');

  
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('SALARY'); 
  const [txStatus, setTxStatus] = useState('SUCCESSFUL'); 
  const [txRef, setTxRef] = useState('');

  // Initialize/reset form states when selected employee changes or isEditingPayment opens
  useEffect(() => {
    if (selectedEmp) {
      setBankName(selectedEmp.bankName || '');
      setAccountNumber(selectedEmp.accountNumber || '');
      setAccountHolderName(selectedEmp.fullName || '');
      setSalary(selectedEmp.salary ? selectedEmp.salary.replace(/[^0-9.]/g, '') : '');
      setBonus(selectedEmp.bonus ? selectedEmp.bonus.replace(/[^0-9.]/g, '') : '');
      setCurrency('USD');
    }
  }, [selectedEmp, isEditingPayment]);

  const submitAddTx = async () => {
    if (!txTitle || !txAmount) return;
    await handleAddTransaction({
      title: txTitle,
      amount: parseFloat(txAmount),
      type: txType,
      status: txStatus,
      reference: txRef || undefined
    });
    setTxTitle('');
    setTxAmount('');
    setTxRef('');
  };

  const submitSettings = async () => {
    await handleSavePaymentSettings({
      bankName,
      accountNumber,
      accountHolderName,
      salary,
      bonus,
      currency
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-md">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8 sm:p-10 shadow-2xl relative custom-scrollbar">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-5 border-b border-neutral-900">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Manage Finance: {selectedEmp.fullName}
            </h2>
            <p className="text-sm text-neutral-500 mt-1.5">{selectedEmp.email} &bull; {selectedEmp.department} ({selectedEmp.jobTitle})</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingPayment(!isEditingPayment)}
              className="border border-neutral-800 text-neutral-300 hover:text-white hover:bg-white/5 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              {isEditingPayment ? 'View Transactions' : 'Edit Bank Settings'}
            </button>
            <button
              onClick={() => setShowAddTxForm(!showAddTxForm)}
              className="bg-[#be0919] hover:bg-[#990714] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              {showAddTxForm ? 'Close Add Form' : '+ Add Transaction'}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-neutral-450 hover:text-white hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors ml-2 shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {}
        {isEditingPayment ? (
          <div className="bg-[#050505] border border-neutral-900 rounded-xl p-8 mb-8 shadow-sm animate-fadeIn">
            <h3 className="text-base font-bold text-white mb-6 border-l-2 border-red-500 pl-3">Edit Profile Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Holder Name</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Monthly Salary Amount ($)</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Default Bonus Settings ($)</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsEditingPayment(false)}
                className="px-5 py-2.5 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitSettings}
                className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        ) : null}

        {}
        {showAddTxForm ? (
          <div className="bg-[#050505] border border-neutral-900 rounded-xl p-8 mb-8 shadow-sm animate-fadeIn">
            <h3 className="text-base font-bold text-white mb-6 border-l-2 border-red-500 pl-3">Add Finance Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Salary, Performance Bonus"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Amount ($) *</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Reference Code</label>
                <input
                  type="text"
                  placeholder="e.g. #92810 (optional)"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Type *</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  <option value="SALARY">SALARY</option>
                  <option value="BONUS">BONUS</option>
                  <option value="DEDUCTION">DEDUCTION</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2 uppercase tracking-wide">Status *</label>
                <select
                  value={txStatus}
                  onChange={(e) => setTxStatus(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg p-3.5 text-white text-sm focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  <option value="SUCCESSFUL">SUCCESSFUL</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowAddTxForm(false)}
                className="px-5 py-2.5 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitAddTx}
                className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Post Transaction
              </button>
            </div>
          </div>
        ) : null}

        {}
        <div className="mt-6">
          <h3 className="text-base font-bold text-white mb-6 border-l-2 border-red-500 pl-3 select-none">Transaction History</h3>
          <div className="overflow-x-auto w-full max-h-[40vh] custom-scrollbar pb-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-xs font-bold text-neutral-400 uppercase tracking-wider select-none">
                  <th className="pb-4 px-4">Transaction</th>
                  <th className="pb-4 px-4">Type</th>
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4">Amount</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-sm">
                {empTransactions.length > 0 ? (
                  empTransactions.map((tx) => {
                    const isCredit = tx.type === 'SALARY' || tx.type === 'BONUS';
                    const txDate = new Date(tx.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                    return (
                      <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-semibold text-white block text-sm sm:text-[15px]">{tx.title}</span>
                          <span className="text-xs text-neutral-400 block mt-1">{tx.reference || '—'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                            tx.type === 'SALARY'
                              ? 'bg-blue-500/10 text-blue-400'
                              : tx.type === 'BONUS'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-neutral-400 font-light text-sm">
                          {txDate}
                        </td>
                        <td className={`py-4 px-4 font-semibold text-sm sm:text-[15px] ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isCredit ? '+' : '-'}${tx.amountRaw || tx.amount}
                        </td>
                        <td className="py-4 px-4">
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
                        <td className="py-4 px-4 text-right pr-6">
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="text-red-500 hover:text-red-400 transition-colors text-sm cursor-pointer font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-neutral-500 font-light">
                      No transaction history. Click "+ Add Transaction" to post a record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
