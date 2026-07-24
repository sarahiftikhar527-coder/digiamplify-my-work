import React from 'react';
import { User, Phone, MapPin, Calendar } from 'lucide-react';

interface PersonalDetailsProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function PersonalDetails({ data, onChange }: PersonalDetailsProps) {
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
      <div className="space-y-6">
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-6 border-b border-neutral-900 pb-3">
            <User className="w-4 h-4 text-[#be0919]" />
            <h3 className="text-[17px] font-semibold text-white">Personal Details</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Full Name</label>
                <input
                  type="text"
                  value={data.fullName || ''}
                  onChange={(e) => onChange('fullName', e.target.value)}
                  placeholder="e.g. Mary Jhon"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">User Name</label>
                <input
                  type="text"
                  value={data.userName || ''}
                  onChange={(e) => onChange('userName', e.target.value)}
                  placeholder="e.g. mary.j"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Date Of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    value={data.dateOfBirth ? formatToInputDate(data.dateOfBirth) : ''}
                    onChange={(e) => onChange('dateOfBirth', formatFromInputDate(e.target.value))}
                    className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 pl-10 pr-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 [color-scheme:dark] font-normal poppins"
                  />
                  <Calendar className="w-4 h-4 text-[#be0919] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Gender</label>
                <select
                  value={data.gender || ''}
                  onChange={(e) => onChange('gender', e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Nationality</label>
                <input
                  type="text"
                  value={data.nationality || ''}
                  onChange={(e) => onChange('nationality', e.target.value)}
                  placeholder="e.g. Pakistani"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Language</label>
                <input
                  type="text"
                  value={data.language || ''}
                  onChange={(e) => onChange('language', e.target.value)}
                  placeholder="e.g. Urdu, English"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-6 border-b border-neutral-900 pb-3">
            <Phone className="w-4 h-4 text-[#be0919]" />
            <h3 className="text-[17px] font-semibold text-white">Contact</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Email</label>
                <input
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => onChange('email', e.target.value)}
                  placeholder="e.g. mary@gmail.com"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Work Email</label>
                <input
                  type="email"
                  value={data.workEmail || ''}
                  onChange={(e) => onChange('workEmail', e.target.value)}
                  placeholder="e.g. mary@digiamplify.com"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Phone Number</label>
                <input
                  type="text"
                  value={data.phone || ''}
                  onChange={(e) => onChange('phone', e.target.value)}
                  placeholder="e.g. 123456789"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Emergency Number</label>
                <input
                  type="text"
                  value={data.emergencyPhone || ''}
                  onChange={(e) => onChange('emergencyPhone', e.target.value)}
                  placeholder="e.g. 123456789"
                  className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 h-fit">
        <div className="flex items-center gap-2.5 mb-6 border-b border-neutral-900 pb-3">
          <MapPin className="w-4 h-4 text-[#be0919]" />
          <h3 className="text-[17px] font-semibold text-white">Address and Education</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Current Address</label>
            <input
              type="text"
              value={data.currentAddress || ''}
              onChange={(e) => onChange('currentAddress', e.target.value)}
              placeholder="e.g. Street abc 1234"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Permanent Address</label>
            <input
              type="text"
              value={data.permanentAddress || ''}
              onChange={(e) => onChange('permanentAddress', e.target.value)}
              placeholder="e.g. Street abc 1234"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Country</label>
              <input
                type="text"
                value={data.country || ''}
                onChange={(e) => onChange('country', e.target.value)}
                placeholder="e.g. Pakistan"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">City</label>
              <input
                type="text"
                value={data.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="e.g. Faisalabad"
                className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Education</label>
            <input
              type="text"
              value={data.education || ''}
              onChange={(e) => onChange('education', e.target.value)}
              placeholder="e.g. Bachelors of Computer Sciences"
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 font-normal poppins"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
