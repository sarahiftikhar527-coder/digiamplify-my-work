import { useState } from 'react';
import AdminFinancePageBase from './AdminFinancePageBase';
import AdminReceiptsPanel from '../../components/AdminReceiptsPanel';

const TABS = [
  ['payroll', 'Payroll Overview'],
  ['receipts', 'Payments & Receipts'],
];

export default function AdminFinancePage() {
  const [tab, setTab] = useState('receipts');

  return (
    <div>
      <div className="flex gap-2 px-4 pt-4 sm:px-6">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
              tab === key
                ? 'border-[#c1121f] bg-[#c1121f] text-white'
                : 'border-[#303030] bg-[#111] text-neutral-300 hover:border-[#c1121f]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'payroll' ? (
        <AdminFinancePageBase />
      ) : (
        <div className="p-4 sm:p-6">
          <AdminReceiptsPanel />
        </div>
      )}
    </div>
  );
}