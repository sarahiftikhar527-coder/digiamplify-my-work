import React from 'react';
import { Key, X } from 'lucide-react';

interface ResetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  setPassword: (val: string) => void;
  newPin: string;
  setNewPin: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  success: string;
  isLoading: boolean;
}

export default function ResetPinModal({
  isOpen,
  onClose,
  password,
  setPassword,
  newPin,
  setNewPin,
  onSubmit,
  error,
  success,
  isLoading
}: ResetPinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scaleIn">
        
        {}
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-[#050505]">
          <div className="flex items-center gap-2 select-none">
            <Key className="w-5 h-5 text-[#be0919]" />
            <h3 className="text-base font-bold text-white">Reset Keypad PIN</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {}
        <form onSubmit={onSubmit} className="p-6 space-y-5 text-sm">
          <p className="text-xs text-neutral-400 font-light mb-2 leading-relaxed">
            For security, verify your identity with your account login password to set a new 4-digit clock-in PIN.
          </p>

          {error && (
            <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-2 px-3 rounded-lg font-light text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2 px-3 rounded-lg font-light text-center">
              {success}
            </div>
          )}

          {}
          <div className="flex flex-col">
            <label className="text-[12px] text-white/80 mb-2 font-normal poppins select-none">
              Account Password <span className="text-[#be0919] font-bold">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-[12px] py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50"
              required
            />
          </div>

          {}
          <div className="flex flex-col">
            <label className="text-[12px] text-white/80 mb-2 font-normal poppins select-none">
              New 4-Digit PIN <span className="text-[#be0919] font-bold">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter 4-digit number"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-[12px] py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 tracking-[0.3em] font-bold text-center"
              required
            />
          </div>

          {}
          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#be0919] hover:bg-[#990714] text-white rounded-lg text-xs font-bold transition-colors shadow-md cursor-pointer"
            >
              {isLoading ? 'Saving PIN...' : 'Reset PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
