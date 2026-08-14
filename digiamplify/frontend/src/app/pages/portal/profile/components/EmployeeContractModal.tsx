'use client';

import React from 'react';
import { X, Printer, ShieldCheck, FileCheck, Building2, Calendar, User, Briefcase, DollarSign, Clock } from 'lucide-react';
import { formatDateStandard } from '@/utils/dateUtils';

interface EmployeeContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
}

export default function EmployeeContractModal({
  isOpen,
  onClose,
  profileData
}: EmployeeContractModalProps) {
  if (!isOpen || !profileData) return null;

  const todayStr = formatDateStandard(new Date());
  const joiningDate = profileData.dateOfJoining ? formatDateStandard(profileData.dateOfJoining) : todayStr;
  const fullName = profileData.fullName || profileData.userName || 'Employee Name';
  const jobTitle = profileData.jobTitle || 'Software Engineer';
  const department = profileData.department || 'Engineering';
  const manager = profileData.manager || 'HR Management';

  const shiftName = profileData.shift || 'Morning';
  const isNightShift = shiftName.toLowerCase() === 'night';
  const shiftTimeStr = isNightShift ? '06:00 PM - 02:00 AM' : '09:00 AM - 05:00 PM';

  const monthlySalary = profileData.salary || '$5,000';
  const contractedHours = profileData.contractedHours || '160';
  const overtimeRate = profileData.overtimeRate ? `$${profileData.overtimeRate}/hr` : '1.5x Hourly Rate';
  const shortfallRate = profileData.shortfallRate ? `$${profileData.shortfallRate}/hr` : '1.0x Hourly Rate';
  const taxRate = profileData.taxRate ? `${profileData.taxRate}%` : '10%';
  const taxId = profileData.taxId || 'NTN-98402';
  const bankName = profileData.bankName || 'Faysal Bank';
  const accountNumber = profileData.accountNumber ? `•••• ${profileData.accountNumber.slice(-4)}` : '•••• 7890';

  const contractRef = `CONTRACT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const handlePrint = () => {
    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Employment_Contract_${fullName.replace(/\s+/g, '_')}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              padding: 45px;
              font-size: 12.5px;
              line-height: 1.6;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #be0919;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .logo-brand {
              display: flex;
              align-items: center;
              gap: 12px;
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
              font-size: 22px;
              font-weight: 900;
              letter-spacing: 1px;
              text-transform: uppercase;
              color: #0f172a;
            }
            .brand-sub {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .contract-title-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-left: 4px solid #be0919;
              border-radius: 10px;
              padding: 16px 20px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .contract-title {
              font-size: 16px;
              font-weight: 900;
              text-transform: uppercase;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .ref-no {
              font-family: monospace;
              font-weight: 800;
              font-size: 12px;
              color: #be0919;
              background: #fef2f2;
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid #fee2e2;
            }
            .section-card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 18px;
              margin-bottom: 20px;
              background: #ffffff;
            }
            .section-heading {
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #be0919;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #f1f5f9;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 14px;
            }
            .grid-3 {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
            }
            .info-item .label {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-item .val {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 2px;
            }
            .terms-list {
              padding-left: 18px;
              color: #334155;
            }
            .terms-list li {
              margin-bottom: 8px;
            }
            .signature-box {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 40px;
              margin-top: 35px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
            }
            .sig-line {
              border-top: 1.5px solid #0f172a;
              margin-top: 45px;
              padding-top: 8px;
              font-weight: 800;
              font-size: 12px;
              color: #0f172a;
            }
            .footer-bar {
              margin-top: 30px;
              padding-top: 14px;
              border-top: 1px solid #f1f5f9;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-brand">
              <div class="logo-badge">D</div>
              <div>
                <div class="brand-title">Digiamplify</div>
                <div class="brand-sub">Official Corporate Employment Agreement</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Agreement Date</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${joiningDate}</div>
            </div>
          </div>

          <div class="contract-title-box">
            <div>
              <div class="contract-title">Formal Employment Contract</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Binding Employment & Payroll Terms Statement</div>
            </div>
            <div class="ref-no">${contractRef}</div>
          </div>

          <!-- Section 1: Employee & Position -->
          <div class="section-card">
            <div class="section-heading">1. Employee & Position Details</div>
            <div class="grid-3">
              <div class="info-item">
                <div class="label">Employee Name</div>
                <div class="val">${fullName}</div>
              </div>
              <div class="info-item">
                <div class="label">Designation / Title</div>
                <div class="val">${jobTitle}</div>
              </div>
              <div class="info-item">
                <div class="label">Department</div>
                <div class="val">${department}</div>
              </div>
              <div class="info-item">
                <div class="label">Work Email</div>
                <div class="val">${profileData.workEmail || profileData.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="label">Reporting Manager</div>
                <div class="val">${manager}</div>
              </div>
              <div class="info-item">
                <div class="label">Effective Date</div>
                <div class="val">${joiningDate}</div>
              </div>
            </div>
          </div>

          <!-- Section 2: Shift & Work Schedule -->
          <div class="section-card">
            <div class="section-heading">2. Working Hours & Shift Schedule</div>
            <div class="grid-3">
              <div class="info-item">
                <div class="label">Assigned Shift</div>
                <div class="val">${shiftName} (${shiftTimeStr})</div>
              </div>
              <div class="info-item">
                <div class="label">Contracted Monthly Target</div>
                <div class="val">${contractedHours} Hours / Month</div>
              </div>
              <div class="info-item">
                <div class="label">Working Days</div>
                <div class="val">Monday - Saturday (Sunday Off)</div>
              </div>
            </div>
          </div>

          <!-- Section 3: Compensation & Payroll Terms -->
          <div class="section-card">
            <div class="section-heading">3. Compensation, Overtime & Tax Terms</div>
            <div class="grid-3">
              <div class="info-item">
                <div class="label">Monthly Base Salary</div>
                <div class="val" style="color: #be0919;">${monthlySalary}</div>
              </div>
              <div class="info-item">
                <div class="label">Overtime (OT) Hourly Rate</div>
                <div class="val">${overtimeRate}</div>
              </div>
              <div class="info-item">
                <div class="label">Undertime Shortfall Rate</div>
                <div class="val">${shortfallRate}</div>
              </div>
              <div class="info-item">
                <div class="label">Statutory Income Tax Rate</div>
                <div class="val">${taxRate}</div>
              </div>
              <div class="info-item">
                <div class="label">Tax ID / NTN</div>
                <div class="val" style="font-family: monospace;">${taxId}</div>
              </div>
              <div class="info-item">
                <div class="label">Direct Deposit Bank Account</div>
                <div class="val">${bankName} (${accountNumber})</div>
              </div>
            </div>
          </div>

          <!-- Section 4: Terms & Governance -->
          <div class="section-card">
            <div class="section-heading">4. Contract Governance & Attendance Policies</div>
            <ul class="terms-list">
              <li><strong>Attendance & Clock-In:</strong> Employee agrees to record daily clock-in/clock-out timestamps via the Digiamplify Portal PIN keypad.</li>
              <li><strong>Overtime Approval Governance:</strong> Any overtime logged outside standard shift hours requires Admin review and approval before month-end payroll disbursement.</li>
              <li><strong>Shortfall Adjustments:</strong> Monthly worked hours below contracted target (${contractedHours}h) will be reviewed by Management for approval or deduction.</li>
              <li><strong>Confidentiality:</strong> Employee agrees to maintain strict confidentiality regarding all company assets, source code, client data, and proprietary workflows.</li>
            </ul>
          </div>

          <!-- Signatures -->
          <div class="signature-box">
            <div>
              <div class="sig-line">Employer Authorized Signatory</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Digiamplify Corporate HR Department</div>
            </div>
            <div>
              <div class="sig-line">Employee Acceptance Signature</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Accepted & Verified by ${fullName}</div>
            </div>
          </div>

          <div class="footer-bar">
            <span>Electronically Verified Contract Document — Digiamplify Systems</span>
            <span style="font-family: monospace;">${contractRef}</span>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative custom-scrollbar">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-900 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#be0919]/10 border border-[#be0919]/30 flex items-center justify-center text-[#be0919]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Employment Agreement & Contract</h2>
              <p className="text-xs text-neutral-400">Official employment terms, salary rates & schedule document</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Preview Card */}
        <div className="space-y-6 text-xs text-neutral-300">
          
          <div className="bg-[#050505] border border-neutral-900 rounded-2xl p-5 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Contract Reference</span>
              <span className="text-sm font-extrabold text-white font-mono block mt-1">{contractRef}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Effective Date</span>
              <span className="text-sm font-bold text-neutral-200 block mt-1">{joiningDate}</span>
            </div>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-[#be0919] uppercase tracking-wider mb-3">1. Employee & Position</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-neutral-500 block">Full Name</span>
                <span className="text-sm font-bold text-white block mt-0.5">{fullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Job Title</span>
                <span className="text-sm font-bold text-white block mt-0.5">{jobTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Department</span>
                <span className="text-sm font-bold text-white block mt-0.5">{department}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-[#be0919] uppercase tracking-wider mb-3">2. Work Schedule & Hours</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-neutral-500 block">Assigned Shift</span>
                <span className="text-sm font-bold text-white block mt-0.5">{shiftName} ({shiftTimeStr})</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Contracted Target</span>
                <span className="text-sm font-bold text-white block mt-0.5">{contractedHours} Hours / Month</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Working Days</span>
                <span className="text-sm font-bold text-white block mt-0.5">Mon - Sat (Sunday Off)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-[#be0919] uppercase tracking-wider mb-3">3. Compensation & Rates</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-neutral-500 block">Monthly Base Salary</span>
                <span className="text-sm font-extrabold text-[#be0919] block mt-0.5">{monthlySalary}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Overtime (OT) Rate</span>
                <span className="text-sm font-bold text-white block mt-0.5">{overtimeRate}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Shortfall Rate</span>
                <span className="text-sm font-bold text-white block mt-0.5">{shortfallRate}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Official Digiamplify Corporate Employment Contract</span>
            </div>
            <span className="font-mono text-neutral-400">Verified System Document</span>
          </div>

        </div>

      </div>
    </div>
  );
}
