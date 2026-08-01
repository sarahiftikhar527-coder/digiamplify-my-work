'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

interface EmployeeVisaCardProps {
  bankInfo: BankInfo;
  showCardNumber: boolean;
  setShowCardNumber: (val: boolean) => void;
  formattedCardNumber: string;
}

export default function EmployeeVisaCard({
  bankInfo,
  showCardNumber,
  setShowCardNumber,
  formattedCardNumber
}: EmployeeVisaCardProps) {
  return (
    <div className="lg:col-span-2 bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between min-h-[320px] select-none animate-fadeIn">
      {}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold tracking-wide text-white">Total Balance</h3>
      </div>

      {}
      <div className="flex items-center gap-6 my-auto">
        {}
        <button className="flex flex-col items-center justify-center border border-dashed border-[#be0919]/60 rounded-full py-4 px-2.5 h-[160px] w-[45px] shrink-0 text-[#be0919] hover:text-white hover:border-white/30 transition-colors cursor-pointer select-none bg-transparent">
          <span className="text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 leading-none">
            Add New Card
          </span>
          <span className="text-lg font-bold mt-2.5 leading-none">+</span>
        </button>

        {}
        <div className="bg-[#0f0708] border border-red-950/30 rounded-2xl p-5 flex flex-col justify-between h-[160px] flex-1 relative shadow-inner">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-lg font-bold text-white tracking-wide block leading-none">VISA</span>
                <span className="text-xs text-neutral-500 mt-1 block">Linked to main account</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 mt-3.5">
              <span className="text-lg tracking-wider text-white font-mono font-bold">
                {showCardNumber ? formattedCardNumber : '**** ' + bankInfo.accountNumber.slice(-4)}
              </span>
              <button
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="text-neutral-400 hover:text-white cursor-pointer transition-colors"
              >
                {showCardNumber ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="flex-1 py-2 px-1 text-center bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              Transaction
            </button>
            <button className="flex-1 py-2 px-1 text-center bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="mt-4">
        <span className="text-xs sm:text-sm text-neutral-400 font-normal">Monthly Regular fee $677</span>
      </div>
    </div>
  );
}
