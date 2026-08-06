'use client';

import React from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { ChatRoom, GroupRequest } from './types';
import { getRoomDisplayDetails, formatRelativeTime } from './utils';

interface ChatSidebarProps {
  currentUser: { id: string; email: string; role: string; fullName?: string } | null;
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  groupRequests: GroupRequest[];
  activeRequest: GroupRequest | null;
  activeTab: 'All' | 'Groups' | 'Direct' | 'Requests';
  setActiveTab: (tab: 'All' | 'Groups' | 'Direct' | 'Requests') => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isMobileListOpen: boolean;
  setIsMobileListOpen: (val: boolean) => void;
  setActiveRoom: (room: ChatRoom | null) => void;
  setActiveRequest: (req: GroupRequest | null) => void;
  handleRoomClick: (room: ChatRoom) => void;
  openNewMessageModal: () => void;
}

export default function ChatSidebar({
  currentUser,
  rooms,
  activeRoom,
  groupRequests,
  activeRequest,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isMobileListOpen,
  setIsMobileListOpen,
  setActiveRoom,
  setActiveRequest,
  handleRoomClick,
  openNewMessageModal
}: ChatSidebarProps) {

  const filteredRooms = rooms.filter(room => {
    // Tab filter
    if (activeTab === 'Groups' && !room.isGroup) return false;
    if (activeTab === 'Direct' && room.isGroup) return false;

    // Search filter
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    if (room.isGroup) {
      return room.name?.toLowerCase().includes(query);
    } else {
      // Find other participant name
      const otherPart = room.participants.find(p => p.userId !== currentUser?.id);
      const name = otherPart?.user?.profile?.fullName?.toLowerCase() || '';
      const email = otherPart?.user?.email?.toLowerCase() || '';
      return name.includes(query) || email.includes(query);
    }
  });

  return (
    <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-neutral-900 flex flex-col shrink-0 bg-[#0c0c0c] ${
      isMobileListOpen ? 'flex' : 'hidden md:flex'
    }`}>
      
      {/* New Message trigger */}
      <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
        <span className="text-sm font-semibold text-white tracking-wide">New Message</span>
        <button 
          onClick={openNewMessageModal}
          className="w-8 h-8 rounded-full bg-[#be0919] hover:bg-[#990714] flex items-center justify-center text-white cursor-pointer shadow-[0_2px_8px_rgba(190,9,25,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search conversations */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-xl px-4.5 py-2.5 focus-within:border-neutral-700 transition-all">
          <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search Conversation.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
          />
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex px-5 border-b border-neutral-900">
        {(currentUser?.role?.toLowerCase() === 'admin' 
          ? (['All', 'Groups', 'Direct', 'Requests'] as const) 
          : (['All', 'Groups', 'Direct'] as const)
        ).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              if (tab === 'Requests') {
                setActiveRoom(null);
                setActiveRequest(null);
              } else {
                setActiveRequest(null);
              }
            }}
            className={`flex-1 text-center py-3 text-xs font-semibold cursor-pointer relative transition-colors ${
              activeTab === tab ? 'text-white' : 'text-neutral-550 hover:text-neutral-300'
            }`}
          >
            <span>{tab}</span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#be0919] animate-fadeIn" />
            )}
          </button>
        ))}
      </div>

      {/* Conversations list container */}
      <div className="flex-1 overflow-y-auto custom-red-scrollbar p-3 space-y-1">
        {activeTab === 'Requests' ? (
          (() => {
            const filteredRequests = groupRequests.filter(req => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase();
              const gName = req.groupName?.toLowerCase() || '';
              const rName = req.requestedBy?.profile?.fullName?.toLowerCase() || '';
              const rEmail = req.requestedBy?.email?.toLowerCase() || '';
              return gName.includes(query) || rName.includes(query) || rEmail.includes(query);
            });

            return filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500 font-light select-none">No requests found.</div>
            ) : (
              filteredRequests.map(req => {
                const isSelected = activeRequest?.id === req.id;
                const requesterName = req.requestedBy?.profile?.fullName || req.requestedBy?.email || 'Employee';
                const relativeTime = formatRelativeTime(req.createdAt);

                return (
                  <button
                    key={req.id}
                    onClick={() => {
                      setActiveRequest(req);
                      setActiveRoom(null);
                      setIsMobileListOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#be0919]/10 border border-[#be0919]/25 shadow-sm' 
                        : 'border border-transparent hover:bg-neutral-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-xs truncate tracking-wide">{req.groupName}</p>
                        <p className="text-[11px] text-neutral-400 font-light mt-1 truncate max-w-[170px]">
                          Req by: {requesterName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1.5 pl-2">
                      <span className="text-[10px] text-neutral-500 font-light">{relativeTime}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        req.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : req.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-[#be0919]/10 text-[#ff4d5a] border border-[#be0919]/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </button>
                );
              })
            );
          })()
        ) : (
          filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-500 font-light select-none">No conversations found.</div>
          ) : (
            filteredRooms.map(room => {
              const details = getRoomDisplayDetails(room, currentUser);
              const isSelected = activeRoom?.id === room.id;
              const latestMsg = room.messages[0];

              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#be0919]/10 border border-[#be0919]/25 shadow-sm' 
                      : 'border border-transparent hover:bg-neutral-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {room.isGroup ? (
                        <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center overflow-hidden text-[#be0919]">
                          {details.avatarUrl ? (
                            <img src={details.avatarUrl} alt="Group Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5" />
                          )}
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-sm text-neutral-400 shrink-0">
                          {details.avatarUrl ? (
                            <img src={details.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span>{details.name.charAt(0)}</span>
                          )}
                        </div>
                      )}

                      {/* Online status indicator */}
                      {details.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c0c0c] z-10" />
                      )}
                    </div>

                    {/* Name and preview */}
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-xs truncate tracking-wide">{details.name}</p>
                      <p className="text-[11px] text-neutral-400 font-light mt-1 truncate max-w-[170px]">
                        {latestMsg ? (
                          <>
                            {latestMsg.senderId === currentUser?.id ? 'You: ' : `${latestMsg.sender?.profile?.fullName || 'User'}: `}
                            {latestMsg.content}
                          </>
                        ) : (
                          'No messages yet'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Time and badge */}
                  <div className="flex flex-col items-end shrink-0 gap-1.5 pl-2">
                    <span className="text-[10px] text-neutral-500 font-light">
                      {latestMsg ? formatRelativeTime(latestMsg.createdAt) : formatRelativeTime(room.updatedAt)}
                    </span>
                    {room.unreadCount > 0 && (
                      <span className="bg-[#be0919] text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(190,9,25,0.4)] animate-pulse">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
