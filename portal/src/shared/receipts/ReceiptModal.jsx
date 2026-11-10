import { useEffect, useState } from 'react';
import { X, Download, Pencil, Check, History } from 'lucide-react';
import { money, fmtDay, fmtStamp, amountInWords, printReceipt } from './receiptUtils';

export function StatusBadge({ status }) {
  const paid = status === 'Completed';

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        paid
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
      }`}
    >
      {paid ? 'Paid' : 'Pending'}
    </span>
  );
}

function Line({ label, value, bold }) {
  return (
    <div className={`flex justify-between gap-4 border-b border-neutral-100 py-1.5 text-xs ${bold ? 'font-semibold' : ''}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="text-right text-neutral-900">{value}</span>
    </div>
  );
}

export default function ReceiptModal({
  receipt: r,
  onClose,
  onEdit,
  onMarkPaid,
  canManage = false,
  busy = false,
}) {
  const [tab, setTab] = useState('receipt');
  const paid = r.status === 'Completed';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col rounded-lg border border-[#232323] bg-[#0b0b0b] text-white shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232323] px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">{r.receiptNo}</h3>
            <p className="text-[11px] text-neutral-400">
              {r.employee?.name} · {r.periodLabel} · Revision {r.revision}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManage && !paid && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onMarkPaid?.(r)}
                className="inline-flex items-center gap-1.5 rounded border border-green-500/40 px-3 py-1.5 text-xs text-green-400 hover:bg-green-500/10 disabled:opacity-50"
              >
                <Check size={14} /> Mark as paid
              </button>
            )}
            {canManage && (
              <button
                type="button"
                onClick={() => onEdit?.(r)}
                className="inline-flex items-center gap-1.5 rounded border border-[#333] px-3 py-1.5 text-xs hover:border-[#c1121f] hover:bg-[#c1121f]/10"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => printReceipt(r)}
              className="inline-flex items-center gap-1.5 rounded bg-[#c1121f] px-3 py-1.5 text-xs font-medium hover:bg-[#a30f1a]"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded border border-[#333] p-1.5 hover:border-[#c1121f]"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex gap-1 border-b border-[#232323] px-4 pt-2 text-xs">
          {[['receipt', 'Receipt'], ['history', `History (${r.history.length || 1})`]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 ${
                tab === key ? 'border-[#c1121f] text-white' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {key === 'history' && <History size={13} />}
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === 'receipt' ? (
            <div className="rounded bg-white p-5 text-neutral-900 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-[#c1121f] pb-3">
                <div>
                  <p className="text-xl font-bold text-[#c1121f]">DigiAmplify</p>
                  <p className="text-[11px] text-neutral-500">Employee Payroll</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tracking-wide">PAYMENT RECEIPT</p>
                  <p className="text-[11px] text-neutral-500">{r.receiptNo}</p>
                  <span
                    className={`mt-1 inline-block rounded border-2 px-2 py-0.5 text-[11px] font-bold tracking-widest ${
                      paid ? 'border-green-700 text-green-700' : 'border-amber-700 text-amber-700'
                    }`}
                  >
                    {paid ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="my-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#c1121f]">Employee</p>
                  <p className="text-sm font-semibold">{r.employee?.name}</p>
                  <p className="text-xs text-neutral-600">{r.employee?.designation}</p>
                  <p className="text-xs text-neutral-600">{r.employee?.department}</p>
                  <p className="text-xs text-neutral-600">{r.employee?.email}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#c1121f]">Payment</p>
                  <Line label="Period" value={r.periodLabel} />
                  <Line label="Date" value={fmtDay(r.paymentDate)} />
                  <Line label="Method" value={r.method} />
                  {r.reference && <Line label="Reference" value={r.reference} />}
                  {r.bank && <Line label="Bank" value={`${r.bank}${r.account ? ` / ${r.account}` : ''}`} />}
                </div>
              </div>

              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Earnings</p>
              <Line label="Basic salary" value={money(r.basic)} />
              {r.allowance > 0 && <Line label="Allowances" value={money(r.allowance)} />}
              {r.overtime > 0 && <Line label="Overtime" value={money(r.overtime)} />}
              {r.bonus > 0 && <Line label="Bonus" value={money(r.bonus)} />}
              <Line label="Gross earnings" value={money(r.gross)} bold />

              {r.totalDeductions > 0 && (
                <>
                  <p className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Deductions</p>
                  {r.tax > 0 && <Line label="Tax" value={`- ${money(r.tax)}`} />}
                  {r.deduction > 0 && <Line label="Other deductions" value={`- ${money(r.deduction)}`} />}
                  <Line label="Total deductions" value={`- ${money(r.totalDeductions)}`} bold />
                </>
              )}

              <div className="mt-4 flex items-center justify-between bg-neutral-900 px-4 py-3 text-white">
                <span className="text-xs tracking-widest">NET PAY</span>
                <span className="text-lg font-bold">{money(r.netPay)}</span>
              </div>
              <p className="mt-2 text-xs italic text-neutral-600">{amountInWords(r.netPay)}</p>
              {r.remarks && <p className="mt-2 text-xs text-neutral-500">Remarks: {r.remarks}</p>}
            </div>
          ) : (
            <ol className="space-y-3">
              {[...(r.history.length ? r.history : [{ rev: 1, at: r.issuedAt, by: 'Admin', action: 'Created', changes: [] }])]
                .reverse()
                .map((h) => (
                  <li key={h.rev} className="rounded border border-[#232323] bg-[#111] p-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">
                        Rev {h.rev} · {h.action}
                      </span>
                      <span className="text-neutral-400">{fmtStamp(h.at)}</span>
                    </div>
                    <p className="mt-0.5 text-neutral-400">by {h.by}</p>
                    {h.changes?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {h.changes.map((c) => (
                          <li key={c.field} className="text-neutral-300">
                            {c.field}: <span className="text-red-300">{String(c.from) || '—'}</span> →{' '}
                            <span className="text-green-300">{String(c.to) || '—'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}