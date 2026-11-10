import { useCallback, useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { getMyReceipts } from '@/services/financeService';
import ReceiptModal, { StatusBadge } from '@/shared/receipts/ReceiptModal';
import { money, fmtDay, printReceipt } from '@/shared/receipts/receiptUtils';

const sel =
  'rounded border border-[#232323] bg-[#101010] px-3 py-2 text-xs text-white outline-none focus:border-[#d4101f]';

export default function MyReceiptsSection() {
  const nowYear = new Date().getFullYear();
  const [year, setYear] = useState(String(nowYear));
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ receipts: [], summary: null, pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async (signal) => {
    setError('');
    try {
      const res = await getMyReceipts({ year, status, page, limit: 6, signal });
      if (!signal?.aborted) setData(res);
    } catch (e) {
      if (!signal?.aborted) setError(e.message || 'Could not load your receipts.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [year, status, page]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  // Admin ke edit ke baad wapas tab par aane par fresh data
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const s = data.summary;
  const pg = data.pagination;
  const cards = [
    ['Received', s ? money(s.paid) : '—', 'text-green-400'],
    ['Pending', s ? money(s.pending) : '—', 'text-amber-400'],
    ['Receipts', s ? s.count : '—', 'text-white'],
  ];

  return (
    <section className="space-y-3 text-white">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">My Receipts</h2>
          <p className="text-xs text-neutral-400">Payment receipts sent by the Admin. Click the PDF button to download your receipt.</p>
        </div>
        <div className="flex gap-2">
          <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} className={sel}>
            <option value="All">All years</option>
            {[0, 1, 2, 3].map((i) => <option key={i} value={nowYear - i}>{nowYear - i}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={sel}>
            <option value="All">All status</option>
            <option value="Completed">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(([label, value, tone]) => (
          <div key={label} className="rounded-[3px] border border-[#222] bg-[#0b0b0b] p-3">
            <p className="text-[11px] text-neutral-400">{label}</p>
            <p className={`mt-1 truncate text-base font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">{error}</p>
      )}

      <div className="overflow-x-auto rounded-[3px] border border-[#222] bg-[#0b0b0b]">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="border-b border-[#222] text-[11px] uppercase tracking-wide text-neutral-400">
            <tr>
              {['Receipt', 'Period', 'Net pay', 'Method', 'Date', 'Status', ''].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-neutral-400">Loading receipts...</td></tr>
            )}
            {!loading && data.receipts.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-neutral-400">Abhi tak koi receipt nahi mili.</td></tr>
            )}
            {!loading && data.receipts.map((r) => (
              <tr key={r.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02]">
                <td className="px-3 py-3 font-mono text-[11px] text-neutral-300">{r.receiptNo}</td>
                <td className="px-3 py-3">{r.periodLabel}</td>
                <td className="px-3 py-3 font-semibold">{money(r.netPay)}</td>
                <td className="px-3 py-3 text-neutral-300">{r.method}</td>
                <td className="px-3 py-3 text-neutral-300">{fmtDay(r.paymentDate)}</td>
                <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button type="button" title="View receipt" onClick={() => setViewing(r)} className="rounded border border-[#333] p-1.5 hover:border-[#d4101f]"><Eye size={14} /></button>
                    <button type="button" title="Download PDF" onClick={() => printReceipt(r)} className="rounded border border-[#333] p-1.5 hover:border-[#d4101f]"><Download size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pg && pg.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Page {pg.page} of {pg.totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border border-[#333] px-3 py-1.5 hover:border-[#d4101f] disabled:opacity-40">Previous</button>
            <button type="button" disabled={page >= pg.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded border border-[#333] px-3 py-1.5 hover:border-[#d4101f] disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {viewing && <ReceiptModal receipt={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}