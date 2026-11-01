// Mock data for the Admin Finance page.
// Replace these exports with API responses when your backend is ready.

export const MOCK_STATS = [
  { id: 'total', label: 'Total Payroll', value: 'PKR 1,23456', sub: 'For 32 Employees', tone: 'red' },
  { id: 'paid', label: 'Paid Amount', value: 'PKR 1,23456', sub: '17% of total payroll', tone: 'green' },
  { id: 'pending', label: 'Pending Amount', value: 'PKR 1,23456', sub: '27% of total payroll', tone: 'amber' },
  { id: 'overdue', label: 'Overdue Payments', value: 'PKR 1,23456', sub: '5 Employees', tone: 'danger' },
];

// Values are in thousands (K).
export const PAYROLL_SERIES = {
  Month: [
    { label: 'Jan 26', value: 330 }, { label: 'Feb 26', value: 570 },
    { label: 'Mar 26', value: 640 }, { label: 'Apr 26', value: 600 },
    { label: 'May 26', value: 740 }, { label: 'Jun 26', value: 640 },
    { label: 'Jul 26', value: 870 }, { label: 'Aug 26', value: 690 },
    { label: 'Sep 26', value: 870 }, { label: 'Oct 26', value: 690 },
    { label: 'Nov 26', value: 590 }, { label: 'Dec 26', value: 740 },
  ],
  Quarter: [
    { label: 'Q1 26', value: 513 }, { label: 'Q2 26', value: 663 },
    { label: 'Q3 26', value: 780 }, { label: 'Q4 26', value: 673 },
  ],
};

export const MOCK_ALERTS = [
  { id: 'a1', text: 'Payroll generated for July 2026', date: '31 July 2026, 10:30 AM' },
  { id: 'a2', text: 'Bonus added for 3 employees', date: '31 July 2026, 10:30 AM' },
  { id: 'a3', text: 'Deduction updated for 2 employees', date: '31 July 2026, 10:30 AM' },
  { id: 'a4', text: 'Payslip generated for 10 employees', date: '31 July 2026, 10:30 AM' },
];

const base = { department: 'Development', bank: 'Faysal Bank', account: '#12345', date: '30 July 2026, 10:30 AM' };
export const MOCK_EMPLOYEES = [
  { id: 1, name: 'Fahad', role: 'Web Developer', salary: 1234, bonus: 123, deduction: 12, status: 'Completed' },
  { id: 2, name: 'Fahad', role: 'Web Developer', salary: 1234, bonus: 123, deduction: null, status: 'Completed' },
  { id: 3, name: 'Fahad', role: 'Web Developer', salary: 1234, bonus: null, deduction: 12, status: 'Pending' },
  { id: 4, name: 'Fahad', role: 'Web Developer', salary: 1234, bonus: 123, deduction: 12, status: 'Completed' },
  { id: 5, name: 'Fahad', role: 'Web Developer', salary: 1234, bonus: 123, deduction: 12, status: 'Completed' },
  { id: 6, name: 'Sara Khan', role: 'UI/UX Designer', department: 'Design', salary: 1400, bonus: 150, deduction: 20, status: 'Completed' },
  { id: 7, name: 'Ali Raza', role: 'QA Engineer', department: 'Quality', salary: 1100, bonus: null, deduction: null, status: 'Pending' },
  { id: 8, name: 'Hina Malik', role: 'HR Executive', department: 'HR', salary: 1000, bonus: 80, deduction: 10, status: 'Completed' },
  { id: 9, name: 'Usman Tariq', role: 'App Developer', salary: 1500, bonus: 200, deduction: 25, status: 'Completed' },
  { id: 10, name: 'Ayesha Noor', role: 'Designer', department: 'Design', salary: 1300, bonus: 100, deduction: null, status: 'Pending' },
  { id: 11, name: 'Jhon Ken', role: 'App Developer', salary: 1500, bonus: 120, deduction: 15, status: 'Completed' },
  { id: 12, name: 'Jame Jhon', role: 'UI/UX Designer', department: 'Design', salary: 1350, bonus: null, deduction: 12, status: 'Completed' },
  { id: 13, name: 'Bilal Ahmed', role: 'Accountant', department: 'Finance', salary: 1200, bonus: 90, deduction: 18, status: 'Pending' },
].map((e) => ({ ...base, ...e }));