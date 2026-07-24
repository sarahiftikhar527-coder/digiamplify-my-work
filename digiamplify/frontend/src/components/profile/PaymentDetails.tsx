import { CreditCard, DollarSign, Calendar } from 'lucide-react';

interface PaymentDetailsProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function PaymentDetails({ data, onChange }: PaymentDetailsProps) {
  const formatToInputDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const formatFromInputDate = (inputVal: string) => {
    if (!inputVal) return '';
    const [year, month, day] = inputVal.split('-');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[parseInt(month, 10) - 1];
    return `${parseInt(day, 10)} ${monthName}, ${year}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-3">
          <CreditCard className="w-5 h-5 text-[#be0919]" />
          <h3 className="text-[17px] font-semibold text-white">Bank Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Bank Name</label>
            <input
              type="text"
              value={data.bankName || ''}
              onChange={(e) => onChange('bankName', e.target.value)}
              placeholder="e.g. Faysal Bank"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Account Holder Name</label>
            <input
              type="text"
              value={data.accountHolderName || ''}
              onChange={(e) => onChange('accountHolderName', e.target.value)}
              placeholder="e.g. Mary Jhon"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Account Number</label>
            <input
              type="text"
              value={data.accountNumber || ''}
              onChange={(e) => onChange('accountNumber', e.target.value)}
              placeholder="e.g. 123456789"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Currency</label>
            <input
              type="text"
              value={data.currency || ''}
              onChange={(e) => onChange('currency', e.target.value)}
              placeholder="e.g. Rupees"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Bonus</label>
            <input
              type="text"
              value={data.bonus || ''}
              onChange={(e) => onChange('bonus', e.target.value)}
              placeholder="e.g. Based on Project"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 h-fit">
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-3">
          <DollarSign className="w-5 h-5 text-[#be0919]" />
          <h3 className="text-[17px] font-semibold text-white">Salary Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Annual Salary</label>
            <input
              type="text"
              value={data.annualSalary || ''}
              onChange={(e) => onChange('annualSalary', e.target.value)}
              placeholder="e.g. $1,23,445"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Salary Type</label>
            <select
              value={data.salaryType || ''}
              onChange={(e) => onChange('salaryType', e.target.value)}
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            >
              <option value="">Select Salary Type</option>
              <option value="Monthly">Monthly</option>
              <option value="Hourly">Hourly</option>
              <option value="Project Based">Project Based</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Salary</label>
            <input
              type="text"
              value={data.salary || ''}
              onChange={(e) => onChange('salary', e.target.value)}
              placeholder="e.g. $1,234"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Deduction per Absence</label>
            <input
              type="text"
              value={data.deductionPerAbsence || ''}
              onChange={(e) => onChange('deductionPerAbsence', e.target.value)}
              placeholder="e.g. $123"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Salary Payment Date</label>
            <div className="relative">
              <input
                type="date"
                value={data.paymentDate ? formatToInputDate(data.paymentDate) : ''}
                onChange={(e) => onChange('paymentDate', formatFromInputDate(e.target.value))}
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 pl-10 pr-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 [color-scheme:dark] font-normal poppins"
              />
              <Calendar className="w-4 h-4 text-[#be0919] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
