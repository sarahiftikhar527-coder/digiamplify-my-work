// Finance Data - Clean production state (no mock records)

export const MOCK_STATS = [
  { id: 'total', label: 'Total Payroll', value: 'PKR 0', sub: 'For 0 Employees', tone: 'red' },
  { id: 'paid', label: 'Paid Amount', value: 'PKR 0', sub: '0% of total payroll', tone: 'green' },
  { id: 'pending', label: 'Pending Amount', value: 'PKR 0', sub: '0% of total payroll', tone: 'amber' },
  { id: 'overdue', label: 'Overdue Payments', value: 'PKR 0', sub: '0 Employees', tone: 'danger' },
];

export const PAYROLL_SERIES = {
  Month: [],
  Quarter: [],
};

export const MOCK_ALERTS = [];

export const MOCK_EMPLOYEES = [];
