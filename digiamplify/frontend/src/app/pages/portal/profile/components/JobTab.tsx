import React from 'react';
import { Briefcase, Building2, Calendar } from 'lucide-react';

interface JobDetailsProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function JobTab({ data, onChange }: JobDetailsProps) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activeDays = data.workingDays ? data.workingDays.split(',') : [];

  const handleDayToggle = (day: string) => {
    let newDays;
    if (activeDays.includes(day)) {
      newDays = activeDays.filter((d: string) => d !== day);
    } else {
      newDays = [...activeDays, day];
    }
    onChange('workingDays', newDays.join(','));
  };

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
          <Briefcase className="w-5 h-5 text-[#be0919]" />
          <h3 className="text-[17px] font-semibold text-white">Job Details</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Job Title</label>
              <input
                type="text"
                value={data.jobTitle || ''}
                onChange={(e) => onChange('jobTitle', e.target.value)}
                placeholder="e.g. UI/UX Designer"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Department</label>
              <input
                type="text"
                value={data.department || ''}
                onChange={(e) => onChange('department', e.target.value)}
                placeholder="e.g. IT"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Team</label>
              <input
                type="text"
                value={data.team || ''}
                onChange={(e) => onChange('team', e.target.value)}
                placeholder="e.g. Design"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Manager</label>
              <input
                type="text"
                value={data.manager || ''}
                onChange={(e) => onChange('manager', e.target.value)}
                placeholder="e.g. Jame Jhon"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Job Level</label>
              <input
                type="text"
                value={data.jobLevel || ''}
                onChange={(e) => onChange('jobLevel', e.target.value)}
                placeholder="e.g. Senior"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Probation Period</label>
              <input
                type="text"
                value={data.probationPeriod || ''}
                onChange={(e) => onChange('probationPeriod', e.target.value)}
                placeholder="e.g. 3 Month"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Date Of Joining</label>
              <div className="relative">
                <input
                  type="date"
                  value={data.dateOfJoining ? formatToInputDate(data.dateOfJoining) : ''}
                  onChange={(e) => onChange('dateOfJoining', formatFromInputDate(e.target.value))}
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 pl-10 pr-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 [color-scheme:dark] font-normal poppins"
                />
                <Calendar className="w-4 h-4 text-[#be0919] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Confirmation Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={data.confirmationDate ? formatToInputDate(data.confirmationDate) : ''}
                  onChange={(e) => onChange('confirmationDate', formatFromInputDate(e.target.value))}
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 pl-10 pr-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 [color-scheme:dark] font-normal poppins"
                />
                <Calendar className="w-4 h-4 text-[#be0919] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Annual Leave</label>
              <input
                type="number"
                value={data.annualLeave || ''}
                onChange={(e) => onChange('annualLeave', e.target.value)}
                placeholder="e.g. 10"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Job Type</label>
              <select
                value={data.jobType || ''}
                onChange={(e) => onChange('jobType', e.target.value)}
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              >
                <option value="">Select Job Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 h-fit">
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-3">
          <Building2 className="w-5 h-5 text-[#be0919]" />
          <h3 className="text-[17px] font-semibold text-white">Work Status</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Work Type</label>
            <select
              value={data.workType || ''}
              onChange={(e) => onChange('workType', e.target.value)}
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            >
              <option value="">Select Work Type</option>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Shift</label>
            <select
              value={data.shift || ''}
              onChange={(e) => onChange('shift', e.target.value)}
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            >
              <option value="">Select Shift</option>
              <option value="Day Shift">Day Shift</option>
              <option value="Night Shift">Night Shift</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-2.5 font-normal poppins">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = activeDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#be0919] border-[#be0919] text-white shadow-[0_2px_8px_rgba(190,9,25,0.2)]'
                        : 'bg-[#141414] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Weekly Off</label>
            <input
              type="text"
              value={data.weeklyOff || ''}
              onChange={(e) => onChange('weeklyOff', e.target.value)}
              placeholder="e.g. Sunday"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Notice Period</label>
            <input
              type="text"
              value={data.noticePeriod || ''}
              onChange={(e) => onChange('noticePeriod', e.target.value)}
              placeholder="e.g. 60 Days"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
