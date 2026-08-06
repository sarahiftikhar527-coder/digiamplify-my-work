'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { User } from './types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  isGroupChat: boolean;
  setIsGroupChat: (val: boolean) => void;
  groupName: string;
  setGroupName: (val: string) => void;
  selectedUserIds: string[];
  toggleUserSelection: (userId: string) => void;
  modalSearchQuery: string;
  setModalSearchQuery: (val: string) => void;
  handleCreateChat: () => void;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  users,
  isGroupChat,
  setIsGroupChat,
  groupName,
  setGroupName,
  selectedUserIds,
  toggleUserSelection,
  modalSearchQuery,
  setModalSearchQuery,
  handleCreateChat
}: CreateRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
          <span className="text-sm font-semibold text-white tracking-wide">Start a Conversation</span>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal type selection tabs */}
        <div className="flex border-b border-neutral-900 bg-[#050505]/40">
          <button
            onClick={() => { setIsGroupChat(false); }}
            className={`flex-1 py-3 text-xs font-semibold cursor-pointer relative transition-colors ${
              !isGroupChat ? 'text-white' : 'text-neutral-550 hover:text-neutral-300'
            }`}
          >
            <span>Direct Message</span>
            {!isGroupChat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#be0919]" />}
          </button>
          <button
            onClick={() => { setIsGroupChat(true); }}
            className={`flex-1 py-3 text-xs font-semibold cursor-pointer relative transition-colors ${
              isGroupChat ? 'text-white' : 'text-neutral-550 hover:text-neutral-300'
            }`}
          >
            <span>Group Chat</span>
            {isGroupChat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#be0919]" />}
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Group name input if Group toggle is on */}
          {isGroupChat && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Group Name</label>
              <input
                type="text"
                placeholder="Enter Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-[#050505] border border-neutral-900 focus:border-neutral-700 outline-none rounded-xl px-4 py-3 text-xs font-light text-white w-full transition-all"
              />
            </div>
          )}

          {/* Search contacts */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
              {isGroupChat ? 'Select Group Members' : 'Select Employee'}
            </label>
            <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-xl px-4 py-2.5 focus-within:border-neutral-700 transition-all">
              <Search className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search employee by name.."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
              />
            </div>
          </div>

          {/* Scrollable employee contacts checklist list */}
          <div className="max-h-[180px] overflow-y-auto custom-red-scrollbar space-y-1.5 pr-1">
            {users
              .filter(u => {
                const name = u.profile?.fullName?.toLowerCase() || '';
                const email = u.email.toLowerCase();
                return name.includes(modalSearchQuery.toLowerCase()) || email.includes(modalSearchQuery.toLowerCase());
              })
              .map(u => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleUserSelection(u.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                      isSelected 
                        ? 'bg-[#be0919]/10 border-[#be0919]/25 text-white' 
                        : 'bg-[#050505]/20 border-neutral-900/60 hover:bg-neutral-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-xs text-neutral-455 shrink-0">
                        {u.profile?.pictureUrl ? (
                          <img src={u.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{(u.profile?.fullName || 'U').charAt(0)}</span>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-semibold text-white text-xs truncate tracking-wide">
                          {u.profile?.fullName || 'No Name'}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-light mt-0.5 truncate max-w-[190px]">
                          {u.profile?.jobTitle || u.role}
                        </p>
                      </div>
                    </div>

                    {/* Selection check marker indicators */}
                    {isGroupChat ? (
                      <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-[#be0919] border-[#be0919] text-white' : 'border-neutral-700'
                      }`}>
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                    ) : (
                      isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#be0919] flex items-center justify-center text-white text-[9px] font-bold">
                          ✓
                        </div>
                      )
                    )}
                  </button>
                );
              })}

            {users.length === 0 && (
              <div className="text-center py-6 text-xs text-neutral-500 font-light select-none">
                No employees found.
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-5 border-t border-neutral-900 flex justify-end gap-3.5 bg-[#050505]/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)]"
          >
            {isGroupChat ? 'Create Group' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
}
