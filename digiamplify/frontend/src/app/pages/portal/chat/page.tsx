'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import { ChatRoom, GroupRequest, Message, User } from './components/types';
import { groupMessagesByDate } from './components/utils';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import CreateRoomModal from './components/CreateRoomModal';
import EditGroupModal from './components/EditGroupModal';
import LightboxOverlay from './components/LightboxOverlay';
import ForwardMessageModal from './components/ForwardMessageModal';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: string; fullName?: string } | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Groups' | 'Direct' | 'Requests'>('All');
  const [inputText, setInputText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<GroupRequest | null>(null);

  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionsList, setShowMentionsList] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);
  const [forwardContent, setForwardContent] = useState<string | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [deletedForMeIds, setDeletedForMeIds] = useState<string[]>([]);
  const [replyingToMessage, setReplyingToMessage] = useState<{ id: string; senderName: string; content: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);

  // Group Details Editing states
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupPicture, setEditGroupPicture] = useState<string | null>(null);

  // Compute pinned message IDs from server-synced room data
  const pinnedMessageIds: string[] = (() => {
    if (!activeRoom?.pinnedMessageIds) return [];
    try { return JSON.parse(activeRoom.pinnedMessageIds); } catch { return []; }
  })();

  // Load current user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);

        const storedDeleted = localStorage.getItem(`deletedForMe_${parsed.id}`);
        if (storedDeleted) {
          setDeletedForMeIds(JSON.parse(storedDeleted));
        }
      } catch (e) {
        console.error('Failed to parse user storage', e);
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  // Fetch users for new conversation modal
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch chat rooms
  const fetchRooms = async (silent = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: ChatRoom[] = await res.json();
        setRooms(data);

        // Update active room details if selected
        if (activeRoom) {
          const updatedActive = data.find(r => r.id === activeRoom.id);
          if (updatedActive) {
            setActiveRoom(updatedActive);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
    }
  };

  // Fetch messages in active room
  const fetchMessages = async (roomId: string, silent = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  // Handle room click
  const handleRoomClick = (room: ChatRoom) => {
    setActiveRoom(room);
    setMessages([]);
    fetchMessages(room.id);
    setIsMobileListOpen(false);

    // Clear unread badge locally instantly
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unreadCount: 0 } : r));
  };

  // Fetch group requests (Admin only)
  const fetchGroupRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/group-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroupRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch group requests:', err);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this group chat request?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/group-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const newRoom = await res.json();
        alert('Group chat approved and created successfully.');
        setActiveRequest(null);
        await fetchRooms();
        await fetchGroupRequests();
        handleRoomClick(newRoom);
        setActiveTab('Groups');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to approve request.');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving request.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this group chat request?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/group-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Group chat request rejected.');
        setActiveRequest(null);
        await fetchGroupRequests();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to reject request.');
      }
    } catch (err) {
      console.error(err);
      alert('Error rejecting request.');
    }
  };

  // Initial and polling data load
  useEffect(() => {
    fetchRooms();
    fetchUsers();
    if (currentUser?.role?.toLowerCase() === 'admin') {
      fetchGroupRequests();
    }
    const interval = setInterval(() => {
      fetchRooms(true);
      if (currentUser?.role?.toLowerCase() === 'admin') {
        fetchGroupRequests();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeRoom?.id, currentUser?.id]);

  useEffect(() => {
    if (!activeRoom) return;

    fetchMessages(activeRoom.id);
    const interval = setInterval(() => {
      fetchMessages(activeRoom.id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeRoom?.id]);

  // Heartbeat ping effect for chat presence online status
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch('/api/chat/ping', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to send heartbeat:', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 4000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const isCurrentUserGroupAdmin = (room: ChatRoom | null) => {
    if (!room || !currentUser) return false;
    if (currentUser.role?.toLowerCase() === 'admin') return true;
    const participant = room.participants.find(p => p.userId === currentUser.id);
    return participant?.role === 'ADMIN';
  };

  const handleUpdateGroupDetails = async () => {
    if (!activeRoom) return;
    if (!editGroupName.trim()) {
      alert('Group name cannot be empty.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/rooms/${activeRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editGroupName.trim(),
          description: editGroupDescription.trim(),
          groupPicture: editGroupPicture
        })
      });

      if (res.ok) {
        const updatedRoom = await res.json();
        alert('Group details updated successfully.');
        setActiveRoom(updatedRoom);
        await fetchRooms();
        setIsEditGroupModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update group details.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating group details.');
    }
  };

  const resizeBase64Image = (base64Str: string, maxWidth = 150, maxHeight = 150): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleGroupPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const resized = await resizeBase64Image(reader.result as string);
        setEditGroupPicture(resized);
      } catch (err) {
        console.error('Failed to resize image:', err);
        setEditGroupPicture(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        content: reader.result as string
      });
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Download attachment handler
  const handleDownloadFile = (fileName: string, fileContent: string) => {
    const link = document.createElement('a');
    link.href = fileContent;
    link.download = fileName;
    link.click();
  };

  // Mention click handler
  const handleMentionClick = () => {
    setShowMentionsList(prev => !prev);
    if (!inputText.endsWith('@') && !showMentionsList) {
      setInputText(prev => prev + '@');
    }
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };

  const handleSelectMention = (memberName: string) => {
    setInputText(prev => {
      if (prev.endsWith('@')) {
        return prev.slice(0, -1) + `@${memberName} `;
      } else {
        return prev + `@${memberName} `;
      }
    });
    setShowMentionsList(false);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    
    if (activeRoom?.isGroup) {
      const lastChar = val.slice(-1);
      if (lastChar === '@') {
        setShowMentionsList(true);
      } else if (!val.includes('@')) {
        setShowMentionsList(false);
      }
    }
  };

  // Click outside listener for emoji picker, mentions list & message menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (mentionsRef.current && !mentionsRef.current.contains(event.target as Node)) {
        setShowMentionsList(false);
      }
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setActiveMessageMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyMessage = (content: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }
    setActiveMessageMenuId(null);
  };

  const handleReplyMessage = (msg: Message, senderName: string) => {
    setReplyingToMessage({
      id: msg.id,
      senderName,
      content: msg.content
    });
    setActiveMessageMenuId(null);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };

  const handlePinMessage = async (msgId: string) => {
    if (!activeRoom) return;
    const isPinned = pinnedMessageIds.includes(msgId);
    setActiveMessageMenuId(null);

    const token = localStorage.getItem('token');

    // 1. Persist pin/unpin on server
    try {
      const pinRes = await fetch(`/api/chat/rooms/${activeRoom.id}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageId: msgId, pin: !isPinned })
      });
      if (pinRes.ok) {
        const data = await pinRes.json();
        // Update the activeRoom and rooms list with new pinned IDs
        const newPinnedJson = JSON.stringify(data.pinnedMessageIds);
        setActiveRoom(prev => prev ? { ...prev, pinnedMessageIds: newPinnedJson } : prev);
        setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, pinnedMessageIds: newPinnedJson } : r));
      }
    } catch (err) {
      console.error('Failed to pin/unpin message:', err);
      return;
    }

    // 2. Send system notification message
    const userName = currentUser?.fullName || (currentUser?.role?.toLowerCase() === 'admin' ? 'Admin' : currentUser?.email?.split('@')[0] || 'Someone');
    const pinnedMsg = messages.find(m => m.id === msgId);
    const excerpt = pinnedMsg?.content ? pinnedMsg.content.slice(0, 40) + (pinnedMsg.content.length > 40 ? '...' : '') : 'a message';
    const systemContent = isPinned
      ? `${userName} unpinned a message`
      : `${userName} pinned "${excerpt}"`;

    try {
      const res = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: systemContent,
          fileName: null,
          fileContent: null,
          isSystem: true
        })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error('Failed to send pin notification:', err);
    }
  };

  const handleDeleteForMe = (msgId: string) => {
    setDeletedForMeIds(prev => {
      const updated = [...prev, msgId];
      if (currentUser) {
        localStorage.setItem(`deletedForMe_${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    setActiveMessageMenuId(null);
  };

  const handleDeleteForEveryone = async (msgId: string) => {
    setActiveMessageMenuId(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        fetchRooms(true);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete message for everyone');
      }
    } catch (err) {
      console.error('Error deleting message for everyone:', err);
    }
  };

  const handleStartForward = (content: string) => {
    setForwardContent(content);
    setIsForwardModalOpen(true);
    setActiveMessageMenuId(null);
  };

  const handleConfirmForward = async (targetRoomId: string) => {
    if (!forwardContent) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/rooms/${targetRoomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: `[Forwarded] ${forwardContent}`,
          fileName: null,
          fileContent: null
        })
      });
      if (res.ok) {
        const newMsg = await res.json();
        if (activeRoom && activeRoom.id === targetRoomId) {
          setMessages(prev => [...prev, newMsg]);
        }
        fetchRooms(true);
        setIsForwardModalOpen(false);
        setForwardContent(null);
      }
    } catch (err) {
      console.error('Failed to forward message:', err);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    if (!inputText.trim() && !selectedFile) return;

    // Build the final content string (JSON if replying)
    const content = replyingToMessage 
      ? JSON.stringify({
          replyTo: replyingToMessage,
          text: inputText.trim()
        })
      : inputText.trim();

    const file = selectedFile;

    setInputText('');
    setSelectedFile(null);
    setReplyingToMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          fileName: file ? file.name : null,
          fileContent: file ? file.content : null
        })
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
        fetchRooms(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Start direct message or group chat
  const handleCreateChat = async () => {
    if (isGroupChat && !groupName.trim()) {
      alert('Please enter a group name.');
      return;
    }
    if (selectedUserIds.length === 0) {
      alert('Please select at least one employee.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isGroup: isGroupChat,
          name: isGroupChat ? groupName : null,
          userIds: selectedUserIds
        })
      });

      if (res.ok) {
        const createdRoom = await res.json();
        setIsModalOpen(false);
        setGroupName('');
        setSelectedUserIds([]);

        if (createdRoom.isRequest) {
          alert(createdRoom.message || 'Your request to create this group has been sent to the Admin for approval.');
        } else {
          await fetchRooms();
          handleRoomClick(createdRoom);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to start conversation.');
      }
    } catch (err) {
      console.error(err);
      alert('Error starting conversation.');
    }
  };

  // Modal employee selection togglers
  const toggleUserSelection = (userId: string) => {
    if (isGroupChat) {
      setSelectedUserIds(prev =>
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
    } else {
      setSelectedUserIds([userId]);
    }
  };

  // Open conversation modal
  const openNewMessageModal = () => {
    setIsModalOpen(true);
    fetchUsers();
  };

  const groupedMessages = groupMessagesByDate(messages);

  const openEditGroupModal = () => {
    if (activeRoom?.isGroup) {
      setEditGroupName(activeRoom.name || '');
      setEditGroupDescription(activeRoom.description || '');
      setEditGroupPicture(activeRoom.groupPicture || null);
      setIsEditGroupModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden select-none">
      <style>{`
        .custom-red-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-track {
          background: #050505;
          border-radius: 4px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb {
          background: #be0919;
          border-radius: 4px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #990714;
        }
      `}</style>
      <Sidebar />
      <div className="flex-1 pt-24 sm:pt-10 flex flex-col justify-start relative overflow-y-auto custom-red-scrollbar">
        
        {/* Page Header */}
        <div className="px-6 sm:px-10 mb-6 shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-wide">Chat</h1>
          <p className="text-sm text-neutral-400 font-light mt-1">Communicate with your team in real-time.</p>
        </div>

        {/* Chat Main container */}
        <div className="mx-6 sm:mx-10 mb-6 bg-[#0c0c0c] border border-neutral-900 rounded-2xl flex overflow-hidden h-[800px] shrink-0">
          
          <ChatSidebar
            currentUser={currentUser}
            rooms={rooms}
            activeRoom={activeRoom}
            groupRequests={groupRequests}
            activeRequest={activeRequest}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isMobileListOpen={isMobileListOpen}
            setIsMobileListOpen={setIsMobileListOpen}
            setActiveRoom={setActiveRoom}
            setActiveRequest={setActiveRequest}
            handleRoomClick={handleRoomClick}
            openNewMessageModal={openNewMessageModal}
          />

          <ChatWindow
            currentUser={currentUser}
            activeRoom={activeRoom}
            activeRequest={activeRequest}
            messages={messages}
            groupedMessages={groupedMessages}
            pinnedMessageIds={pinnedMessageIds}
            deletedForMeIds={deletedForMeIds}
            isMobileListOpen={isMobileListOpen}
            setIsMobileListOpen={setIsMobileListOpen}
            setActiveRequest={setActiveRequest}
            handleApproveRequest={handleApproveRequest}
            handleRejectRequest={handleRejectRequest}
            handleSendMessage={handleSendMessage}
            inputText={inputText}
            setInputText={setInputText}
            handleInputChange={handleInputChange}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            handleFileChange={handleFileChange}
            fileInputRef={fileInputRef}
            inputRef={inputRef}
            messagesEndRef={messagesEndRef}
            emojiPickerRef={emojiPickerRef}
            mentionsRef={mentionsRef}
            messageMenuRef={messageMenuRef}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            showMentionsList={showMentionsList}
            setShowMentionsList={setShowMentionsList}
            activeMessageMenuId={activeMessageMenuId}
            setActiveMessageMenuId={setActiveMessageMenuId}
            handleCopyMessage={handleCopyMessage}
            handleReplyMessage={handleReplyMessage}
            handleStartForward={handleStartForward}
            handlePinMessage={handlePinMessage}
            handleDownloadFile={handleDownloadFile}
            handleDeleteForMe={handleDeleteForMe}
            handleDeleteForEveryone={handleDeleteForEveryone}
            setLightboxImage={setLightboxImage}
            handleSelectMention={handleSelectMention}
            handleMentionClick={handleMentionClick}
            openEditGroupModal={openEditGroupModal}
            replyingToMessage={replyingToMessage}
            setReplyingToMessage={setReplyingToMessage}
            fetchRooms={fetchRooms}
            setActiveRoom={setActiveRoom}
            users={users}
          />

        </div>
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        isGroupChat={isGroupChat}
        setIsGroupChat={setIsGroupChat}
        groupName={groupName}
        setGroupName={setGroupName}
        selectedUserIds={selectedUserIds}
        toggleUserSelection={toggleUserSelection}
        modalSearchQuery={modalSearchQuery}
        setModalSearchQuery={setModalSearchQuery}
        handleCreateChat={handleCreateChat}
      />

      <EditGroupModal
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        activeRoom={activeRoom}
        currentUser={currentUser}
        editGroupName={editGroupName}
        setEditGroupName={setEditGroupName}
        editGroupDescription={editGroupDescription}
        setEditGroupDescription={setEditGroupDescription}
        editGroupPicture={editGroupPicture}
        handleGroupPictureChange={handleGroupPictureChange}
        handleUpdateGroupDetails={handleUpdateGroupDetails}
        isCurrentUserGroupAdmin={isCurrentUserGroupAdmin}
      />

      <LightboxOverlay
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      <ForwardMessageModal
        isOpen={isForwardModalOpen}
        forwardContent={forwardContent}
        rooms={rooms}
        currentUser={currentUser}
        onClose={() => {
          setIsForwardModalOpen(false);
          setForwardContent(null);
        }}
        onConfirmForward={handleConfirmForward}
      />

    </div>
  );
}
