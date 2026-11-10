export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const METHODS = ['Bank Transfer', 'Cash', 'Cheque', 'Online Wallet'];

export const money = (v) => `PKR ${Number(v || 0).toLocaleString('en-PK')}`;

export const fmtDay = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
      })
    : '—';

export const fmtStamp = (v) =>
  v
    ? new Date(v).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
  'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const two = (n) =>
  n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');

const three = (n) =>
  (n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ' ' : ''}` : '') +
  (n % 100 ? two(n % 100) : '');

export const amountInWords = (value) => {
  let n = Math.floor(Math.abs(Number(value) || 0));
  if (!n) return 'Zero Rupees Only';

  const parts = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;

  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${three(lakh)} Lakh`);
  if (thousand) parts.push(`${three(thousand)} Thousand`);
  if (n) parts.push(three(n));

  return `${parts.join(' ')} Rupees Only`;
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

export const buildReceiptHtml = (r) => {
  const paid = r.status === 'Completed';
  const line = (label, value) =>
    `<tr><td>${esc(label)}</td><td class="r">${esc(value)}</td></tr>`;

  const earnings = [
    ['Basic salary', r.basic], ['Allowances', r.allowance],
    ['Overtime', r.overtime], ['Bonus', r.bonus],
  ].filter(([, v], i) => i === 0 || v > 0);

  const deductions = [['Tax', r.tax], ['Other deductions', r.deduction]].filter(([, v]) => v > 0);

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.receiptNo)}</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111;font-size:13px}
.page{max-width:720px;margin:auto;border:1px solid #ddd;padding:32px;position:relative}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #c1121f;padding-bottom:16px}
.brand{font-size:24px;font-weight:700;color:#c1121f}.muted{color:#666;font-size:12px}
h2{margin:0;font-size:18px;letter-spacing:1px;text-align:right}
.stamp{display:inline-block;margin-top:8px;border:2px solid ${paid ? '#15803d' : '#b45309'};color:${paid ? '#15803d' : '#b45309'};padding:3px 12px;font-weight:700;letter-spacing:2px;transform:rotate(-4deg)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:22px 0}
.grid h4{margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#c1121f}
.grid p{margin:3px 0}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
th{background:#f4f4f4;text-align:left;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
td{padding:8px 10px;border-bottom:1px solid #eee}.r{text-align:right}th.r{text-align:right}
.tot td{font-weight:700;border-top:2px solid #111;border-bottom:0}
.net{display:flex;justify-content:space-between;align-items:center;background:#111;color:#fff;padding:14px 18px;margin-top:10px}
.net b{font-size:20px}.words{margin:10px 0;font-style:italic;color:#444}
.foot{margin-top:26px;padding-top:12px;border-top:1px solid #ddd;color:#777;font-size:11px;text-align:center}
@media print{body{padding:0}.page{border:0}}
</style></head><body><div class="page">
<div class="top"><div><div class="brand">DigiAmplify</div><div class="muted">Employee Payroll</div></div>
<div><h2>PAYMENT RECEIPT</h2><div class="muted" style="text-align:right">${esc(r.receiptNo)}</div>
<div style="text-align:right"><span class="stamp">${paid ? 'PAID' : 'PENDING'}</span></div></div></div>
<div class="grid"><div><h4>Employee</h4><p><b>${esc(r.employee?.name)}</b></p>
<p>${esc(r.employee?.designation || '')}</p><p>${esc(r.employee?.department || '')}</p><p>${esc(r.employee?.email || '')}</p></div>
<div><h4>Payment details</h4><p>Period: <b>${esc(r.periodLabel)}</b></p>
<p>Payment date: ${esc(fmtDay(r.paymentDate))}</p><p>Method: ${esc(r.method)}</p>
${r.reference ? `<p>Reference: ${esc(r.reference)}</p>` : ''}
${r.bank ? `<p>Bank: ${esc(r.bank)}${r.account ? ` / ${esc(r.account)}` : ''}</p>` : ''}</div></div>
<table><tr><th>Earnings</th><th class="r">Amount</th></tr>${earnings.map(([l, v]) => line(l, money(v))).join('')}
<tr class="tot"><td>Gross earnings</td><td class="r">${esc(money(r.gross))}</td></tr></table>
${deductions.length ? `<table><tr><th>Deductions</th><th class="r">Amount</th></tr>${deductions.map(([l, v]) => line(l, `- ${money(v)}`)).join('')}
<tr class="tot"><td>Total deductions</td><td class="r">- ${esc(money(r.totalDeductions))}</td></tr></table>` : ''}
<div class="net"><span>NET PAY</span><b>${esc(money(r.netPay))}</b></div>
<div class="words">${esc(amountInWords(r.netPay))}</div>
${r.remarks ? `<p class="muted">Remarks: ${esc(r.remarks)}</p>` : ''}
<div class="foot">Computer-generated receipt${r.revision > 1 ? ` · Revision ${r.revision}` : ''} · Issued ${esc(fmtStamp(r.issuedAt))}${r.revision > 1 ? ` · Last updated ${esc(fmtStamp(r.updatedAt))}` : ''}</div>
</div></body></html>`;
};

// Print dialog mein "Save as PDF" choose karne se PDF download hoti hai
export const printReceipt = (receipt) => {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);

  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(buildReceiptHtml(receipt));
  doc.close();

  const previousTitle = document.title;
  document.title = receipt.receiptNo;

  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => {
      document.title = previousTitle;
      frame.remove();
    }, 1500);
  }, 250);
};