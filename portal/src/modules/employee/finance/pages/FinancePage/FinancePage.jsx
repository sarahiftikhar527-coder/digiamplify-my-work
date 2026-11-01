import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMyFinanceDashboard,
  getMyPayrollRecords,
} from '@/services/financeService';
import FinanceHeader from '../../components/FinanceHeader';
import FinanceSummaryCards from '../../components/FinanceSummaryCards';
import EarningsOverviewChart from '../../components/EarningsOverviewChart';
import BonusOverviewChart from '../../components/BonusOverviewChart';
import TotalBalanceCard from '../../components/TotalBalanceCard';
import TransactionsTable from '../../components/TransactionsTable';
import { reducedMotion } from '../../utils/finance';
import './finance.css';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const EMPTY_SUMMARY = {
  monthlySalary: 0,
  bonus: 0,
  deduction: 0,
  netSalary: 0,
  paidAmount: 0,
  pendingAmount: 0,
  totalRecords: 0,
};

const extractData = (result) =>
  result?.data?.data ?? result?.data ?? result;

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getPayrollRecords = (result, dashboard) => {
  const candidates = [
    result,
    result?.records,
    result?.items,
    result?.payroll,
    result?.employees,
    result?.results,
    result?.data,
    result?.data?.records,
    result?.data?.items,
    result?.data?.payroll,
    result?.data?.employees,
    dashboard?.payroll,
    dashboard?.records,
  ];

  return candidates.find(Array.isArray) || [];
};

const normalizeStatus = (status) => {
  const value = String(status || 'Pending').trim().toLowerCase();

  if (['completed', 'complete', 'paid', 'success', 'successful'].includes(value)) {
    return 'Successful';
  }

  if (['pending', 'processing', 'in progress'].includes(value)) {
    return 'Pending';
  }

  if (['failed', 'rejected', 'cancelled', 'canceled'].includes(value)) {
    return 'Failed';
  }

  return status || 'Pending';
};

const formatPayrollDate = (value) => {
  if (!value || value === 'Not scheduled') return 'Not scheduled';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not scheduled';

  return date.toISOString().slice(0, 10);
};

const formatPayrollTime = (value) => {
  if (!value) return '--';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Karachi',
  }).format(date);
};

const getNetPay = (record) => {
  const explicitNetPay = record.netPay ?? record.netSalary;

  if (explicitNetPay !== null && explicitNetPay !== undefined) {
    return toNumber(explicitNetPay);
  }

  return (
    toNumber(record.salary) +
    toNumber(record.bonus) -
    toNumber(record.deduction)
  );
};

const getRecordId = (record, index) =>
  record.id ?? record._id ?? `payroll-${index}`;

export default function FinancePage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [earnings, setEarnings] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const txRef = useRef(null);

  const loadFinance = useCallback(async (signal) => {
    setLoading(true);
    setError('');

    try {
      const [dashboardResponse, payrollResponse] = await Promise.all([
        getMyFinanceDashboard({
          month: currentMonth,
          year: currentYear,
          ...(signal ? { signal } : {}),
        }),
        getMyPayrollRecords({
          page: 1,
          limit: 100,
          ...(signal ? { signal } : {}),
        }),
      ]);

      if (signal?.aborted) return;

      const dashboard = extractData(dashboardResponse) || {};
      const payrollResult = extractData(payrollResponse);
      const dashboardSummary = dashboard.summary || {};

      const payrollRecords = getPayrollRecords(
        payrollResult,
        dashboard
      );

      const monthlySalary = toNumber(
        dashboardSummary.monthlySalary ??
        dashboardSummary.salary
      );

      const bonus = toNumber(dashboardSummary.bonus);
      const deduction = toNumber(dashboardSummary.deduction);

      const netSalary = toNumber(
        dashboardSummary.netSalary ??
        dashboardSummary.netPay ??
        monthlySalary + bonus - deduction
      );

      setSummary({
        monthlySalary,
        bonus,
        deduction,
        netSalary,
        paidAmount: toNumber(
          dashboardSummary.paidAmount ??
          dashboardSummary.totalPaid
        ),
        pendingAmount: toNumber(
          dashboardSummary.pendingAmount ??
          dashboardSummary.totalPending
        ),
        totalRecords: toNumber(
          dashboardSummary.totalRecords ??
          dashboardSummary.count ??
          payrollRecords.length
        ),
      });

      const earningsRecords = Array.isArray(dashboard.earnings)
        ? dashboard.earnings
        : Array.isArray(dashboard.monthlyEarnings)
          ? dashboard.monthlyEarnings
          : [];

      setEarnings(
        earningsRecords.map((item) => ({
          month: item.month,
          value: toNumber(item.value ?? item.amount ?? item.salary),
        }))
      );

      const yearlyBonusTotals = new Map(
        MONTHS.map((month) => [month, 0])
      );

      payrollRecords.forEach((record) => {
        const recordYear = toNumber(record.periodYear);
        const recordMonth = toNumber(record.periodMonth);

        if (recordYear !== currentYear) return;
        if (recordMonth < 1 || recordMonth > 12) return;

        const monthName = MONTHS[recordMonth - 1];

        yearlyBonusTotals.set(
          monthName,
          yearlyBonusTotals.get(monthName) + toNumber(record.bonus)
        );
      });

      setBonusData(
        MONTHS.map((month) => ({
          month,
          amount: yearlyBonusTotals.get(month),
        }))
      );

      const mappedTransactions = payrollRecords.map((record, index) => {
        const paymentDate = record.paymentDate ?? record.createdAt;
        const createdAt = record.createdAt;

        return {
          id: getRecordId(record, index),
          bank: record.bank || record.paymentMethod || 'Payroll',
          ref:
            record.referenceNumber ||
            record.reference ||
            record._id ||
            'Payroll',
          date: formatPayrollDate(paymentDate),
          time: createdAt ? formatPayrollTime(createdAt) : '--',
          amount: getNetPay(record),
          status: normalizeStatus(record.status),
        };
      });

      setTransactions(mappedTransactions);
    } catch (requestError) {
      if (signal?.aborted) return;

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load your finance information.'
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const controller = new AbortController();

    loadFinance(controller.signal);

    return () => controller.abort();
  }, [loadFinance]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(''), 3200);

    return () => clearTimeout(timer);
  }, [toast]);

  const summaryItems = [
    {
      id: 'net',
      label: 'Net Salary',
      amount: summary.netSalary,
      note: `${MONTHS[currentMonth - 1]} ${currentYear}`,
      icon: 'coins',
    },
    {
      id: 'monthly',
      label: 'Monthly Salary',
      amount: summary.monthlySalary,
      note: 'Current payroll period',
      icon: 'calendar',
    },
    {
      id: 'bonus',
      label: 'Bonus',
      amount: summary.bonus,
      note: 'Current payroll period',
      icon: 'trophy',
    },
    {
      id: 'deduction',
      label: 'Deduction',
      amount: summary.deduction,
      note: 'Current payroll period',
      icon: 'minusCircle',
    },
  ];

  const scrollToTransactions = () => {
    txRef.current?.scrollIntoView({
      behavior: reducedMotion() ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  const handleAddCard = () => {
    setToast(
      'Bank card management is not connected to a backend endpoint yet.'
    );
  };

  const handleWithdraw = () => {
    setToast(
      'Withdrawal requests are not connected to a backend endpoint yet.'
    );
  };

  const retryFinance = () => {
    loadFinance();
  };

  return (
    <div className="fn-page">
      <div className="fn-reveal" style={{ '--i': 0 }}>
        <FinanceHeader
          title="Finances"
          subtitle="Track your salary, bonuses, deductions and payroll payments."
        />
      </div>

      {error && (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          role="alert"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={retryFinance}
            className="mt-2 font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {loading && (
        <div
          className="rounded-lg border border-[#232323] bg-[#0a0a0a] p-4 text-sm text-gray-400"
          role="status"
        >
          Loading your finance information...
        </div>
      )}

      <div className="fn-reveal" style={{ '--i': 1 }}>
        <FinanceSummaryCards items={summaryItems} />
      </div>

      <div className="fn-row fn-row--top fn-reveal" style={{ '--i': 2 }}>
        <EarningsOverviewChart data={earnings} />

        <TotalBalanceCard
          cards={[]}
          balance={0}
          monthlyFee={0}
          loading={loading}
          error=""
          onAddCard={handleAddCard}
          onWithdraw={handleWithdraw}
          onViewTransactions={scrollToTransactions}
          onRetry={retryFinance}
        />
      </div>

      <div className="fn-row fn-row--bottom fn-reveal" style={{ '--i': 3 }}>
        <div ref={txRef} className="fn-grow">
          <TransactionsTable transactions={transactions} />
        </div>

        <BonusOverviewChart data={bonusData} />
      </div>

      {!loading && !error && transactions.length === 0 && (
        <p className="text-sm text-gray-400">
          No payroll records were found for your account yet.
        </p>
      )}

      {toast && (
        <div className="fn-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}