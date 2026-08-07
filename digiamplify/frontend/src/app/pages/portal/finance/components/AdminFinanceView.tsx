import React, { useState, useEffect } from 'react';
import AdminFinanceStats from './AdminFinanceStats';
import AdminMonthlyPayrollChart from './AdminMonthlyPayrollChart';
import AdminPerformanceAlerts from './AdminPerformanceAlerts';
import AdminEmployeePerformanceTable from './AdminEmployeePerformanceTable';
import AdminManageFinancesModal from './AdminManageFinancesModal';

export default function AdminFinanceView() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [adminName, setAdminName] = useState('Fahad');
  const [stats, setStats] = useState<any>({});
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<number[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [empTransactions, setEmpTransactions] = useState<any[]>([]);
  const [isManagingTx, setIsManagingTx] = useState(false);

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

      if (data.adminName) setAdminName(data.adminName);
      setStats(data.stats || {});
      setMonthlyAnalytics(data.monthlyAnalytics || []);
      setPerformanceAlerts(data.performanceAlerts || []);
      setEmployees(data.employees || []);
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

  const handleUpdateTransactionStatus = async (txId: string, status: string) => {
    if (!selectedEmp) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/finance/admin/transaction/${txId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSuccess(`Transaction status updated to ${status}!`);
        await fetchEmployeeTransactions(selectedEmp.id);
        await fetchOverview();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to update transaction status');
      }
    } catch (e: any) {
      setError(e.message || 'Error updating status');
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

  const currentDateObj = new Date();
  const dayName = currentDateObj.toLocaleString('default', { weekday: 'long' });
  const dayNum = currentDateObj.getDate();
  const monthName = currentDateObj.toLocaleString('default', { month: 'long' });
  const yearNum = currentDateObj.getFullYear();
  const dateFormattedString = `It's ${dayName}, ${dayNum} ${monthName} ${yearNum}.`;

  return (
    <div className="w-full flex flex-col justify-start select-none">
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

      {/* Breadcrumb & Greeting Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-normal text-neutral-400 mb-4">
          <span className="hover:text-white cursor-pointer transition-colors">Home</span>
          <span>/</span>
          <span className="text-[#be0919] font-medium">Dashboard</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-white">
          Good Morning, <span className="text-[#be0919]">{adminName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
          {dateFormattedString}
        </p>
      </div>

      {error && (
        <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-sm py-3.5 px-6 rounded-xl mb-6 text-center font-normal">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm py-3.5 px-6 rounded-xl mb-6 text-center font-normal">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be0919]" />
        </div>
      ) : (
        <>
          {/* Top 4 Stat Cards */}
          <AdminFinanceStats stats={stats} />

          {/* Analytics Line Chart & Performance Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 items-stretch">
            <div className="lg:col-span-3">
              <AdminMonthlyPayrollChart monthlyData={monthlyAnalytics} />
            </div>
            <div className="lg:col-span-2">
              <AdminPerformanceAlerts alerts={performanceAlerts} />
            </div>
          </div>

          {/* Employee Performance Overview Table */}
          <AdminEmployeePerformanceTable
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredEmployees={filteredEmployees}
            handleManageEmployee={handleManageEmployee}
          />
        </>
      )}

      {/* Admin Manage Employee Modal */}
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
          handleUpdateTransactionStatus={handleUpdateTransactionStatus}
          handleSavePaymentSettings={handleSavePaymentSettings}
          onClose={() => setIsManagingTx(false)}
        />
      )}
    </div>
  );
}


