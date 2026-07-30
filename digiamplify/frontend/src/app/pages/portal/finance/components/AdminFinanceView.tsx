'use client';

import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import AdminFinanceStats from './AdminFinanceStats';
import AdminEmployeeTable from './AdminEmployeeTable';
import AdminManageFinancesModal from './AdminManageFinancesModal';

export default function AdminFinanceView() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Overview stats
  const [stats, setStats] = useState({
    totalPayrollBudget: '$0',
    totalBonusesThisMonth: '$0',
    totalDeductionsThisMonth: '$0',
    totalEmployeesCount: 0
  });

  // Employees payroll list
  const [employees, setEmployees] = useState<any[]>([]);

  // Selected employee detail state for transaction management
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [empTransactions, setEmpTransactions] = useState<any[]>([]);
  const [isManagingTx, setIsManagingTx] = useState(false);

  // Edit payment profile settings quick form states
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [showAddTxForm, setShowAddTxForm] = useState(false);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('http://localhost:5000/api/finance/admin/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch finance overview');
      }

      setStats(data.stats);
      setEmployees(data.employees);
    } catch (e: any) {
      setError(e.message || 'Error loading finance overview');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeTransactions = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/finance/admin/employee/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setEmpTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleManageEmployee = (emp: any) => {
    setSelectedEmp(emp);
    setIsManagingTx(true);
    setIsEditingPayment(false);
    setShowAddTxForm(false);
    fetchEmployeeTransactions(emp.id);
  };

  const handleAddTransaction = async (txData: { title: string; amount: number; type: string; status: string; reference?: string }) => {
    if (!selectedEmp) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/finance/admin/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedEmp.id,
          ...txData
        })
      });
      if (res.ok) {
        setSuccess('Transaction added successfully!');
        await fetchEmployeeTransactions(selectedEmp.id);
        await fetchOverview();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to add transaction');
      }
    } catch (e: any) {
      setError(e.message || 'Error adding transaction');
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!selectedEmp) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/finance/admin/transaction/${txId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSuccess('Transaction deleted successfully!');
        await fetchEmployeeTransactions(selectedEmp.id);
        await fetchOverview();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to delete transaction');
      }
    } catch (e: any) {
      setError(e.message || 'Error deleting transaction');
    }
  };

  const handleSavePaymentSettings = async (settings: { bankName: string; accountNumber: string; accountHolderName: string; salary: string; bonus: string; currency: string }) => {
    if (!selectedEmp) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/profile/${selectedEmp.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccess('Payment profile settings updated successfully!');
        setIsEditingPayment(false);
        // Refresh employee data
        const updatedEmp = {
          ...selectedEmp,
          bankName: settings.bankName,
          accountNumber: settings.accountNumber,
          salary: `$${parseFloat(settings.salary || '0').toLocaleString()}`,
          bonus: `$${parseFloat(settings.bonus || '0').toLocaleString()}`
        };
        setSelectedEmp(updatedEmp);
        await fetchOverview();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to update payment settings');
      }
    } catch (e: any) {
      setError(e.message || 'Error updating payment profile');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      (emp.fullName || '').toLowerCase().includes(q) ||
      (emp.email || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q) ||
      (emp.jobTitle || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col justify-start">
      {/* Scrollbar Custom Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #be0919;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #990714;
        }
      `}</style>

      {/* Overview Header */}
      <div className="mb-10 select-none">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-white flex items-center gap-3">
          <Coins className="w-7 h-7 text-[#be0919]" />
          <span>Finance Management (Admin)</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 font-normal mt-3 leading-relaxed">
          Monitor company payroll statistics, update employee bank credentials, and process salary transfers, bonuses, or deductions.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-sm py-4 px-6 rounded-xl mb-6 text-center font-normal">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-4 px-6 rounded-xl mb-6 text-center font-normal">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be0919]" />
        </div>
      ) : (
        <>
          <AdminFinanceStats stats={stats} />

          <AdminEmployeeTable
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredEmployees={filteredEmployees}
            handleManageEmployee={handleManageEmployee}
          />
        </>
      )}

      {isManagingTx && selectedEmp && (
        <AdminManageFinancesModal
          selectedEmp={selectedEmp}
          isEditingPayment={isEditingPayment}
          setIsEditingPayment={setIsEditingPayment}
          showAddTxForm={showAddTxForm}
          setShowAddTxForm={setShowAddTxForm}
          empTransactions={empTransactions}
          handleAddTransaction={handleAddTransaction}
          handleDeleteTransaction={handleDeleteTransaction}
          handleSavePaymentSettings={handleSavePaymentSettings}
          onClose={() => setIsManagingTx(false)}
        />
      )}
    </div>
  );
}
