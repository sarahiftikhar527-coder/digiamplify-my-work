'use client';

import React from 'react';
import { Users, X } from 'lucide-react';
import { ChatRoom } from './types';
import { getRoomDisplayDetails } from './utils';

interface ForwardMessageModalProps {
  isOpen: boolean;
  forwardContent: string | null;
  rooms: ChatRoom[];
  currentUser: { id: string; email: string; role: string; fullName?: string } | null;
  onClose: () => void;
  onConfirmForward: (roomId: string) => void;
}

export default function ForwardMessageModal({
  isOpen,
  forwardContent,
  rooms,
  currentUser,
  onClose,
  onConfirmForward
}: ForwardMessageModalProps) {
  if (!isOpen || !forwardContent) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-[#0c0c0c] border border-neutral-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-wide">Forward Message</h3>
          <button 
            onClick={onClose}
            className="text-neutral-550 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-[#050505]/40 border-b border-neutral-900 text-neutral-400 text-xs italic line-clamp-2 select-none pr-6 pl-6">
          "{forwardContent}"
        </div>

        <div className="p-4 max-h-60 overflow-y-auto custom-red-scrollbar space-y-2">
          <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mb-2 select-none">
            Select Conversation
          </label>
          {rooms.length === 0 ? (
            <p className="text-center text-xs text-neutral-500 font-light select-none py-6">No other conversations available.</p>
          ) : (
            rooms.map(room => {
              const details = getRoomDisplayDetails(room, currentUser);
              return (
                <button
                  key={room.id}
                  onClick={() => onConfirmForward(room.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-900/40 text-left transition-colors border border-transparent hover:border-neutral-900 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden text-neutral-450 font-semibold text-xs shrink-0 select-none">
                    {room.isGroup ? (
                      room.groupPicture ? (
                        <img src={room.groupPicture} alt="Group Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )
                    ) : (
                      details.avatarUrl ? (
                        <img src={details.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{details.name.charAt(0)}</span>
                      )
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-white truncate tracking-wide">{details.name}</p>
                    <p className="text-[9px] text-neutral-550 truncate font-light">{room.isGroup ? 'Group' : 'Direct'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-neutral-900 flex justify-end bg-[#050505]/20">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
