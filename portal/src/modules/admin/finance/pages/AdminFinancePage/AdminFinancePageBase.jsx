
import { useCallback, useEffect, useState } from 'react';
import { X, CalendarDays } from 'lucide-react';
import PayrollStatCards from '../../components/PayrollStatCards';
import MonthlyPayrollChart from '../../components/MonthlyPayrollChart';
import PayrollAlerts from '../../components/PayrollAlerts';
import PayrollTable from '../../components/PayrollTable';
import {
  getFinanceDashboard,
  getPayrollRecords,
  getProfileEmployees,
  createPayrollRecord,
  updatePayrollRecord,
} from '@/services/financeService';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const greeting = (date) => {
  const hour = date.getHours();

  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const longDate = (date) =>
  `${date.toLocaleDateString('en-GB', {
    weekday: 'long',
  })}, ${date.getDate()} ${date.toLocaleDateString('en-GB', {
    month: 'long',
  })} ${date.getFullYear()}`;

const unwrapResponse = (response) => response?.data ?? response;

const getDashboardData = (response) => {
  const data = unwrapResponse(response);

  return {
    stats: Array.isArray(data?.stats) ? data.stats : [],
    chart: data?.chart ?? data?.series ?? {},
    alerts: Array.isArray(data?.alerts) ? data.alerts : [],
  };
};

const getPayrollData = (response) => {
  const data = unwrapResponse(response);

  return {
    employees: Array.isArray(data?.employees)
      ? data.employees
      : Array.isArray(data?.records)
        ? data.records
        : Array.isArray(data?.payroll)
          ? data.payroll
          : [],
    departments: Array.isArray(data?.departments)
      ? data.departments
      : [],
    pagination: data?.pagination ?? null,
  };
};

const getProfileEmployeesData = (response) => {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.employees)) return data.employees;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getEmployeeId = (employee) =>
  String(
    employee?.employeeId ??
      employee?.userId ??
      employee?._id ??
      employee?.id ??
      employee?.user?._id ??
      ''
  );

const getEmployeeName = (employee) =>
  employee?.fullName ||
  employee?.name ||
  employee?.user?.name ||
  employee?.email ||
  'Employee';

const todayISO = () => {
  const date = new Date();
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 10);
};

const emptyPayrollForm = {
  employeeId: '',
  salary: '',
  bonus: '0',
  deduction: '0',
  bank: '',
  account: '',
  paymentDate: todayISO(),
  status: 'Pending',
  notes: '',
};

const formatAmount = (value) =>
  Number(value || 0).toLocaleString('en-PK');

export default function AdminFinancePage() {
  const [currentDate] = useState(() => new Date());

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear()
  );

  const [dashboard, setDashboard] = useState({
    stats: [],
    chart: {},
    alerts: [],
  });

  const [employees, setEmployees] = useState([]);
  const [profileEmployees, setProfileEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingProfileEmployees, setLoadingProfileEmployees] =
    useState(false);
  const [error, setError] = useState('');
  const [profileEmployeesError, setProfileEmployeesError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [savingPayroll, setSavingPayroll] = useState(false);
  const [payrollMessage, setPayrollMessage] = useState('');
  const [payrollError, setPayrollError] = useState('');
  const [editingPayrollId, setEditingPayrollId] = useState('');
  const [payrollForm, setPayrollForm] = useState(emptyPayrollForm);

  const [payrollQuery, setPayrollQuery] = useState({
    page: 1,
    limit: 5,
    search: '',
    status: 'All',
    department: 'All',
  });

  const month = selectedMonth;
  const year = selectedYear;

  const yearOptions = Array.from(
    { length: 12 },
    (_, index) => currentDate.getFullYear() - 10 + index
  );

  const selectedPeriodLabel = `${monthNames[month - 1]} ${year}`;

  const loadFinanceData = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');

      const params = {
        month,
        year,
        page: payrollQuery.page,
        limit: payrollQuery.limit,
      };

      if (payrollQuery.search.trim()) {
        params.search = payrollQuery.search.trim();
      }

      if (payrollQuery.status !== 'All') {
        params.status = payrollQuery.status;
      }

      if (payrollQuery.department !== 'All') {
        params.department = payrollQuery.department;
      }

      const [dashboardResult, payrollResult] =
        await Promise.allSettled([
          getFinanceDashboard({ month, year, signal }),
          getPayrollRecords({ ...params, signal }),
        ]);

      if (signal.aborted) return;

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(getDashboardData(dashboardResult.value));
      } else {
        setError(
          dashboardResult.reason?.response?.data?.message ||
            dashboardResult.reason?.message ||
            'Unable to load finance dashboard.'
        );
      }

      if (payrollResult.status === 'fulfilled') {
        const payrollData = getPayrollData(payrollResult.value);

        setEmployees(payrollData.employees);
        setDepartments(payrollData.departments);
        setPagination(payrollData.pagination);
      } else {
        setError((current) =>
          [
            current,
            payrollResult.reason?.response?.data?.message ||
              payrollResult.reason?.message ||
              'Unable to load payroll records.',
          ]
            .filter(Boolean)
            .join(' ')
        );
      }

      setLoading(false);
    },
    [month, year, payrollQuery]
  );

  const loadProfileEmployees = useCallback(async (signal) => {
    setLoadingProfileEmployees(true);
    setProfileEmployeesError('');

    try {
      const response = await getProfileEmployees({ signal });

      if (signal.aborted) return;

      setProfileEmployees(getProfileEmployeesData(response));
    } catch (requestError) {
      if (signal.aborted) return;

      setProfileEmployeesError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          'Unable to load employees from profiles.'
      );
    } finally {
      if (!signal.aborted) {
        setLoadingProfileEmployees(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadFinanceData(controller.signal);

    return () => controller.abort();
  }, [loadFinanceData, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();

    loadProfileEmployees(controller.signal);

    return () => controller.abort();
  }, [loadProfileEmployees, refreshKey]);

  useEffect(() => {
    if (!showPayrollForm) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !savingPayroll) {
        setShowPayrollForm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPayrollForm, savingPayroll]);

  const retry = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  const handleMonthChange = (event) => {
    setSelectedMonth(Number(event.target.value));

    setPayrollQuery((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));

    setPayrollQuery((current) => ({
      ...current,
      page: 1,
    }));
  };

  const openPayrollModal = () => {
    setEditingPayrollId('');
    setPayrollForm({
      ...emptyPayrollForm,
      paymentDate: todayISO(),
    });
    setPayrollError('');
    setPayrollMessage('');
    setShowPayrollForm(true);
  };

  const closePayrollModal = () => {
    if (savingPayroll) return;

    setShowPayrollForm(false);
    setEditingPayrollId('');
    setPayrollError('');
    setPayrollMessage('');
  };

  const handleSearchChange = useCallback((search) => {
    setPayrollQuery((current) => ({
      ...current,
      search,
      page: 1,
    }));
  }, []);

  const handleFiltersChange = useCallback((filters) => {
    setPayrollQuery((current) => ({
      ...current,
      status: filters.status,
      department: filters.department,
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPayrollQuery((current) => ({
      ...current,
      page,
    }));
  }, []);

  const handleEmployeeChange = (employeeId) => {
    const employee = profileEmployees.find(
      (item) => getEmployeeId(item) === String(employeeId)
    );

    setEditingPayrollId('');
    setPayrollMessage('');
    setPayrollError('');

    setPayrollForm({
      ...emptyPayrollForm,
      employeeId,
      salary: employee ? String(employee.salary ?? 0) : '',
      bonus: String(employee?.bonus ?? 0),
      deduction: '0',
      bank: employee?.bankName ?? '',
      account: employee?.accountNumber ?? '',
      paymentDate: employee?.salaryPaymentDate
        ? String(employee.salaryPaymentDate).slice(0, 10)
        : todayISO(),
      status: 'Pending',
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setPayrollForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditPayroll = (employee) => {
    setEditingPayrollId(
      String(employee.id ?? employee._id ?? employee.payrollId ?? '')
    );

    setPayrollMessage('');
    setPayrollError('');

    if (employee.periodMonth) {
      setSelectedMonth(Number(employee.periodMonth));
    }

    if (employee.periodYear) {
      setSelectedYear(Number(employee.periodYear));
    }

    setPayrollForm({
      employeeId: getEmployeeId(employee),
      salary: String(employee.salary ?? ''),
      bonus: String(employee.bonus ?? 0),
      deduction: String(employee.deduction ?? 0),
      bank: employee.bank ?? employee.bankName ?? '',
      account: employee.account ?? employee.accountNumber ?? '',
      paymentDate: employee.paymentDate
        ? String(employee.paymentDate).slice(0, 10)
        : todayISO(),
      status: employee.status === 'Completed' ? 'Completed' : 'Pending',
      notes: employee.notes ?? '',
    });

    setShowPayrollForm(true);
  };

  const handleSavePayroll = async (event) => {
    event.preventDefault();

    setPayrollMessage('');
    setPayrollError('');

    if (!payrollForm.employeeId) {
      setPayrollError('Please select an employee.');
      return;
    }

    const salary = Number(payrollForm.salary);
    const bonus = Number(payrollForm.bonus);
    const deduction = Number(payrollForm.deduction);

    if (
      payrollForm.salary === '' ||
      !Number.isFinite(salary) ||
      !Number.isFinite(bonus) ||
      !Number.isFinite(deduction) ||
      salary < 0 ||
      bonus < 0 ||
      deduction < 0
    ) {
      setPayrollError(
        'Salary, bonus and deduction must be valid non-negative amounts.'
      );
      return;
    }

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 9999
    ) {
      setPayrollError('Please select a valid payroll month and year.');
      return;
    }

    setSavingPayroll(true);

    try {
      const payload = {
        employeeId: payrollForm.employeeId,
        salary,
        bonus,
        deduction,
        bank: payrollForm.bank.trim(),
        account: payrollForm.account.trim(),
        paymentDate: payrollForm.paymentDate || null,
        periodMonth: month,
        periodYear: year,
        status: payrollForm.status,
        notes: payrollForm.notes.trim(),
      };

      if (editingPayrollId) {
        await updatePayrollRecord(editingPayrollId, payload);
        setPayrollMessage(
          `Payroll record for ${selectedPeriodLabel} updated successfully.`
        );
      } else {
        await createPayrollRecord(payload);
        setPayrollMessage(
          `Payroll record for ${selectedPeriodLabel} created successfully.`
        );
      }

      setEditingPayrollId('');
      setPayrollForm({
        ...emptyPayrollForm,
        paymentDate: todayISO(),
      });

      retry();
    } catch (requestError) {
      const statusCode = requestError?.response?.status;

      setPayrollError(
        statusCode === 409
          ? 'A payroll record already exists for this employee and month. Select that month to edit the existing record.'
          : requestError?.response?.data?.message ||
              requestError?.message ||
              'Unable to save payroll. Please try again.'
      );
    } finally {
      setSavingPayroll(false);
    }
  };

  const selectedProfileEmployee = profileEmployees.find(
    (employee) => getEmployeeId(employee) === payrollForm.employeeId
  );

  return (
    <div className="min-h-screen bg-black p-4 font-['Poppins',sans-serif] text-white sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {greeting(currentDate)}{' '}
            <span className="text-[#c1121f]">Admin</span>
          </h1>

          <p className="mt-1 text-xs text-neutral-300">
            It&apos;s {longDate(currentDate)}.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="finance-month"
                className="mb-1 block text-[11px] text-neutral-400"
              >
                Payroll month
              </label>

              <select
                id="finance-month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="min-w-36 rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="finance-year"
                className="mb-1 block text-[11px] text-neutral-400"
              >
                Payroll year
              </label>

              <select
                id="finance-year"
                value={selectedYear}
                onChange={handleYearChange}
                className="min-w-24 rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
              >
                {yearOptions.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded border border-[#3a2023] bg-[#c1121f]/10 px-3 py-2.5 text-xs text-red-200">
              <CalendarDays size={14} />
              {selectedPeriodLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPayrollModal}
            className="rounded border border-[#c1121f] px-3 py-2 text-xs transition hover:bg-[#c1121f]/15"
          >
            Manage Payroll
          </button>

          <button
            type="button"
            onClick={retry}
            disabled={loading || loadingProfileEmployees}
            className="rounded border border-[#2a2a2a] px-3 py-2 text-xs transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading || loadingProfileEmployees ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="mb-4 rounded-lg border border-[#252525] bg-[#0b0b0b] px-4 py-3 text-xs text-neutral-300">
        Showing finance and payroll records for{' '}
        <span className="font-medium text-white">
          {selectedPeriodLabel}
        </span>
        . Select another month or year to view or add its payroll records.
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-900 bg-red-950/30 p-3 text-xs text-red-300"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={retry}
            className="rounded border border-red-800 px-3 py-1.5 hover:bg-red-900/30"
          >
            Try again
          </button>
        </div>
      )}

      <div className="space-y-4">
        <PayrollStatCards stats={dashboard.stats} loading={loading} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <MonthlyPayrollChart
            series={dashboard.chart}
            loading={loading}
          />

          <PayrollAlerts alerts={dashboard.alerts} loading={loading} />
        </div>

        <PayrollTable
          employees={employees}
          departments={departments}
          pagination={pagination}
          loading={loading}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
          onPageChange={handlePageChange}
          onRefresh={retry}
        />
      </div>

      {showPayrollForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePayrollModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payroll-modal-title"
            className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[#343434] bg-[#090909] shadow-2xl shadow-black/70"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#252525] px-4 py-3 sm:px-5">
              <div>
                <h2
                  id="payroll-modal-title"
                  className="text-base font-semibold"
                >
                  {editingPayrollId ? 'Edit Payroll' : 'Manage Payroll'}
                </h2>

                <p className="mt-1 text-[11px] text-neutral-400">
                  Payroll period: {selectedPeriodLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={closePayrollModal}
                disabled={savingPayroll}
                aria-label="Close payroll modal"
                className="rounded-md border border-[#333] p-2 text-neutral-300 transition hover:border-[#c1121f] hover:bg-[#c1121f]/10 hover:text-white disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <form onSubmit={handleSavePayroll} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block text-[11px] text-neutral-400">
                    Employee

                    <select
                      name="employeeId"
                      value={payrollForm.employeeId}
                      onChange={(event) =>
                        handleEmployeeChange(event.target.value)
                      }
                      disabled={Boolean(editingPayrollId)}
                      className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f] disabled:opacity-70"
                      required
                    >
                      <option value="">
                        {loadingProfileEmployees
                          ? 'Loading employees...'
                          : 'Select employee'}
                      </option>

                      {profileEmployees.map((employee) => {
                        const employeeId = getEmployeeId(employee);

                        if (!employeeId) return null;

                        return (
                          <option key={employeeId} value={employeeId}>
                            {getEmployeeName(employee)}
                          </option>
                        );
                      })}
                    </select>

                    {profileEmployeesError && (
                      <span className="mt-1 block text-[10px] text-red-400">
                        {profileEmployeesError}
                      </span>
                    )}

                    {!loadingProfileEmployees &&
                      !profileEmployeesError &&
                      profileEmployees.length === 0 && (
                        <span className="mt-1 block text-[10px] text-amber-400">
                          No employees found in the profile API.
                        </span>
                      )}
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Department

                    <input
                      value={selectedProfileEmployee?.department || ''}
                      readOnly
                      placeholder="Profile department"
                      className="mt-1 w-full rounded border border-[#252525] bg-[#111] px-3 py-2.5 text-xs text-neutral-300 outline-none"
                    />
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Salary (PKR)

                    <input
                      name="salary"
                      type="number"
                      min="0"
                      step="0.01"
                      value={payrollForm.salary}
                      readOnly
                      placeholder="Employee salary"
                      className="mt-1 w-full rounded border border-[#252525] bg-[#111] px-3 py-2.5 text-xs text-neutral-300 outline-none"
                      required
                    />
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Bonus (PKR)

                    <input
                      name="bonus"
                      type="number"
                      min="0"
                      step="0.01"
                      value={payrollForm.bonus}
                      onChange={handleFormChange}
                      className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
                    />
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Deduction (PKR)

                    <input
                      name="deduction"
                      type="number"
                      min="0"
                      step="0.01"
                      value={payrollForm.deduction}
                      onChange={handleFormChange}
                      className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
                    />
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Bank

                    <input
                      name="bank"
                      value={payrollForm.bank}
                      onChange={handleFormChange}
                      placeholder="Bank name"
                      className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
                    />
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Account number

                    <input
                      name="account"
                      value={payrollForm.account}
                      onChange={handleFormChange}
                      placeholder="Account number"
                      className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
                    />
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Payment date

                    <input
                      name="paymentDate"
                      type="date"
                      value={payrollForm.paymentDate}
                      onChange={handleFormChange}
                      className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
                    />
                  </label>

                  <label className="block text-[11px] text-neutral-400">
                    Status

                    <select
                      name="status"
                      value={payrollForm.status}
                      onChange={handleFormChange}
                      className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
                    >
                      <option value="Pending">Unpaid</option>
                      <option value="Completed">Paid</option>
                    </select>
                  </label>
                </div>

                <label className="block text-[11px] text-neutral-400">
                  Notes

                  <input
                    name="notes"
                    value={payrollForm.notes}
                    onChange={handleFormChange}
                    placeholder="Optional payroll note"
                    className="mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]"
                  />
                </label>

                {payrollError && (
                  <p role="alert" className="text-xs text-red-400">
                    {payrollError}
                  </p>
                )}

                {payrollMessage && (
                  <p role="status" className="text-xs text-green-400">
                    {payrollMessage}
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={savingPayroll}
                    onClick={() => {
                      setPayrollForm({
                        ...emptyPayrollForm,
                        paymentDate: todayISO(),
                      });
                      setEditingPayrollId('');
                      setPayrollError('');
                      setPayrollMessage('');
                    }}
                    className="rounded border border-[#303030] px-4 py-2 text-xs hover:bg-white/5 disabled:opacity-50"
                  >
                    Clear
                  </button>

                  <button
                    type="submit"
                    disabled={savingPayroll || !payrollForm.employeeId}
                    className="rounded bg-[#c1121f] px-4 py-2 text-xs font-medium transition hover:bg-[#a40f1a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingPayroll
                      ? 'Saving...'
                      : editingPayrollId
                        ? 'Update Payroll'
                        : 'Save Payroll'}
                  </button>
                </div>
              </form>

              <div className="mt-5 overflow-x-auto rounded-lg border border-[#252525]">
                <table className="w-full min-w-[900px] text-left text-[11px]">
                  <thead className="bg-[#111] text-neutral-400">
                    <tr>
                      {[
                        'Employee',
                        'Department',
                        'Salary',
                        'Bonus',
                        'Deduction',
                        'Bank',
                        'Date',
                        'Status',
                        'Action',
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap px-3 py-3 font-medium"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-3 py-6 text-center text-neutral-500"
                        >
                          {loading
                            ? 'Loading payroll records...'
                            : `No payroll records found for ${selectedPeriodLabel}.`}
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee, index) => (
                        <tr
                          key={
                            employee.id ||
                            employee._id ||
                            `${getEmployeeId(employee)}-${index}`
                          }
                          className="border-t border-[#252525] hover:bg-white/[0.025]"
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-medium">
                            {getEmployeeName(employee)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-neutral-300">
                            {employee.department || 'Unassigned'}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            {formatAmount(employee.salary)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            {formatAmount(employee.bonus)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            {formatAmount(employee.deduction)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            {employee.bank || employee.bankName || '—'}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            {employee.date ||
                              employee.paymentDate ||
                              'Not scheduled'}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            <span
                              className={`rounded px-2 py-1 ${
                                employee.status === 'Completed'
                                  ? 'bg-green-950/60 text-green-400'
                                  : 'bg-amber-950/60 text-amber-400'
                              }`}
                            >
                              {employee.status === 'Completed'
                                ? 'Paid'
                                : 'Unpaid'}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleEditPayroll(employee)}
                              className="rounded border border-[#383838] px-2.5 py-1.5 transition hover:border-[#c1121f] hover:text-red-300"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
