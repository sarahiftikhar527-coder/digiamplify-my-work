'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  AtSign, 
  Info, 
  MessageSquare, 
  MoreVertical, 
  Paperclip, 
  Pin, 
  Smile, 
  Users, 
  User as UserIcon, 
  X,
  Plus
} from 'lucide-react';
import { ChatRoom, GroupRequest, Message, User, Participant } from './types';
import { getRoomDisplayDetails, formatMessageDate, formatMessageTime } from './utils';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  currentUser: { id: string; email: string; role: string; fullName?: string } | null;
  activeRoom: ChatRoom | null;
  activeRequest: GroupRequest | null;
  messages: Message[];
  groupedMessages: { [key: string]: Message[] };
  pinnedMessageIds: string[];
  deletedForMeIds: string[];
  isMobileListOpen: boolean;
  setIsMobileListOpen: (val: boolean) => void;
  setActiveRequest: (req: GroupRequest | null) => void;
  handleApproveRequest: (requestId: string) => void;
  handleRejectRequest: (requestId: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  inputText: string;
  setInputText: (val: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: { name: string; content: string } | null;
  setSelectedFile: (val: { name: string; content: string } | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
  mentionsRef: React.RefObject<HTMLDivElement | null>;
  messageMenuRef: React.RefObject<HTMLDivElement | null>;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (val: boolean) => void;
  showMentionsList: boolean;
  setShowMentionsList: (val: boolean) => void;
  activeMessageMenuId: string | null;
  setActiveMessageMenuId: (id: string | null) => void;
  handleCopyMessage: (content: string) => void;
  handleReplyMessage: (msg: Message, senderName: string) => void;
  handleStartForward: (content: string) => void;
  handlePinMessage: (msgId: string) => void;
  handleDownloadFile: (fileName: string, fileContent: string) => void;
  handleDeleteForMe: (msgId: string) => void;
  handleDeleteForEveryone: (msgId: string) => void;
  setLightboxImage: (url: string | null) => void;
  handleSelectMention: (memberName: string) => void;
  handleMentionClick: () => void;
  openEditGroupModal: () => void;
  replyingToMessage: { id: string; senderName: string; content: string } | null;
  setReplyingToMessage: (msg: { id: string; senderName: string; content: string } | null) => void;
  fetchRooms: (silent?: boolean) => Promise<void>;
  setActiveRoom: (room: ChatRoom | null) => void;
  users: User[];
}

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onClose
}: ConfirmationModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl animate-scaleUp">
        <h3 className="text-base font-semibold text-white tracking-wide text-left">{title}</h3>
        <p className="text-xs text-neutral-400 font-light leading-relaxed mt-2.5 text-left">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all ${
              isDestructive 
                ? 'bg-[#be0919] hover:bg-[#990714] shadow-[0_4px_12px_rgba(190,9,25,0.2)]' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentParticipants: Participant[];
  onAddMember: (userId: string) => void;
}

const AddMembersModal = ({
  isOpen,
  onClose,
  users,
  currentParticipants,
  onAddMember
}: AddMembersModalProps) => {
  const [search, setSearch] = useState('');
  if (!isOpen) return null;

  const participantUserIds = currentParticipants
    .filter(p => p.role !== 'LEFT')
    .map(p => p.userId);
  const eligibleUsers = users.filter(u => 
    !participantUserIds.includes(u.id) &&
    (u.profile?.fullName?.toLowerCase().includes(search.toLowerCase()) || 
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl flex flex-col max-h-[500px] animate-scaleUp">
        <h3 className="text-base font-semibold text-white tracking-wide mb-3 text-left">Add Members</h3>
        
        {/* Search input */}
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#050505] border border-neutral-900 rounded-lg px-3.5 py-2 text-xs font-light text-white outline-none focus:border-[#be0919] transition-all mb-4"
        />

        {/* User list */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[150px] custom-red-scrollbar">
          {eligibleUsers.map(user => {
            const name = user.profile?.fullName || user.email;
            const role = user.profile?.jobTitle || 'Employee';
            return (
              <div key={user.id} className="flex items-center justify-between p-2.5 bg-neutral-950/45 hover:bg-neutral-900/40 border border-neutral-900/50 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-xs text-neutral-400">
                    {user.profile?.pictureUrl ? (
                      <img src={user.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white">{name}</span>
                    <span className="text-[10px] text-neutral-400 font-light mt-0.5">{role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onAddMember(user.id);
                  }}
                  className="bg-[#be0919] hover:bg-[#990714] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
            );
          })}
          {eligibleUsers.length === 0 && (
            <p className="text-center text-xs text-neutral-500 font-light py-8">No employees found to add.</p>
          )}
        </div>

        <div className="flex items-center justify-end mt-4 border-t border-neutral-900 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface ViewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: ChatRoom;
  currentUser: { id: string; email: string; role: string; fullName?: string } | null;
}

const ViewContactModal = ({
  isOpen,
  onClose,
  room,
  currentUser
}: ViewContactModalProps) => {
  if (!isOpen) return null;

  if (room.isGroup) {
    const activeMembers = room.participants.filter(p => p.role !== 'LEFT');
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl flex flex-col max-h-[500px] animate-scaleUp text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center overflow-hidden text-[#be0919] mx-auto mb-4">
            {room.groupPicture ? (
              <img src={room.groupPicture} alt="Group Avatar" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">{room.name}</h3>
          <p className="text-xs text-neutral-400 font-light mt-1.5 max-w-sm mx-auto leading-relaxed italic">
            {room.description || "No description provided."}
          </p>

          <div className="border-t border-neutral-900 my-4 pt-4 text-left flex-1 overflow-y-auto custom-red-scrollbar">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2.5">
              Group Members ({activeMembers.length})
            </span>
            <div className="flex flex-col gap-2.5">
              {activeMembers.map(member => {
                const isMemberAdmin = member.role === 'ADMIN';
                const profile = member.user?.profile;
                const name = profile?.fullName || member.user?.email || 'User';
                const role = profile?.jobTitle || (member.user?.role === 'Admin' ? 'Administrator' : 'Employee');
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center font-bold text-[10px] text-neutral-450">
                        {profile?.pictureUrl ? (
                          <img src={profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white">{name}</span>
                        <span className="text-[9.5px] text-neutral-500 font-light">{role}</span>
                      </div>
                    </div>
                    {isMemberAdmin && (
                      <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
                        Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end mt-4 border-t border-neutral-900 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Direct Chat (DM) Contact details
  const displayDetails = getRoomDisplayDetails(room, currentUser);
  const otherParticipant = room.participants.find(p => p.userId !== currentUser?.id);
  const profile = otherParticipant?.user?.profile;
  const contactName = displayDetails.name;
  const contactRole = profile?.jobTitle || (otherParticipant?.user?.role === 'Admin' ? 'Administrator' : 'Employee');
  const contactEmail = otherParticipant?.user?.email || 'N/A';
  const avatarUrl = displayDetails.avatarUrl;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl flex flex-col animate-scaleUp text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-lg text-neutral-400 mx-auto mb-4 relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{contactName.charAt(0)}</span>
          )}
          {displayDetails.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c0c0c]" />
          )}
        </div>
        
        <h3 className="text-base font-bold text-white tracking-wide">{contactName}</h3>
        <p className="text-xs text-[#be0919] font-medium mt-0.5">{contactRole}</p>
        <p className="text-xs text-neutral-450 font-light mt-3 leading-relaxed border-t border-neutral-900 pt-3">
          Email: <span className="text-neutral-300 select-all font-normal">{contactEmail}</span>
        </p>
        <p className="text-[10px] text-neutral-500 font-light mt-1">
          Status: {displayDetails.isOnline ? 'Online' : 'Offline'}
        </p>

        <div className="flex items-center justify-end mt-6 border-t border-neutral-900 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatWindow({
  currentUser,
  activeRoom,
  activeRequest,
  messages,
  groupedMessages,
  pinnedMessageIds,
  deletedForMeIds,
  isMobileListOpen,
  setIsMobileListOpen,
  setActiveRequest,
  handleApproveRequest,
  handleRejectRequest,
  handleSendMessage,
  inputText,
  setInputText,
  handleInputChange,
  selectedFile,
  setSelectedFile,
  handleFileChange,
  fileInputRef,
  inputRef,
  messagesEndRef,
  emojiPickerRef,
  mentionsRef,
  messageMenuRef,
  showEmojiPicker,
  setShowEmojiPicker,
  showMentionsList,
  setShowMentionsList,
  activeMessageMenuId,
  setActiveMessageMenuId,
  handleCopyMessage,
  handleReplyMessage,
  handleStartForward,
  handlePinMessage,
  handleDownloadFile,
  handleDeleteForMe,
  handleDeleteForEveryone,
  setLightboxImage,
  handleSelectMention,
  handleMentionClick,
  openEditGroupModal,
  replyingToMessage,
  setReplyingToMessage,
  fetchRooms,
  setActiveRoom,
  users
}: ChatWindowProps) {

  // Header Dropdown Menu States
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);

  // Modals States
  const [isViewContactOpen, setIsViewContactOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    onConfirm: () => {}
  });

  // Local storage cleared timestamp trigger state
  const [clearedAt, setClearedAt] = useState<string | null>(null);

  useEffect(() => {
    if (activeRoom) {
      setClearedAt(localStorage.getItem(`cleared_${activeRoom.id}`));
    } else {
      setClearedAt(null);
    }
  }, [activeRoom?.id]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    const t = setTimeout(scrollToBottom, 60);
    return () => clearTimeout(t);
  }, [messages.length, activeRoom?.id]);

  // Click outside auto-close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    if (showHeaderMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showHeaderMenu]);

  if (!activeRoom && !activeRequest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#080808] text-center select-none h-full">
        <div className="w-16 h-16 rounded-full bg-[#be0919]/10 border border-[#be0919]/20 flex items-center justify-center mb-6 text-[#be0919]">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white tracking-wide">No Active Conversation</h3>
        <p className="text-xs text-neutral-500 font-light mt-2 max-w-xs leading-relaxed">
          Select a chat room from the sidebar, verify a pending group request, or start a new direct/group thread.
        </p>
      </div>
    );
  }

  // Clear Chat Handler
  const triggerClearChat = () => {
    setShowHeaderMenu(false);
    setConfirmConfig({
      isOpen: true,
      title: 'Clear Chat',
      message: 'Are you sure you want to clear all messages from this conversation? This action cannot be undone on your device.',
      confirmText: 'Clear',
      isDestructive: true,
      onConfirm: () => {
        if (!activeRoom) return;
        const nowStr = new Date().toISOString();
        localStorage.setItem(`cleared_${activeRoom.id}`, nowStr);
        setClearedAt(nowStr);
      }
    });
  };

  // Exit Group Handler
  const triggerExitGroup = () => {
    setShowHeaderMenu(false);
    setConfirmConfig({
      isOpen: true,
      title: 'Exit Group',
      message: 'Are you sure you want to exit this group? You will no longer receive or be able to send any messages.',
      confirmText: 'Exit',
      isDestructive: true,
      onConfirm: async () => {
        if (!activeRoom) return;
        try {
          const res = await fetch(`http://localhost:5000/api/chat/rooms/${activeRoom.id}/exit`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            await fetchRooms();
          } else {
            alert('Failed to exit group.');
          }
        } catch (e) {
          console.error(e);
          alert('An error occurred.');
        }
      }
    });
  };

  // Delete Group Handler
  const triggerDeleteGroup = () => {
    setShowHeaderMenu(false);
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Group',
      message: 'Are you sure you want to delete this group conversation? This group will be permanently removed from your chat list.',
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        if (!activeRoom) return;
        try {
          const res = await fetch(`http://localhost:5000/api/chat/rooms/${activeRoom.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            setActiveRoom(null);
            await fetchRooms();
          } else {
            alert('Failed to delete group.');
          }
        } catch (e) {
          console.error(e);
          alert('An error occurred.');
        }
      }
    });
  };

  // Add Member Handler
  const handleAddMemberSubmit = async (targetUserId: string) => {
    if (!activeRoom) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/rooms/${activeRoom.id}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        setIsAddMembersOpen(false);
        await fetchRooms();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add member.');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred.');
    }
  };

  if (activeRequest) {
    return (
      <div className={`flex-1 flex flex-col bg-[#080808] relative ${
        isMobileListOpen ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="h-[72px] px-6 border-b border-neutral-900 flex items-center bg-[#0a0a0a] shrink-0 gap-3 select-none">
          <button 
            onClick={() => setIsMobileListOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="font-semibold text-white text-[13.5px] tracking-wide">Group Chat Request Review</p>
            <p className="text-[10px] text-neutral-500 font-light mt-0.5">Admin review panel for employee requests</p>
          </div>
        </div>

        {/* Details Scroll Panel */}
        <div className="flex-1 overflow-y-auto custom-red-scrollbar p-6 space-y-6">
          {/* Status card */}
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
            activeRequest.status === 'PENDING'
              ? 'bg-amber-500/5 border-amber-500/10 text-amber-400'
              : activeRequest.status === 'APPROVED'
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                : 'bg-[#be0919]/5 border-[#be0919]/10 text-[#ff4d5a]'
          }`}>
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-current text-xs font-bold">
              {activeRequest.status === 'PENDING' ? '!' : activeRequest.status === 'APPROVED' ? '✓' : '✗'}
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold tracking-wide uppercase">Request is {activeRequest.status}</h4>
              <p className="text-[11px] text-neutral-400 font-light mt-1">
                Submitted on {new Date(activeRequest.createdAt).toLocaleDateString()} at {new Date(activeRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Group Name card */}
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-5 space-y-1 text-left">
            <span className="text-[10px] text-neutral-550 font-semibold uppercase tracking-wider block">Requested Group Name</span>
            <p className="text-xs font-semibold text-white mt-1.5">{activeRequest.groupName}</p>
          </div>

          {/* Requester Profile card */}
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-5 space-y-4 text-left">
            <span className="text-[10px] text-neutral-550 font-semibold uppercase tracking-wider block">Requested By</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-sm text-neutral-450 shrink-0">
                {activeRequest.requestedBy?.profile?.pictureUrl ? (
                  <img src={activeRequest.requestedBy.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(activeRequest.requestedBy?.profile?.fullName || 'U').charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-white text-xs">{activeRequest.requestedBy?.profile?.fullName || 'No Name'}</p>
                <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                  {activeRequest.requestedBy?.profile?.jobTitle || activeRequest.requestedBy?.role} • {activeRequest.requestedBy?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-5 space-y-4 text-left">
            <span className="text-[10px] text-neutral-550 font-semibold uppercase tracking-wider block">Initial Members ({activeRequest.members?.length || 0})</span>
            <div className="flex flex-col gap-3">
              {activeRequest.members?.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-xs text-neutral-450 shrink-0">
                    {m.profile?.pictureUrl ? (
                      <img src={m.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(m.profile?.fullName || m.email || 'M').charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-xs">{m.profile?.fullName || 'Anonymous User'}</p>
                    <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                      {m.profile?.jobTitle || m.role} • {m.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        {activeRequest.status === 'PENDING' && (
          <div className="p-5 bg-[#0a0a0a] border-t border-neutral-900 flex items-center justify-end gap-3.5 select-none shrink-0">
            <button
              onClick={() => handleRejectRequest(activeRequest.id)}
              className="py-2.5 px-6 rounded-lg text-xs font-bold border border-neutral-800 text-neutral-350 hover:text-white hover:bg-neutral-950 cursor-pointer transition-colors"
            >
              Reject Group Request
            </button>
            <button
              onClick={() => handleApproveRequest(activeRequest.id)}
              className="py-2.5 px-6 rounded-lg text-xs font-bold bg-[#be0919] hover:bg-[#990714] text-white cursor-pointer transition-all shadow-[0_4px_12px_rgba(190,9,25,0.2)]"
            >
              Approve & Create Group
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!activeRoom) return null;

  const myParticipation = activeRoom.participants.find(p => p.userId === currentUser?.id);
  const isLeft = myParticipation?.role === 'LEFT';
  const isGroupAdmin = myParticipation?.role === 'ADMIN' || currentUser?.role?.toLowerCase() === 'admin';

  // Filter messages list using cleared timestamp
  const visibleMessages = clearedAt 
    ? messages.filter(m => new Date(m.createdAt).getTime() > new Date(clearedAt).getTime())
    : messages;

  return (
    <div className={`flex-1 flex flex-col bg-[#080808] relative ${
      isMobileListOpen ? 'hidden md:flex' : 'flex'
    }`}>
      
      {/* Active Conversation Header */}
      <div className="h-[72px] px-6 border-b border-neutral-900 flex items-center justify-between bg-[#0a0a0a] shrink-0 select-none">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          
          <button 
            onClick={() => setIsMobileListOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={activeRoom.isGroup && isGroupAdmin ? openEditGroupModal : undefined}
            className={`flex items-center gap-3.5 min-w-0 flex-1 ${
              activeRoom.isGroup && isGroupAdmin ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''
            }`}
          >
            {/* Active Conversation details */}
            <div className="relative shrink-0">
              {activeRoom.isGroup ? (
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center overflow-hidden text-[#be0919]">
                  {activeRoom.groupPicture ? (
                    <img src={activeRoom.groupPicture} alt="Group Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4.5 h-4.5" />
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-sm text-neutral-400 shrink-0">
                  {getRoomDisplayDetails(activeRoom, currentUser).avatarUrl ? (
                    <img src={getRoomDisplayDetails(activeRoom, currentUser).avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{getRoomDisplayDetails(activeRoom, currentUser).name.charAt(0)}</span>
                  )}
                </div>
              )}
              {getRoomDisplayDetails(activeRoom, currentUser).isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
              )}
            </div>

            <div className="min-w-0 text-left">
              <p className="font-semibold text-white text-sm sm:text-base truncate tracking-wide leading-tight">
                {getRoomDisplayDetails(activeRoom, currentUser).name}
              </p>
              <p className="text-xs text-neutral-500 font-light mt-0.5 truncate leading-none">
                {getRoomDisplayDetails(activeRoom, currentUser).subtext}
              </p>
            </div>
          </div>
        </div>

        {/* Top icons / Three dots menu dropdown button */}
        <div className="flex items-center gap-2 text-neutral-450 relative">
          <button 
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            className="p-2 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
            title="Menu Options"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>

          {/* Options Dropdown menu popover */}
          {showHeaderMenu && (
            <div 
              ref={headerMenuRef}
              className="absolute right-0 top-10 w-44 bg-[#0c0c0c] border border-neutral-900 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 z-[9999] animate-fadeIn"
            >
              <button
                onClick={() => {
                  setShowHeaderMenu(false);
                  setIsViewContactOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
              >
                {activeRoom.isGroup ? 'View Group Info' : 'View Contact'}
              </button>
              
              <button
                onClick={triggerClearChat}
                className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
              >
                Clear Chat
              </button>

              {activeRoom.isGroup && (
                <>
                  {isGroupAdmin && (
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setIsAddMembersOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <span>Add Members</span>
                      <Plus className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  )}

                  {isGroupAdmin && (
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        openEditGroupModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg cursor-pointer transition-colors"
                    >
                      Edit Group Details
                    </button>
                  )}

                  {!isLeft && (
                    <button
                      onClick={triggerExitGroup}
                      className="w-full text-left px-3 py-2 text-xs text-[#ff4d5a] hover:bg-[#be0919]/10 rounded-lg cursor-pointer transition-colors"
                    >
                      Exit Group
                    </button>
                  )}

                  <button
                    onClick={triggerDeleteGroup}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors border-t border-neutral-950/60 mt-0.5 pt-1.5"
                  >
                    Delete Group
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pinned message banner */}
      {(() => {
        const pinnedMsgs = messages.filter(m => pinnedMessageIds.includes(m.id));
        if (pinnedMsgs.length === 0) return null;
        const latestPinned = pinnedMsgs[pinnedMsgs.length - 1];
        return (
          <div className="px-5 py-2.5 bg-[#0c0c0c]/90 border-b border-neutral-900 flex items-center gap-3 shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Pin className="w-3.5 h-3.5 text-amber-500/80 shrink-0 rotate-45" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[9.5px] text-amber-500/70 font-semibold uppercase tracking-wider select-none leading-none">
                  Pinned Message {pinnedMsgs.length > 1 ? `(${pinnedMsgs.length})` : ''}
                </p>
                <p className="text-[11px] text-neutral-300 truncate font-normal leading-snug mt-1">
                  {latestPinned.content || (latestPinned.fileName ? `📎 ${latestPinned.fileName}` : 'Attachment')}
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePinMessage(latestPinned.id)}
              className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-neutral-900/50 shrink-0"
              title="Unpin"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Messages screen */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-red-scrollbar p-6 space-y-6"
      >
        {visibleMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-light select-none">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          Object.keys(groupedMessages).map(dateKey => {
            const dayMessages = groupedMessages[dateKey].filter(msg => {
              if (deletedForMeIds.includes(msg.id)) return false;
              if (clearedAt && new Date(msg.createdAt).getTime() <= new Date(clearedAt).getTime()) return false;
              return true;
            });
            if (dayMessages.length === 0) return null;
            return (
              <div key={dateKey} className="space-y-6">
                
                {/* Date separator divider */}
                <div className="flex items-center justify-center my-4">
                  <div className="h-px bg-neutral-900 flex-1" />
                  <span className="text-[10px] text-neutral-500 font-medium tracking-wider uppercase px-4 select-none">
                    {formatMessageDate(dayMessages[0].createdAt)}
                  </span>
                  <div className="h-px bg-neutral-900 flex-1" />
                </div>

                {/* Render day messages */}
                {dayMessages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    currentUser={currentUser}
                    pinnedMessageIds={pinnedMessageIds}
                    activeMessageMenuId={activeMessageMenuId}
                    setActiveMessageMenuId={setActiveMessageMenuId}
                    dayMessages={dayMessages}
                    handleCopyMessage={handleCopyMessage}
                    handleReplyMessage={handleReplyMessage}
                    handleStartForward={handleStartForward}
                    handlePinMessage={handlePinMessage}
                    handleDownloadFile={handleDownloadFile}
                    handleDeleteForMe={handleDeleteForMe}
                    handleDeleteForEveryone={handleDeleteForEveryone}
                    setLightboxImage={setLightboxImage}
                    messageMenuRef={messageMenuRef}
                    participants={activeRoom.participants}
                  />
                ))}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
      </div>

      {/* Footer Send inputs / Exited Banner */}
      {isLeft ? (
        <div className="p-5 border-t border-neutral-900 bg-neutral-950/45 text-center select-none shrink-0 flex items-center justify-center">
          <p className="text-xs text-neutral-500 font-light italic">
            You can't send messages to this group because you're no longer a participant.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-5 border-t border-neutral-900 bg-[#050505] flex flex-col gap-3 shrink-0">
          
          {/* Replying Preview Banner (WhatsApp style) */}
          {replyingToMessage && (
            <div className="flex items-stretch bg-[#0d0d0d] border border-neutral-900 rounded-xl overflow-hidden animate-fadeIn relative shrink-0">
              {/* Left pink accent line */}
              <div className="w-[4px] bg-[#be0919] shrink-0" />
              
              {/* Text content details */}
              <div className="flex-1 px-4.5 py-3 min-w-0 text-left">
                <span className="text-[11.5px] font-semibold text-[#be0919] tracking-wide truncate block">
                  {replyingToMessage.senderName}
                </span>
                <p className="text-[10px] text-neutral-450 truncate mt-0.5 font-light">
                  {replyingToMessage.content.startsWith('[Forwarded] ') 
                    ? replyingToMessage.content.slice('[Forwarded] '.length) 
                    : replyingToMessage.content}
                </p>
              </div>

              {/* Cancel close icon */}
              <button
                type="button"
                onClick={() => setReplyingToMessage(null)}
                className="px-4 flex items-center justify-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
                title="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* File preview block */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-[#0c0c0c] border border-neutral-900 rounded-lg px-3 py-2 text-xs w-fit max-w-[280px] gap-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-3.5 h-3.5 text-[#be0919] shrink-0" />
                <span className="truncate text-white font-medium">{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-neutral-550 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#0c0c0c] border border-neutral-900 focus-within:border-neutral-700 transition-all rounded-xl px-4.5 py-3 flex items-center gap-3.5 relative">
              
              {/* User profile picture */}
              <div className="w-6.5 h-6.5 rounded-full bg-neutral-900 border border-neutral-850 overflow-hidden flex items-center justify-center text-[10px] font-bold text-neutral-450 shrink-0 select-none">
                {currentUser?.fullName ? (
                  <span>{currentUser.fullName.charAt(0)}</span>
                ) : (
                  <UserIcon className="w-3 h-3 text-neutral-500" />
                )}
              </div>

              <input
                type="text"
                ref={inputRef as React.RefObject<HTMLInputElement>}
                placeholder="Type your message.."
                value={inputText}
                onChange={handleInputChange}
                className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
              />

              {/* Toolbar buttons */}
              <div className="flex items-center gap-2.5 text-neutral-500 shrink-0">
                
                <input 
                  type="file" 
                  ref={fileInputRef as React.RefObject<HTMLInputElement>} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji picker"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Mentions helper box */}
              {showMentionsList && activeRoom.isGroup && (
                <div 
                  ref={mentionsRef as React.RefObject<HTMLDivElement>}
                  className="absolute bottom-14 left-0 w-52 bg-[#0c0c0c] border border-neutral-900 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 max-h-40 overflow-y-auto custom-red-scrollbar z-50"
                >
                  {activeRoom.participants
                    .filter(p => p.role !== 'LEFT' && p.userId !== currentUser?.id)
                    .map(p => {
                      const name = p.user?.profile?.fullName || p.user?.email || 'User';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectMention(name)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-900 text-xs font-light text-neutral-350 hover:text-white transition-colors cursor-pointer"
                        >
                          @{name}
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Emoji Picker Popup container */}
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef as React.RefObject<HTMLDivElement>}
                  className="absolute bottom-14 right-0 bg-[#0c0c0c] border border-neutral-900 rounded-2xl shadow-2xl p-4 w-64 select-none z-50"
                >
                  <div className="grid grid-cols-6 gap-2 text-center text-lg">
                    {['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputText(inputText + emoji);
                          inputRef.current?.focus({ preventScroll: true });
                        }}
                        className="hover:bg-neutral-900 p-1.5 rounded-lg transition-colors cursor-pointer text-[15px]"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="submit"
              className="py-3 px-6 rounded-xl bg-[#be0919] hover:bg-[#990714] text-white text-xs font-semibold cursor-pointer transition-all shadow-[0_4px_12px_rgba(190,9,25,0.25)] shrink-0"
            >
              Send
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Dialog Modal */}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Add Members Modal */}
      <AddMembersModal
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        users={users}
        currentParticipants={activeRoom.participants}
        onAddMember={handleAddMemberSubmit}
      />

      {/* View Contact Detail Modal */}
      <ViewContactModal
        isOpen={isViewContactOpen}
        onClose={() => setIsViewContactOpen(false)}
        room={activeRoom}
        currentUser={currentUser}
      />
    </div>
  );
}
