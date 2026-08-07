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
  onOpenAddCardModal?: () => void;
  onOpenWithdrawModal?: () => void;
  onOpenRequestModal?: () => void;
}

export default function EmployeeVisaCard({
  bankInfo,
  showCardNumber,
  setShowCardNumber,
  formattedCardNumber,
  onOpenAddCardModal,
  onOpenWithdrawModal,
  onOpenRequestModal
}: EmployeeVisaCardProps) {
  return (
    <div className="lg:col-span-2 bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-between min-h-[320px] select-none animate-fadeIn">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold tracking-wide text-white">Total Balance</h3>
      </div>

      {/* Card Section */}
      <div className="flex items-center gap-6 my-auto">
        {/* Add Card Button */}
        <button
          onClick={onOpenAddCardModal}
          title="Add or update card details"
          className="flex flex-col items-center justify-center border border-dashed border-[#be0919]/60 hover:border-[#be0919] rounded-full py-4 px-2.5 h-[160px] w-[45px] shrink-0 text-[#be0919] hover:text-white hover:bg-[#be0919]/10 transition-all cursor-pointer select-none bg-transparent"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 leading-none">
            Add New Card
          </span>
          <span className="text-lg font-bold mt-2.5 leading-none">+</span>
        </button>

        {/* Card Component */}
        <div className="bg-[#0f0708] border border-red-950/30 rounded-2xl p-5 flex flex-col justify-between h-[160px] flex-1 relative shadow-inner">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-lg font-bold text-white tracking-wide block leading-none">
                  {bankInfo.bankName.toUpperCase().includes('VISA') ? bankInfo.bankName : `VISA - ${bankInfo.bankName}`}
                </span>
                <span className="text-xs text-neutral-500 mt-1 block">Linked to main account</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-2 mt-3.5">
              <span className="text-xs sm:text-sm tracking-wider text-white font-mono font-bold whitespace-nowrap truncate">
                {showCardNumber ? formattedCardNumber : '•••• •••• •••• ' + bankInfo.accountNumber.slice(-4)}
              </span>
              <button
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="text-neutral-400 hover:text-white cursor-pointer transition-colors shrink-0 p-1"
                title={showCardNumber ? "Hide full card number" : "Show full card number"}
              >
                {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

            </div>


          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onOpenRequestModal}
              className="w-full py-2 px-3 text-center bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Transaction Request
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-4">
        <span className="text-xs sm:text-sm text-neutral-400 font-normal">Monthly Regular fee $677</span>
      </div>
    </div>
  );
}

