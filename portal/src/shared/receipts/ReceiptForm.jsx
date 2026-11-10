import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { MONTHS, METHODS, money } from './receiptUtils';

const inp =
  'mt-1 w-full rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f] disabled:opacity-60';

const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const initial = (r) => ({
  employeeId: r?.employee?.id || '',
  month: r?.month || new Date().getMonth() + 1,
  year: r?.year || new Date().getFullYear(),
  basic: r?.basic ?? '',
  allowance: r?.allowance ?? 0,
  overtime: r?.overtime ?? 0,
  bonus: r?.bonus ?? 0,
  tax: r?.tax ?? 0,
  deduction: r?.deduction ?? 0,
  method: r?.method || 'Bank Transfer',
  reference: r?.reference || '',
  bank: r?.bank || '',
  account: r?.account || '',
  paymentDate: r?.paymentDate || todayISO(),
  status: r?.status || 'Pending',
  remarks: r?.remarks || '',
});

function Field({ label, children, className = '' }) {
  return (
    <label className={`block text-[11px] text-neutral-400 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export default function ReceiptForm({ receipt, employees, saving, error, onSubmit, onClose }) {
  const editing = Boolean(receipt);
  const [form, setForm] = useState(() => initial(receipt));
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const totals = useMemo(() => {
    const n = (k) => Number(form[k]) || 0;
    const gross = n('basic') + n('allowance') + n('overtime') + n('bonus');
    const ded = n('tax') + n('deduction');
    return { gross, ded, net: gross - ded };
  }, [form]);

  const year = new Date().getFullYear();

  const submit = (e) => {
    e.preventDefault();
    const n = (k) => Number(form[k]) || 0;

    onSubmit({
      employeeId: form.employeeId,
      month: Number(form.month),
      year: Number(form.year),
      basic: n('basic'),
      allowance: n('allowance'),
      overtime: n('overtime'),
      bonus: n('bonus'),
      tax: n('tax'),
      deduction: n('deduction'),
      method: form.method,
      reference: form.reference,
      bank: form.bank,
      account: form.account,
      paymentDate: form.paymentDate || null,
      status: form.status,
      remarks: form.remarks,
    });
  };

  const money1 = (key, label) => (
    <Field label={label}>
      <input
        type="number"
        min="0"
        step="0.01"
        value={form[key]}
        onChange={set(key)}
        className={inp}
        required={key === 'basic'}
      />
    </Field>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col rounded-lg border border-[#232323] bg-[#0b0b0b] text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#232323] px-4 py-3">
          <h3 className="text-sm font-semibold">
            {editing ? `Edit receipt ${receipt.receiptNo}` : 'New payment & receipt'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded border border-[#333] p-1.5 hover:border-[#c1121f]"
          >
            <X size={16} />
          </button>
        </header>

        <form onSubmit={submit} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {error && (
            <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
              {error}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Employee" className="sm:col-span-1">
              <select value={form.employeeId} onChange={set('employeeId')} className={inp} disabled={editing} required>
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Month">
              <select value={form.month} onChange={set('month')} className={inp}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <select value={form.year} onChange={set('year')} className={inp}>
                {[year - 2, year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {money1('basic', 'Basic salary (PKR)')}
            {money1('allowance', 'Allowances')}
            {money1('overtime', 'Overtime')}
            {money1('bonus', 'Bonus')}
            {money1('tax', 'Tax')}
            {money1('deduction', 'Other deductions')}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Payment method">
              <select value={form.method} onChange={set('method')} className={inp}>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Reference / transaction no.">
              <input value={form.reference} onChange={set('reference')} className={inp} maxLength={80} />
            </Field>
            <Field label="Payment date">
              <input type="date" value={form.paymentDate} onChange={set('paymentDate')} className={inp} />
            </Field>
            <Field label="Bank">
              <input value={form.bank} onChange={set('bank')} className={inp} maxLength={100} placeholder="Auto from profile" />
            </Field>
            <Field label="Account no.">
              <input value={form.account} onChange={set('account')} className={inp} maxLength={100} placeholder="Auto from profile" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className={inp}>
                <option value="Pending">Pending</option>
                <option value="Completed">Paid (Completed)</option>
              </select>
            </Field>
          </div>

          <Field label="Remarks (visible to the employee on the receipt)">
            <textarea value={form.remarks} onChange={set('remarks')} rows={2} maxLength={2000} className={inp} />
          </Field>

          <div className="grid grid-cols-3 gap-2 rounded border border-[#232323] bg-[#111] p-3 text-center text-xs">
            <div><p className="text-neutral-400">Gross</p><p className="font-semibold">{money(totals.gross)}</p></div>
            <div><p className="text-neutral-400">Deductions</p><p className="font-semibold text-red-300">- {money(totals.ded)}</p></div>
            <div><p className="text-neutral-400">Net pay</p><p className="font-semibold text-green-400">{money(totals.net)}</p></div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded border border-[#333] px-4 py-2 text-xs hover:border-[#c1121f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || totals.net < 0}
              className="rounded bg-[#c1121f] px-5 py-2 text-xs font-medium hover:bg-[#a30f1a] disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Generate receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}