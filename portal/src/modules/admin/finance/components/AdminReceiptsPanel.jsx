import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Pencil, Check, Trash2, Download } from 'lucide-react';
import {
  getReceipts,
  createReceipt,
  updateReceipt,
  markReceiptPaid,
  deleteReceipt,
  getProfileEmployees,
} from '@/services/financeService';
import ReceiptModal, { StatusBadge } from '@/shared/receipts/ReceiptModal';
import ReceiptForm from '@/shared/receipts/ReceiptForm';
import { MONTHS, money, fmtDay, printReceipt } from '@/shared/receipts/receiptUtils';

const sel =
  'rounded border border-[#303030] bg-[#111] px-3 py-2.5 text-xs text-white outline-none focus:border-[#c1121f]';

const normalizeEmployees = (res) => {
  const data = res?.data ?? res;
  const list = Array.isArray(data) ? data : data?.employees || data?.data || [];

  return list
    .map((e) => ({
      id: String(e?.employeeId ?? e?.userId ?? e?._id ?? e?.id ?? e?.user?._id ?? ''),
      name: e?.fullName || e?.name || e?.user?.name || e?.email || 'Employee',
    }))
    .filter((e) => e.id);
};

export default function AdminReceiptsPanel() {
  const year = new Date().getFullYear();
  const [filters, setFilters] = useState({ status: 'All', month: '', year: '' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState({ receipts: [], summary: null, pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [employees, setEmployees] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | receipt
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    getProfileEmployees().then((r) => setEmployees(normalizeEmployees(r))).catch(() => {});
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getReceipts({ ...filters, search, page, limit: 10, signal: ctrl.signal });
        if (!ctrl.signal.aborted) setData(res);
      } catch (e) {
        if (!ctrl.signal.aborted) setError(e.message || 'Could not load receipts.');
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [filters, search, page, reload]);

  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const refresh = () => setReload((n) => n + 1);

  const handleSave = async (payload) => {
    const isEdit = editing && editing !== 'new';
    setSaving(true);
    setFormError('');

    try {
      const saved = isEdit ? await updateReceipt(editing.id, payload) : await createReceipt(payload);
      setEditing(null);
      setViewing(saved);
      setNotice(
       isEdit
  ? `Receipt ${saved.receiptNo} updated successfully. The employee has been notified.`
  : `Receipt ${saved.receiptNo} generated successfully and sent to ${saved.employee?.name}.`
      );
      refresh();
    } catch (e) {
      setFormError(e.message || 'Could not save receipt.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (r) => {
    setSaving(true);
    try {
      const saved = await markReceiptPaid(r.id);
      setNotice(`Receipt ${saved.receiptNo} marked as paid.`);
      setViewing((v) => (v && v.id === saved.id ? saved : v));
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete receipt ${r.receiptNo}? Employee ke payroll history se bhi hat jayegi.`)) return;
    try {
      await deleteReceipt(r.id);
      setNotice(`Receipt ${r.receiptNo} deleted.`);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  const s = data.summary;
  const pg = data.pagination;
  const cards = [
    ['Receipts', s ? s.count : '—', 'text-white'],
    ['Total net pay', s ? money(s.net) : '—', 'text-white'],
    ['Paid', s ? money(s.paid) : '—', 'text-green-400'],
    ['Pending', s ? money(s.pending) : '—', 'text-amber-400'],
  ];

  const iconBtn = 'rounded border border-[#333] p-1.5 text-neutral-300 hover:border-[#c1121f] hover:text-white';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-white">Payments & Receipts</h2>
          <p className="text-xs text-neutral-400">
           Once the payment is submitted, the receipt is immediately available to the employee. Any edits made to the receipt are automatically synced to the employee's side.   </p>
        </div>
        <button
          type="button"
          onClick={() => { setFormError(''); setEditing('new'); }}
          className="inline-flex items-center gap-2 rounded bg-[#c1121f] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#a30f1a]"
        >
          <Plus size={15} /> New payment
        </button>
      </div>

      {notice && (
        <p
          className="cursor-pointer rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-300"
          role="status"
          onClick={() => setNotice('')}
        >
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, tone]) => (
          <div key={label} className="rounded-lg border border-[#232323] bg-[#0b0b0b] p-4">
            <p className="text-[11px] text-neutral-400">{label}</p>
            <p className={`mt-1 truncate text-lg font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-52 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search employee or receipt no."
            className={`${sel} w-full pl-9`}
          />
        </div>
        <select value={filters.status} onChange={setFilter('status')} className={sel}>
          <option value="All">All status</option>
          <option value="Completed">Paid</option>
          <option value="Pending">Pending</option>
        </select>
        <select value={filters.month} onChange={setFilter('month')} className={sel}>
          <option value="">All months</option>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={filters.year} onChange={setFilter('year')} className={sel}>
          <option value="">All years</option>
          {[year - 2, year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#232323] bg-[#0b0b0b]">
        <table className="w-full min-w-[820px] text-left text-xs">
          <thead className="border-b border-[#232323] text-[11px] uppercase tracking-wide text-neutral-400">
            <tr>
              {['Receipt', 'Employee', 'Period', 'Net pay', 'Method', 'Status', 'Date', ''].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-neutral-400">Loading receipts...</td></tr>
            )}
            {!loading && data.receipts.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-neutral-400">No receipt received..</td></tr>
            )}
            {!loading && data.receipts.map((r) => (
              <tr key={r.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02]">
                <td className="px-3 py-3 font-mono text-[11px] text-neutral-300">
                  {r.receiptNo}
                  {r.revision > 1 && <span className="ml-1 text-amber-400">· r{r.revision}</span>}
                </td>
                <td className="px-3 py-3">
                  <p className="text-white">{r.employee?.name}</p>
                  <p className="text-[11px] text-neutral-500">{r.employee?.department || '—'}</p>
                </td>
                <td className="px-3 py-3 text-neutral-300">{r.periodLabel}</td>
                <td className="px-3 py-3 font-semibold text-white">{money(r.netPay)}</td>
                <td className="px-3 py-3 text-neutral-300">{r.method}</td>
                <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-3 text-neutral-300">{fmtDay(r.paymentDate)}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button type="button" title="View" onClick={() => setViewing(r)} className={iconBtn}><Eye size={14} /></button>
                    <button type="button" title="Edit" onClick={() => { setFormError(''); setEditing(r); }} className={iconBtn}><Pencil size={14} /></button>
                    {r.status !== 'Completed' && (
                      <button type="button" title="Mark as paid" onClick={() => handleMarkPaid(r)} className={iconBtn}><Check size={14} /></button>
                    )}
                    <button type="button" title="Download PDF" onClick={() => printReceipt(r)} className={iconBtn}><Download size={14} /></button>
                    <button type="button" title="Delete" onClick={() => handleDelete(r)} className={iconBtn}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pg && pg.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Page {pg.page} of {pg.totalPages} · {pg.total} receipts</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border border-[#333] px-3 py-1.5 hover:border-[#c1121f] disabled:opacity-40">Previous</button>
            <button type="button" disabled={page >= pg.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded border border-[#333] px-3 py-1.5 hover:border-[#c1121f] disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {viewing && !editing && (
        <ReceiptModal
          receipt={viewing}
          canManage
          busy={saving}
          onClose={() => setViewing(null)}
          onMarkPaid={handleMarkPaid}
          onEdit={(r) => { setFormError(''); setEditing(r); }}
        />
      )}

      {editing && (
        <ReceiptForm
          receipt={editing === 'new' ? null : editing}
          employees={employees}
          saving={saving}
          error={formError}
          onSubmit={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}