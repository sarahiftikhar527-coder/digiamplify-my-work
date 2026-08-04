import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, ChevronDown } from 'lucide-react';

interface PersonalDetailsProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

interface CountryCode {
  code: string;
  flag: string;
  name: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' }
];

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function PhoneInputWithCountry({ value, onChange, placeholder }: PhoneInputWithCountryProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Parse initial value
  const { matchedCode, remainder } = React.useMemo(() => {
    if (!value || !value.startsWith('+')) {
      return { matchedCode: COUNTRY_CODES[0], remainder: value || '' };
    }
    // Find matching country code (sort longest first to avoid partial matches)
    const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    const match = sortedCodes.find(c => value.startsWith(c.code));
    if (match) {
      return { matchedCode: match, remainder: value.slice(match.code.length) };
    }
    return { matchedCode: COUNTRY_CODES[0], remainder: value };
  }, [value]);

  const [selectedCode, setSelectedCode] = useState<CountryCode>(matchedCode);
  const [localNumber, setLocalNumber] = useState(remainder);

  // Sync state if value changes from outside
  useEffect(() => {
    setSelectedCode(matchedCode);
    setLocalNumber(remainder);
  }, [matchedCode, remainder]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerChange = (codeStr: string, numberStr: string) => {
    const cleanedNumber = numberStr.replace(/\s+/g, '');
    if (cleanedNumber) {
      onChange(`${codeStr}${cleanedNumber}`);
    } else {
      onChange('');
    }
  };

  const handleSelectCountry = (c: CountryCode) => {
    setSelectedCode(c);
    setShowDropdown(false);
    triggerChange(c.code, localNumber);
  };

  const handleNumberChange = (num: string) => {
    const cleaned = num.replace(/[^\d]/g, '');
    setLocalNumber(cleaned);
    triggerChange(selectedCode.code, cleaned);
  };

  return (
    <div className="flex items-center bg-[#141414] border border-neutral-800 rounded-lg focus-within:border-red-500/50 transition-all overflow-visible relative font-sans w-full" ref={dropdownRef}>
      <style>{`
        .custom-phone-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-phone-scrollbar::-webkit-scrollbar-track {
          background: #050505;
          border-radius: 4px;
        }
        .custom-phone-scrollbar::-webkit-scrollbar-thumb {
          background: #be0919;
          border-radius: 4px;
        }
        .custom-phone-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #990714;
        }
      `}</style>

      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1.5 px-3 py-2.5 text-[14px] text-white border-r border-neutral-800 hover:bg-neutral-800/20 rounded-l-lg cursor-pointer shrink-0 select-none"
      >
        <span className="text-base leading-none">{selectedCode.flag}</span>
        <span className="text-[13px] text-neutral-300 font-light">{selectedCode.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
      </button>

      {showDropdown && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0c0c0c] border border-neutral-900 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto custom-phone-scrollbar">
          {COUNTRY_CODES.map((c) => (
            <button
              key={`${c.code}-${c.flag}-${c.name}`}
              type="button"
              onClick={() => handleSelectCountry(c)}
              className={`w-full text-left px-3.5 py-2 hover:bg-[#be0919]/10 cursor-pointer flex items-center gap-2 text-white/90 transition-colors ${
                selectedCode.code === c.code && selectedCode.flag === c.flag ? 'bg-[#be0919]/5' : ''
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="text-xs font-normal truncate max-w-[130px]">{c.name}</span>
              <span className="text-[11px] text-neutral-500 font-light ml-auto shrink-0">{c.code}</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={localNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none py-2.5 px-3.5 text-[14px] text-white placeholder-neutral-600 font-normal poppins"
      />
    </div>
  );
}

export default function PersonalTab({ data, onChange }: PersonalDetailsProps) {
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
                <PhoneInputWithCountry
                  value={data.phone || ''}
                  onChange={(val) => onChange('phone', val)}
                  placeholder="e.g. 123456789"
                />
              </div>
              <div>
                <label className="block text-[12px] text-white/60 mb-1.5 font-normal poppins">Emergency Number</label>
                <PhoneInputWithCountry
                  value={data.emergencyPhone || ''}
                  onChange={(val) => onChange('emergencyPhone', val)}
                  placeholder="e.g. 123456789"
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
