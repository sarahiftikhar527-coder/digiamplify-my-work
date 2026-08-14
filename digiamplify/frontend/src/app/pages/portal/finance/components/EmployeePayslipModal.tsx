'use client';

import React from 'react';
import { X, Printer, CheckCircle2, Building2, Calendar, User, FileText, DollarSign, ShieldCheck } from 'lucide-react';
import { formatDateStandard } from '@/utils/dateUtils';

interface TransactionRecord {
  id: string;
  title: string;
  reference: string;
  amount: string;
  amountRaw: number;
  type: string;
  date: string;
  status: string;
  baseSalary?: string;
  bonusAmount?: string;
  deductionAmount?: string;
  taxAmount?: string;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  taxId?: string;
}

interface EmployeePayslipModalProps {
  transaction: TransactionRecord;
  bankInfo?: BankInfo;
  userEmail?: string;
  onClose: () => void;
}

export default function EmployeePayslipModal({
  transaction,
  bankInfo,
  userEmail,
  onClose
}: EmployeePayslipModalProps) {
  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=850,height=950');
    const dateFormatted = formatDateStandard(transaction.date);
    const bankName = bankInfo?.bankName || 'Faysal Bank';
    const accountNumber = bankInfo?.accountNumber ? `•••• ${bankInfo.accountNumber.slice(-4)}` : '•••• 7890';
    const taxId = bankInfo?.taxId || 'NTN-8839201';

    if (!printWin) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip_${transaction.reference || 'Voucher'}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              padding: 40px;
              font-size: 13px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #be0919;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .logo-brand {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .logo-badge {
              width: 44px;
              height: 44px;
              background: #be0919;
              color: #ffffff;
              font-size: 24px;
              font-weight: 900;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 1px;
              text-transform: uppercase;
              color: #0f172a;
            }
            .brand-sub {
              font-size: 12px;
              color: #64748b;
              font-weight: 500;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 20px;
            }
            .meta-item .label {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-item .val {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 4px;
            }
            .status-badge {
              display: inline-block;
              padding: 3px 10px;
              font-size: 11px;
              font-weight: 800;
              border-radius: 6px;
              text-transform: uppercase;
              background: #dcfce7;
              color: #15803d;
              border: 1px solid #bbf7d0;
            }
            .bank-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              padding: 14px;
              margin-bottom: 24px;
            }
            .table-box {
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              overflow: hidden;
              margin-bottom: 24px;
            }
            .table-head {
              background: #0f172a;
              color: #ffffff;
              padding: 12px 18px;
              font-size: 12px;
              font-weight: 800;
              display: flex;
              justify-content: space-between;
            }
            .section-block {
              padding: 16px 18px;
              border-bottom: 1px solid #e2e8f0;
            }
            .section-title {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .earnings-title { color: #166534; }
            .deductions-title { color: #991b1b; }
            .line-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              font-size: 12px;
              color: #334155;
            }
            .line-total {
              display: flex;
              justify-content: space-between;
              padding-top: 8px;
              margin-top: 6px;
              border-top: 1px dashed #cbd5e1;
              font-weight: 800;
              font-size: 13px;
              color: #0f172a;
            }
            .net-pay-banner {
              background: #f8fafc;
              border: 2px solid #be0919;
              border-radius: 14px;
              padding: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
            }
            .net-pay-title {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
            }
            .net-pay-amount {
              font-size: 30px;
              font-weight: 900;
              color: #be0919;
              font-family: monospace;
            }
            .footer-bar {
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-brand">
              <div class="logo-badge">D</div>
              <div>
                <div class="brand-title">Digiamplify</div>
                <div class="brand-sub">Official Payroll & Disbursement Statement</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Statement Date</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${dateFormatted}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="label">Statement Date</div>
              <div class="val">${dateFormatted}</div>
            </div>
            <div class="meta-item">
              <div class="label">Payment Reference</div>
              <div class="val" style="font-family: monospace;">${transaction.reference || '#SAL-983021'}</div>
            </div>
            <div class="meta-item" style="text-align: right;">
              <div class="label">Status</div>
              <div style="margin-top: 4px;"><span class="status-badge">${transaction.status}</span></div>
            </div>
          </div>

          <div class="bank-grid">
            <div class="meta-item">
              <div class="label">BENEFICIARY BANK</div>
              <div class="val">${bankName}</div>
            </div>
            <div class="meta-item">
              <div class="label">ACCOUNT IBAN / NO.</div>
              <div class="val" style="font-family: monospace;">${accountNumber}</div>
            </div>
            <div class="meta-item">
              <div class="label">TAX REGISTRATION / NTN</div>
              <div class="val" style="font-family: monospace;">${taxId}</div>
            </div>
          </div>

          <div class="table-box">
            <div class="table-head">
              <span>Itemized Payroll Breakdown</span>
              <span>${transaction.type} VOUCHER</span>
            </div>

            <div class="section-block" style="background: #f0fdf4;">
              <div class="section-title earnings-title">EARNINGS & ALLOWANCES</div>
              <div class="line-item">
                <span>Basic Monthly Salary</span>
                <span>$${baseSalaryNum.toLocaleString()}</span>
              </div>
              ${bonusNum > 0 ? `
                <div class="line-item">
                  <span>Performance Bonus / Incentives</span>
                  <span style="color: #166534; font-weight: 700;">+$${bonusNum.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="line-total">
                <span>Total Gross Earnings</span>
                <span style="color: #166534;">$${grossEarnings.toLocaleString()}</span>
              </div>
            </div>

            <div class="section-block" style="background: #fef2f2;">
              <div class="section-title deductions-title">TAX & ABSENCE DEDUCTIONS</div>
              <div class="line-item">
                <span>Income Tax Deduction (Est. ${taxRateNum}%)</span>
                <span style="color: #991b1b; font-weight: 700;">-$${taxNum.toLocaleString()}</span>
              </div>
              ${deductionNum > 0 ? `
                <div class="line-item">
                  <span>Absence / Unexcused Leave Deduction</span>
                  <span style="color: #991b1b; font-weight: 700;">-$${deductionNum.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="line-total">
                <span>Total Deductions</span>
                <span style="color: #991b1b;">-$${totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="net-pay-banner">
            <div>
              <div class="net-pay-title">NET DISBURSED PAY</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Directly deposited to beneficiary bank account</div>
            </div>
            <div class="net-pay-amount">$${netPay.toLocaleString()}</div>
          </div>

          <div class="footer-bar">
            <span>Generated electronically by Digiamplify HR Payroll System</span>
            <span style="font-family: monospace; font-weight: 700;">Official Verified Voucher</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const isSuccessful = transaction.status.toUpperCase() === 'SUCCESSFUL';
  const isPending = transaction.status.toUpperCase() === 'PENDING';

  // Calculate itemized payroll figures
  const rawNum = Math.abs(transaction.amountRaw || parseFloat((transaction.amount || '0').replace(/[^0-9.]/g, '')) || 0);
  
  const baseSalaryNum = rawNum;
  const bonusNum = transaction.bonusAmount ? parseFloat(transaction.bonusAmount.replace(/[^0-9.]/g, '')) : 0;
  const deductionNum = transaction.deductionAmount ? parseFloat(transaction.deductionAmount.replace(/[^0-9.]/g, '')) : 0;
  const taxRateNum = 10; // 10% standard tax
  const taxNum = transaction.taxAmount ? parseFloat(transaction.taxAmount.replace(/[^0-9.]/g, '')) : Math.round(rawNum * 0.10);

  const grossEarnings = rawNum + bonusNum;
  const totalDeductions = taxNum + deductionNum;
  const netPay = grossEarnings - totalDeductions > 0 ? grossEarnings - totalDeductions : rawNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white print:static">
      <style>{`
        @media print {
          @page {
            margin: 10mm;
            size: A4 portrait;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-payslip, #printable-payslip * {
            visibility: visible !important;
          }
          #printable-payslip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          #printable-payslip * {
            color: #000000 !important;
            border-color: #cbd5e1 !important;
          }
          #printable-payslip .print-bg-box {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }
          #printable-payslip .print-text-dark {
            color: #000000 !important;
          }
        }
      `}</style>

      <div
        id="printable-payslip"
        className="bg-[#0c0c0c] border border-neutral-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl relative select-none custom-scrollbar"
      >
        {/* Header Bar with Action Buttons */}
        <div className="pb-5 border-b border-neutral-900 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#be0919] flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
              D
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase print-text-dark">Digiamplify</h2>
              <p className="text-xs text-neutral-400 font-medium print-text-dark">Official Payroll & Disbursement Statement</p>
            </div>
          </div>

          <div className="no-print flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#be0919] hover:bg-[#990714] text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-md"
              title="Print Official Payslip"
            >
              <Printer className="w-4 h-4" />
              <span>Print Payslip / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statement Metadata Bar */}
        <div className="bg-[#050505] print-bg-box border border-neutral-900 rounded-2xl p-4 sm:p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block print-text-dark">Statement Date</span>
            <span className="text-xs font-bold text-neutral-200 block mt-1 print-text-dark">{formatDateStandard(transaction.date)}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block print-text-dark">Payment Reference</span>
            <span className="text-xs sm:text-sm font-extrabold text-white block mt-1 font-mono print-text-dark truncate">{transaction.reference || '#SAL-983021'}</span>
          </div>
          <div className="text-left sm:text-right col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block print-text-dark">Status</span>
            <span
              className={`inline-block px-3 py-0.5 text-xs font-bold rounded-lg border uppercase tracking-wider mt-1 ${
                isSuccessful
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isPending
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Banking & Tax Details Bar */}
        {bankInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-[#141414] print-bg-box rounded-xl border border-neutral-800 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 font-medium block print-text-dark">BENEFICIARY BANK</span>
              <span className="text-xs font-bold text-white block mt-0.5 print-text-dark">{bankInfo.bankName || 'Faysal Bank'}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-medium block print-text-dark">ACCOUNT IBAN / NO.</span>
              <span className="text-xs font-bold text-white font-mono block mt-0.5 print-text-dark">
                {bankInfo.accountNumber ? `•••• ${bankInfo.accountNumber.slice(-4)}` : '•••• 7890'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-medium block print-text-dark">TAX REGISTRATION / NTN</span>
              <span className="text-xs font-bold text-white font-mono block mt-0.5 print-text-dark">{bankInfo.taxId || 'NTN-8839201'}</span>
            </div>
          </div>
        )}

        {/* Itemized Payroll Breakdown Table */}
        <div className="mb-6 border border-neutral-900 rounded-2xl overflow-hidden print-bg-box">
          <div className="bg-[#0f0f0f] px-5 py-3 border-b border-neutral-900 flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider print-text-dark">Itemized Payroll Breakdown</span>
            <span className="text-xs font-mono text-neutral-500 uppercase print-text-dark">{transaction.type} VOUCHER</span>
          </div>

          <div className="divide-y divide-neutral-900 text-xs">
            {/* Earnings */}
            <div className="p-4 bg-emerald-500/5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-2 print-text-dark">EARNINGS & ALLOWANCES</span>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400 print-text-dark">Basic Monthly Salary</span>
                <span className="text-white font-semibold print-text-dark">${baseSalaryNum.toLocaleString()}</span>
              </div>
              {bonusNum > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400 print-text-dark">Approved Overtime (OT Bonus) / Incentives</span>
                  <span className="text-emerald-400 font-semibold print-text-dark">+${bonusNum.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 pt-2 border-t border-neutral-900/50 font-bold">
                <span className="text-neutral-300 print-text-dark">Total Gross Earnings</span>
                <span className="text-emerald-400 print-text-dark">${grossEarnings.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="p-4 bg-red-500/5">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-2 print-text-dark">TAX & ABSENCE DEDUCTIONS</span>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400 print-text-dark">Income Tax Deduction</span>
                <span className="text-red-400 font-semibold print-text-dark">-${taxNum.toLocaleString()}</span>
              </div>
              {deductionNum > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400 print-text-dark">Approved Undertime / Absence Deduction</span>
                  <span className="text-red-400 font-semibold print-text-dark">-${deductionNum.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 pt-2 border-t border-neutral-900/50 font-bold">
                <span className="text-neutral-300 print-text-dark">Total Deductions</span>
                <span className="text-red-400 print-text-dark">-${totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Disbursed Salary Banner */}
        <div className="bg-[#141414] print-bg-box border border-neutral-800 rounded-2xl p-5 flex items-center justify-between mb-6 shadow-inner">
          <div>
            <span className="text-xs font-extrabold text-white uppercase tracking-wider block print-text-dark">NET DISBURSED PAY</span>
            <span className="text-[11px] text-neutral-400 block mt-0.5 print-text-dark">Directly deposited to beneficiary bank account</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#be0919] print-text-dark font-mono">
            ${netPay.toLocaleString()}
          </span>
        </div>

        {/* Footer Authentication */}
        <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="print-text-dark">Generated electronically by Digiamplify HR Payroll System</span>
          </div>
          <span className="font-mono print-text-dark">Official Verified Voucher</span>
        </div>
      </div>
    </div>
  );
}
