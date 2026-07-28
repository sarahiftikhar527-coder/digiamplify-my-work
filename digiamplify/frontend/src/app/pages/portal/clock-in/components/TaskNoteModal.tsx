import React from 'react';
import { FileText, X } from 'lucide-react';

interface TaskNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: any;
}

export default function TaskNoteModal({ isOpen, onClose, selectedRecord }: TaskNoteModalProps) {
  if (!isOpen || !selectedRecord) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scaleIn">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-[#050505]">
          <div className="flex items-center gap-2 select-none">
            <FileText className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white">Employee Task Summary</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-neutral-950 text-xs font-light text-neutral-400 select-none">
            <div>
              <span className="text-neutral-500 block uppercase font-bold text-[9px] mb-0.5">Submitted By</span>
              <span className="text-white font-semibold text-sm">{selectedRecord.fullName}</span>
              <span className="block text-[10px] mt-0.5">{selectedRecord.email}</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block uppercase font-bold text-[9px] mb-0.5">Shift Type</span>
              <span className="px-2 py-0.5 bg-neutral-900 rounded font-semibold text-neutral-300">{selectedRecord.shift}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-500 block uppercase font-bold text-[9px] mb-2 select-none">Daily Tasks Note</span>
            <div className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-xs text-neutral-200 leading-relaxed font-light whitespace-pre-wrap min-h-[140px] max-h-[220px] overflow-y-auto animate-fadeIn">
              {selectedRecord.description}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-3 border-t border-neutral-950">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              Close Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
