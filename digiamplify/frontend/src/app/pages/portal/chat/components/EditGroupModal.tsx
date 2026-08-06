'use client';

import React from 'react';
import { Camera, Users, X } from 'lucide-react';
import { ChatRoom } from './types';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: ChatRoom | null;
  currentUser: { id: string; email: string; role: string; fullName?: string } | null;
  editGroupName: string;
  setEditGroupName: (val: string) => void;
  editGroupDescription: string;
  setEditGroupDescription: (val: string) => void;
  editGroupPicture: string | null;
  handleGroupPictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpdateGroupDetails: () => void;
  isCurrentUserGroupAdmin: (room: ChatRoom | null) => boolean;
}

export default function EditGroupModal({
  isOpen,
  onClose,
  activeRoom,
  currentUser,
  editGroupName,
  setEditGroupName,
  editGroupDescription,
  setEditGroupDescription,
  editGroupPicture,
  handleGroupPictureChange,
  handleUpdateGroupDetails,
  isCurrentUserGroupAdmin
}: EditGroupModalProps) {
  if (!isOpen || !activeRoom) return null;

  const isAdmin = isCurrentUserGroupAdmin(activeRoom);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold text-white tracking-wide">
            {isAdmin ? 'Edit Group Details' : 'Group Information'}
          </span>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-550 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto custom-red-scrollbar space-y-6 flex-1">
          
          {/* Profile Avatar upload slot */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group/avatar w-24 h-24 rounded-full bg-red-500/5 border border-red-500/10 flex items-center justify-center overflow-hidden text-[#be0919]">
              {editGroupPicture ? (
                <img src={editGroupPicture} alt="Group Avatar" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-10 h-10" />
              )}
              
              {/* Upload overlay only for Group Admins */}
              {isAdmin && (
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Change</span>
                  <input 
                    type="file" 
                    onChange={handleGroupPictureChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            {isAdmin && (
              <span className="text-[10px] text-neutral-500 font-light">Click circle to upload a custom group avatar</span>
            )}
          </div>

          {/* Group Name input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Group Name</label>
            {isAdmin ? (
              <input
                type="text"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                placeholder="Enter group name"
                className="bg-[#050505] border border-neutral-900 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-neutral-700 transition-all font-light"
              />
            ) : (
              <p className="bg-[#050505]/40 border border-neutral-950 px-4 py-3 rounded-xl text-white text-xs font-medium">
                {activeRoom.name || 'Group Chat'}
              </p>
            )}
          </div>

          {/* Group Description input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Description</label>
            {isAdmin ? (
              <textarea
                value={editGroupDescription}
                onChange={(e) => setEditGroupDescription(e.target.value)}
                placeholder="Provide a description for this group conversation..."
                rows={3}
                className="bg-[#050505] border border-neutral-900 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-neutral-700 transition-all font-light resize-none custom-red-scrollbar"
              />
            ) : (
              <p className="bg-[#050505]/40 border border-neutral-950 px-4 py-3 rounded-xl text-neutral-400 text-xs font-light leading-relaxed min-h-[60px]">
                {activeRoom.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Member list section */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
              Group Members ({activeRoom.participants.filter(p => p.role !== 'LEFT').length})
            </label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-red-scrollbar pr-1">
              {activeRoom.participants.filter(p => p.role !== 'LEFT').map(part => {
                const profile = part.user?.profile;
                const name = profile?.fullName || (part.user?.role?.toLowerCase() === 'admin' ? 'Admin' : part.user?.email || 'Employee');
                const role = profile?.jobTitle || (part.user?.role?.toLowerCase() === 'admin' ? 'Administrator' : part.user?.role || 'Employee');
                const pic = profile?.pictureUrl;
                const isPartGroupAdmin = part.role === 'ADMIN' || part.user?.role?.toLowerCase() === 'admin';

                return (
                  <div key={part.id} className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-900 bg-[#050505]/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-semibold text-[10px] text-neutral-455 shrink-0 select-none">
                        {pic ? (
                          <img src={pic} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-normal text-white text-[11px] truncate tracking-wide">
                          {name}
                        </p>
                        <p className="text-[9px] text-neutral-500 font-light mt-0.5 truncate">
                          {role}
                        </p>
                      </div>
                    </div>

                    {/* Admin/Member badge */}
                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider select-none shrink-0 ${
                      isPartGroupAdmin 
                        ? 'bg-[#be0919]/10 text-[#be0919] border border-[#be0919]/20' 
                        : 'bg-neutral-900 text-neutral-500 border border-neutral-850'
                    }`}>
                      {isPartGroupAdmin ? 'Group Admin' : 'Member'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Actions Footer */}
        <div className="p-5 border-t border-neutral-900 flex justify-end gap-3.5 bg-[#050505]/20 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            {isAdmin ? 'Cancel' : 'Close'}
          </button>
          {isAdmin && (
            <button
              onClick={handleUpdateGroupDetails}
              className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)]"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
