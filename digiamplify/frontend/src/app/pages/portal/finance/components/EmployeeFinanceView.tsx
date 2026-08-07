'use client';

import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import EmployeeFinanceStats from './EmployeeFinanceStats';
import EmployeeEarningsOverviewChart from './EmployeeEarningsOverviewChart';
import EmployeeVisaCard from './EmployeeVisaCard';
import EmployeeTransactionsTable from './EmployeeTransactionsTable';
import EmployeeBonusOverviewChart from './EmployeeBonusOverviewChart';
import AddCardModal from './AddCardModal';
import WithdrawModal from './WithdrawModal';
import RequestTransactionModal from './RequestTransactionModal';

interface TransactionRecord {
  id: string;
  title: string;
  reference: string;
  amount: string;
  amountRaw: number;
  type: string;
  date: string;
  status: string;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

interface Summary {
  netSalary: string;
  monthlySalary: string;
  bonus: string;
  deduction: string;
  netSalaryRaw: number;
  monthlySalaryRaw: number;
  bonusRaw: number;
  deductionRaw: number;
}

interface ChartData {
  earnings: number[];
  bonuses: number[];
}

export default function EmployeeFinanceView() {
  const [data, setData] = useState<{
    bankInfo: BankInfo;
    summary: Summary;
    charts: ChartData;
    transactions: TransactionRecord[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESSFUL' | 'PENDING' | 'FAILED'>('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);

  // Modal triggers
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const months = ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26'];


  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/finance/employee', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch finance details');
      }

      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading finance information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be0919]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
        <p className="text-red-500 mb-4">{error || 'Unable to load finance data.'}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchData();
          }}
          className="px-6 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { bankInfo, summary, charts, transactions } = data;

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const salaryTransactions = transactions.filter(
    (tx) => tx.type === 'SALARY' && tx.status.toLowerCase() === 'successful'
  );
  const sortedSalaryTransactions = [...salaryTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestSalaryDateString = sortedSalaryTransactions.length > 0
    ? new Date(sortedSalaryTransactions[0].date).toLocaleDateString('default', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      tx.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCardNum = (num: string) => {
    const clean = (num || '').replace(/[^0-9]/g, '');
    if (!clean) return '4532 8910 2345 9876';
    const padded = clean.length >= 16 ? clean.slice(-16) : clean.padStart(16, '4');
    return padded.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formattedCardNumber = formatCardNum(bankInfo.accountNumber);



  return (
    <div className="w-full flex flex-col justify-start">
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

      <div className="mb-10 select-none">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-wide text-white flex items-center gap-3">
          <Coins className="w-7 h-7 text-[#be0919]" />
          <span>Finances</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 font-normal mt-3 leading-relaxed">
          Track your earnings, deductions and payroll history.
        </p>
      </div>

      <EmployeeFinanceStats
        summary={summary}
        latestSalaryDateString={latestSalaryDateString}
        currentMonthName={currentMonthName}
        currentYear={currentYear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10 items-start">
        <EmployeeEarningsOverviewChart
          earnings={charts.earnings}
          transactionsCount={transactions.length}
          currentMonthIndex={currentDate.getMonth()}
          months={months}
        />

        <EmployeeVisaCard
          bankInfo={bankInfo}
          showCardNumber={showCardNumber}
          setShowCardNumber={setShowCardNumber}
          formattedCardNumber={formattedCardNumber}
          onOpenAddCardModal={() => setShowAddCardModal(true)}
          onOpenWithdrawModal={() => setShowWithdrawModal(true)}
          onOpenRequestModal={() => setShowRequestModal(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <EmployeeTransactionsTable
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
          filteredTransactions={filteredTransactions}
          transactionsCount={transactions.length}
        />

        <EmployeeBonusOverviewChart
          bonuses={charts.bonuses}
          transactionsCount={transactions.length}
          months={months}
        />
      </div>

      {showAddCardModal && (
        <AddCardModal
          currentBankName={bankInfo.bankName}
          currentHolderName={bankInfo.accountHolderName}
          currentAccountNumber={bankInfo.accountNumber}
          onClose={() => setShowAddCardModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showRequestModal && (
        <RequestTransactionModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={fetchData}
        />
      )}

    </div>
  );
}

