'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Video, 
  MoreVertical, 
  Paperclip, 
  AtSign, 
  Smile, 
  ChevronDown, 
  X, 
  Users, 
  User as UserIcon,
  ArrowLeft,
  Camera,
  Info,
  Edit3,
  Copy,
  CornerUpLeft,
  Share2,
  Pin,
  Download,
  Trash2
} from 'lucide-react';

interface UserProfile {
  fullName: string | null;
  jobTitle: string | null;
  pictureUrl: string | null;
}

interface User {
  id: string;
  email: string;
  role: string;
  isOnline: boolean;
  profile: UserProfile | null;
}

interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  fileName?: string | null;
  fileContent?: string | null;
  isSystem: boolean;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    role: string;
    profile: UserProfile | null;
  };
}

interface Participant {
  id: string;
  userId: string;
  joinedAt: string;
  lastRead: string;
  user: User;
  role: string;
}

interface ChatRoom {
  id: string;
  name: string | null;
  isGroup: boolean;
  groupPicture?: string | null;
  description?: string | null;
  pinnedMessageIds?: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
}

interface GroupRequest {
  id: string;
  groupName: string;
  requestedById: string;
  requestedBy: User;
  memberIds: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  members: User[];
}

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch('http://localhost:5000/api/chat/users', {
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
      const res = await fetch('http://localhost:5000/api/chat/rooms', {
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
      const res = await fetch(`http://localhost:5000/api/chat/rooms/${roomId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            // Scroll to bottom on new messages
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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

  // Initial and polling data load
  // Fetch group requests (Admin only)
  const fetchGroupRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/chat/group-requests', {
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
      const res = await fetch(`http://localhost:5000/api/chat/group-requests/${requestId}/approve`, {
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
      const res = await fetch(`http://localhost:5000/api/chat/group-requests/${requestId}/reject`, {
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
        await fetch('http://localhost:5000/api/chat/ping', {
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

  // Group Details Editing states & handlers
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupPicture, setEditGroupPicture] = useState<string | null>(null);

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
      const res = await fetch(`http://localhost:5000/api/chat/rooms/${activeRoom.id}`, {
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
    setTimeout(() => inputRef.current?.focus(), 50);
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
    setTimeout(() => inputRef.current?.focus(), 50);
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
    setInputText(`Replying to @${senderName}: "${msg.content.slice(0, 30)}${msg.content.length > 30 ? '...' : ''}" -> `);
    setActiveMessageMenuId(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handlePinMessage = async (msgId: string) => {
    if (!activeRoom) return;
    const isPinned = pinnedMessageIds.includes(msgId);
    setActiveMessageMenuId(null);

    const token = localStorage.getItem('token');

    // 1. Persist pin/unpin on server
    try {
      const pinRes = await fetch(`http://localhost:5000/api/chat/rooms/${activeRoom.id}/pin`, {
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
      const res = await fetch(`http://localhost:5000/api/chat/rooms/${activeRoom.id}/messages`, {
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
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
      const res = await fetch(`http://localhost:5000/api/chat/messages/${msgId}`, {
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
      const res = await fetch(`http://localhost:5000/api/chat/rooms/${targetRoomId}/messages`, {
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
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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

    const content = inputText.trim();
    const file = selectedFile;

    setInputText('');
    setSelectedFile(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/chat/rooms/${activeRoom.id}/messages`, {
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
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
      const res = await fetch('http://localhost:5000/api/chat/rooms', {
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

  // Filter conversations based on tab and search query
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

  // Get Room Details (Avatar, Name, Members count, Online status)
  const getRoomDisplayDetails = (room: ChatRoom) => {
    if (room.isGroup) {
      const onlineCount = room.participants.filter(p => p.userId !== currentUser?.id && p.user?.isOnline).length + (currentUser ? 1 : 0);
      return {
        name: room.name || 'Group Chat',
        avatarUrl: room.groupPicture || null,
        subtext: `${room.participants.length} Members • ${onlineCount} Online`,
        isGroup: true,
        isOnline: onlineCount > 0
      };
    } else {
      const otherPart = room.participants.find(p => p.userId !== currentUser?.id);
      const profile = otherPart?.user?.profile;
      const isAdmin = otherPart?.user?.role?.toLowerCase() === 'admin';
      return {
        name: profile?.fullName || (isAdmin ? 'Admin' : otherPart?.user?.email || 'Employee'),
        avatarUrl: profile?.pictureUrl,
        subtext: profile?.jobTitle || (isAdmin ? 'Administrator' : otherPart?.user?.role || 'Employee'),
        isGroup: false,
        isOnline: otherPart?.user?.isOnline || false
      };
    }
  };

  // Helper date/time formatters
  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const formatMessageDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {
      return '';
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 60) {
        return `${Math.max(1, diffMins)}m`;
      } else if (diffHours < 24) {
        return `${diffHours}h`;
      } else if (date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
        return 'yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return '';
    }
  };

  const renderMessageContentWithMentions = (content: string) => {
    if (!content) return null;

    // Check if the message is only emojis (with spaces)
    const isOnlyEmojis = (text: string) => {
      const cleaned = text.replace(/\s/g, '');
      if (!cleaned) return false;
      const emojiRegex = /^(?:[\u2700-\u27bf]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\uD83F[\uD000-\uDFFF]|[\u2b50\u2b55\u00a9\u00ae\u2122])+$/;
      return emojiRegex.test(cleaned);
    };

    if (isOnlyEmojis(content)) {
      return (
        <span className="text-[28px] leading-relaxed select-text inline-block">
          {content}
        </span>
      );
    }

    // Match @ followed by word characters, optionally matching a space and second word (such as @John Doe)
    const mentionRegex = /(@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)/g;
    const parts = content.split(mentionRegex);

    // Emoji match regex to highlight emojis inside text
    const emojiRegexInside = /([\u2700-\u27bf]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\uD83F[\uD000-\uDFFF]|[\u2b50\u2b55\u00a9\u00ae\u2122])/g;

    return parts.map((part, index) => {
      if (mentionRegex.test(part)) {
        return (
          <span 
            key={`mention-${index}`} 
            className="bg-[#be0919]/15 text-[#ff4d5a] px-1.5 py-0.5 rounded font-medium mx-0.5 select-all"
          >
            {part}
          </span>
        );
      }
      
      const textParts = part.split(emojiRegexInside);
      return textParts.map((tPart, tIndex) => {
        if (emojiRegexInside.test(tPart)) {
          return (
            <span key={`emoji-${index}-${tIndex}`} className="text-[16px] inline-block align-middle mx-0.5 leading-none">
              {tPart}
            </span>
          );
        }
        return tPart;
      });
    });
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

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach(msg => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

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
        <div className="mx-6 sm:mx-10 mb-6 bg-[#0c0c0c] border border-neutral-900 rounded-2xl flex overflow-hidden h-[620px] shrink-0">
          
          {/* Left Panel: Conversations list */}
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
                    const details = getRoomDisplayDetails(room);
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

          {/* Right Panel: Chat pane */}
          <div className={`flex-1 flex flex-col bg-[#080808] relative ${
            isMobileListOpen ? 'hidden md:flex' : 'flex'
          }`}>
            {activeRequest ? (
              <>
                {/* Header */}
                <div className="h-[72px] px-6 border-b border-neutral-900 flex items-center bg-[#0a0a0a] shrink-0 gap-3">
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
                    <p className="font-semibold text-white text-xs tracking-wide">Group Chat Request Review</p>
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
                    <div>
                      <h4 className="text-xs font-semibold tracking-wide uppercase">Request is {activeRequest.status}</h4>
                      <p className="text-[11px] text-neutral-400 font-light mt-1">
                        Submitted on {new Date(activeRequest.createdAt).toLocaleDateString()} at {new Date(activeRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Group Name card */}
                  <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-5 space-y-1">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block">Requested Group Name</span>
                    <p className="text-xs font-semibold text-white mt-1.5">{activeRequest.groupName}</p>
                  </div>

                  {/* Requester Profile card */}
                  <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] text-neutral-550 font-semibold uppercase tracking-wider block">Requested By</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-sm text-neutral-400 shrink-0">
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

                  {/* Members Checklist card */}
                  <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] text-neutral-550 font-semibold uppercase tracking-wider block">
                      Requested Members ({activeRequest.members?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeRequest.members?.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-[#050505] border border-neutral-900 rounded-xl">
                          <div className="w-8.5 h-8.5 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-semibold text-xs text-neutral-400 shrink-0">
                            {member.profile?.pictureUrl ? (
                              <img src={member.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{(member.profile?.fullName || 'U').charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs truncate">{member.profile?.fullName || 'No Name'}</p>
                            <p className="text-[10px] text-neutral-500 font-light truncate mt-0.5">
                              {member.profile?.jobTitle || member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action panel at the bottom */}
                {activeRequest.status === 'PENDING' && (
                  <div className="p-5 border-t border-neutral-900 bg-[#050505] flex justify-end gap-3 shrink-0">
                    <button
                      onClick={() => handleRejectRequest(activeRequest.id)}
                      className="px-5 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)]"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleApproveRequest(activeRequest.id)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_12px_rgba(16,185,129,0.35)]"
                    >
                      Approve & Create Group
                    </button>
                  </div>
                )}
              </>
            ) : activeRoom ? (
              <>
                {/* Active chat header */}
                <div className="h-[72px] px-6 border-b border-neutral-900 flex items-center justify-between bg-[#0a0a0a] shrink-0">
                  <div 
                    onClick={() => {
                      if (activeRoom.isGroup) {
                        setEditGroupName(activeRoom.name || '');
                        setEditGroupDescription(activeRoom.description || '');
                        setEditGroupPicture(activeRoom.groupPicture || null);
                        setIsEditGroupModalOpen(true);
                      }
                    }}
                    className={`flex items-center gap-3 min-w-0 ${activeRoom.isGroup ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''}`}
                  >
                    {/* Back arrow on Mobile */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileListOpen(true);
                      }}
                      className="md:hidden p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white mr-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

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
                          {getRoomDisplayDetails(activeRoom).avatarUrl ? (
                            <img src={getRoomDisplayDetails(activeRoom).avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span>{getRoomDisplayDetails(activeRoom).name.charAt(0)}</span>
                          )}
                        </div>
                      )}
                      {getRoomDisplayDetails(activeRoom).isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-white text-xs truncate tracking-wide">{getRoomDisplayDetails(activeRoom).name}</p>
                      <p className="text-[10px] text-neutral-500 font-light mt-0.5 truncate">{getRoomDisplayDetails(activeRoom).subtext}</p>
                    </div>
                  </div>

                  {/* Top icons */}
                  <div className="flex items-center gap-3.5 text-neutral-400">
                    <button className="p-2 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer">
                      <Video className="w-4.5 h-4.5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer">
                      <MoreVertical className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Pinned message banner */}
                {(() => {
                  const pinnedMsgs = messages.filter(m => pinnedMessageIds.includes(m.id));
                  if (pinnedMsgs.length === 0) return null;
                  const latestPinned = pinnedMsgs[pinnedMsgs.length - 1];
                  const pinnerProfile = latestPinned.sender?.profile;
                  const isPinnerAdmin = latestPinned.sender?.role?.toLowerCase() === 'admin';
                  const pinnerName = pinnerProfile?.fullName || (isPinnerAdmin ? 'Admin' : latestPinned.sender?.email?.split('@')[0] || 'Someone');
                  return (
                    <div className="px-5 py-2.5 bg-[#0c0c0c]/90 border-b border-neutral-900 flex items-center gap-3 shrink-0 animate-fadeIn">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Pin className="w-3.5 h-3.5 text-amber-500/80 shrink-0 rotate-45" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[9.5px] text-amber-500/70 font-semibold uppercase tracking-wider select-none">
                            Pinned Message {pinnedMsgs.length > 1 ? `(${pinnedMsgs.length})` : ''}
                          </p>
                          <p className="text-[11px] text-neutral-300 truncate font-normal leading-snug mt-0.5">
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
                <div className="flex-1 overflow-y-auto custom-red-scrollbar p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-neutral-500 font-light select-none">
                      No messages yet. Send a message to start the conversation!
                    </div>
                  ) : (
                    Object.keys(groupedMessages).map(dateKey => {
                      const dayMessages = groupedMessages[dateKey].filter(msg => !deletedForMeIds.includes(msg.id));
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
                          {dayMessages.map(msg => {
                            if (msg.isSystem) {
                              return (
                                <div key={msg.id} className="flex items-center justify-center my-3.5 select-none">
                                  <div className="bg-neutral-900/65 border border-neutral-950/80 px-4 py-1.5 rounded-full shadow-sm max-w-[85%] text-center">
                                    <p className="text-[10.5px] text-neutral-400 font-light tracking-wide leading-relaxed">
                                      {msg.content}
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            const isOwn = msg.senderId === currentUser?.id;
                            const senderProfile = msg.sender?.profile;
                            const isSenderAdmin = msg.sender?.role?.toLowerCase() === 'admin';
                            const senderName = senderProfile?.fullName || (isSenderAdmin ? 'Admin' : msg.sender?.email || 'Employee');
                            const senderRole = senderProfile?.jobTitle || (isSenderAdmin ? 'Administrator' : msg.sender?.role || 'Employee');
                            const senderPic = senderProfile?.pictureUrl;

                            return (
                              <div key={msg.id} className={`flex items-start gap-3.5 max-w-[85%] ${
                                isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
                              }`}>
                                
                                {/* Avatar bubble */}
                                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-xs text-neutral-400 shrink-0 select-none">
                                  {senderPic ? (
                                    <img src={senderPic} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{senderName.charAt(0)}</span>
                                  )}
                                </div>

                                {/* Message block */}
                                <div className="flex flex-col gap-1.5 min-w-0">
                                  
                                  {/* Sender detail headers */}
                                  <div className={`flex items-center gap-1.5 text-[10.5px] font-light ${
                                    isOwn ? 'justify-end text-neutral-450' : 'text-neutral-400'
                                  }`}>
                                    {isOwn ? (
                                      <>
                                        <span className="text-neutral-400 font-normal text-[10px]">{senderRole}</span>
                                        <span className="font-semibold text-white text-[12.5px]">{senderName}</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="font-semibold text-white text-[12.5px]">{senderName}</span>
                                        <span className="text-neutral-400 font-normal text-[10px]">{senderRole}</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Text bubble bubble */}
                                  <div className={`p-4 rounded-2xl border text-xs font-normal leading-relaxed text-white relative group select-text ${
                                    isOwn 
                                      ? 'bg-[#151515]/90 border-neutral-850 rounded-tr-none' 
                                      : 'bg-[#0c0c0c]/90 border-neutral-900 rounded-tl-none'
                                  }`}>
                                    
                                    {/* Pinned note badge */}
                                    {pinnedMessageIds.includes(msg.id) && (
                                      <div className="flex items-center gap-1.5 mb-1.5 text-amber-500/80 font-medium text-[9px] select-none uppercase tracking-wider pl-4 pr-4">
                                        <span>📌 Pinned</span>
                                      </div>
                                    )}

                                    {/* Action chevron */}
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMessageMenuId(prev => prev === msg.id ? null : msg.id);
                                      }}
                                      className={`absolute top-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-neutral-500 hover:text-white z-20 ${
                                        isOwn ? 'left-3' : 'right-3'
                                      }`}
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </div>
                                    
                                    {/* Message actions popover menu */}
                                    {activeMessageMenuId === msg.id && (() => {
                                      const isLastMessage = dayMessages.indexOf(msg) >= dayMessages.length - 2;
                                      return (
                                        <div 
                                          ref={messageMenuRef}
                                          className={`absolute z-[9999] bg-[#0c0c0c] border border-neutral-900 rounded-xl shadow-2xl p-1.5 w-44 flex flex-col gap-0.5 animate-fadeIn select-none ${
                                            isLastMessage ? 'bottom-8' : 'top-8'
                                          } ${
                                            isOwn ? 'left-3' : 'right-3'
                                          }`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => handleCopyMessage(msg.content)}
                                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                          >
                                            <Copy className="w-3.5 h-3.5 text-neutral-450" />
                                            Copy Text
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleReplyMessage(msg, senderName)}
                                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                          >
                                            <CornerUpLeft className="w-3.5 h-3.5 text-neutral-450" />
                                            Reply
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleStartForward(msg.content)}
                                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                          >
                                            <Share2 className="w-3.5 h-3.5 text-neutral-450" />
                                            Forward
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handlePinMessage(msg.id)}
                                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                          >
                                            <Pin className="w-3.5 h-3.5 text-neutral-450" />
                                            {pinnedMessageIds.includes(msg.id) ? 'Unpin' : 'Pin'}
                                          </button>
                                          {msg.fileName && msg.fileContent && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleDownloadFile(msg.fileName!, msg.fileContent!);
                                                setActiveMessageMenuId(null);
                                              }}
                                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer border-t border-neutral-950/60 mt-0.5 pt-2"
                                            >
                                              <Download className="w-3.5 h-3.5 text-neutral-450" />
                                              Download
                                            </button>
                                          )}
                                          {isOwn ? (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteForMe(msg.id)}
                                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-950/15 hover:text-red-400 text-left text-[11px] text-red-500/80 transition-colors cursor-pointer border-t border-neutral-950/60 mt-0.5 pt-2"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500/60" />
                                                Delete for Me
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteForEveryone(msg.id)}
                                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-950/25 hover:text-red-400 text-left text-[11px] text-red-500 transition-colors cursor-pointer"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                Delete for Everyone
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteForMe(msg.id)}
                                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-950/15 hover:text-red-400 text-left text-[11px] text-red-500/80 transition-colors cursor-pointer border-t border-neutral-950/60 mt-0.5 pt-2"
                                            >
                                              <Trash2 className="w-3.5 h-3.5 text-red-500/60" />
                                              Delete for Me
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })()}
                                    
                                    <div className={isOwn ? 'pl-4' : 'pr-4'}>
                                      {msg.content && <p>{renderMessageContentWithMentions(msg.content)}</p>}
                                      {msg.fileName && msg.fileContent && (
                                        <div className="mt-2">
                                          {msg.fileContent.startsWith('data:image/') || msg.fileName.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                                            <img
                                              src={msg.fileContent}
                                              alt={msg.fileName}
                                              className="max-w-full sm:max-w-[280px] max-h-[200px] rounded-lg cursor-pointer border border-neutral-800 hover:opacity-90 object-cover mt-1 transition-opacity"
                                              onClick={() => setLightboxImage(msg.fileContent || null)}
                                            />
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => handleDownloadFile(msg.fileName!, msg.fileContent!)}
                                              className="flex items-center gap-2 bg-[#050505] hover:bg-[#111] border border-neutral-900 px-3 py-2 rounded-lg text-[11px] font-medium text-[#be0919] hover:text-white transition-all cursor-pointer mt-1"
                                            >
                                              <Paperclip className="w-3.5 h-3.5 text-[#be0919]" />
                                              <span className="truncate max-w-[150px]">{msg.fileName}</span>
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`text-[9.5px] text-neutral-500 font-light mt-1 select-none ${
                                    isOwn ? 'self-end mr-1.5' : 'self-start ml-1.5'
                                  }`}>
                                    {formatMessageTime(msg.createdAt)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer Send inputs */}
                <form onSubmit={handleSendMessage} className="p-5 border-t border-neutral-900 bg-[#050505] flex flex-col gap-3 shrink-0">
                  
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
                        className="text-neutral-500 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#0c0c0c] border border-neutral-900 focus-within:border-neutral-700 transition-all rounded-xl px-4.5 py-3 flex items-center gap-3.5 relative">
                      
                      {/* User profile picture */}
                      <div className="w-6.5 h-6.5 rounded-full bg-neutral-900 border border-neutral-850 overflow-hidden flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0 select-none">
                        {currentUser?.fullName ? (
                          <span>{currentUser.fullName.charAt(0)}</span>
                        ) : (
                          <UserIcon className="w-3 h-3 text-neutral-500" />
                        )}
                      </div>

                      <input
                        type="text"
                        ref={inputRef}
                        placeholder="Type your message.."
                        value={inputText}
                        onChange={handleInputChange}
                        className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
                      />

                      {/* Toolbar buttons */}
                      <div className="flex items-center gap-2.5 text-neutral-500 shrink-0">
                        
                        <input 
                          type="file" 
                          ref={fileInputRef} 
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
                        
                        {activeRoom?.isGroup && (
                          <button 
                            type="button" 
                            onClick={handleMentionClick}
                            title="Mention group member"
                            className="hover:text-white transition-colors cursor-pointer"
                          >
                            <AtSign className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button 
                          type="button" 
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          title="Insert emoji"
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          <Smile className="w-4 h-4" />
                        </button>

                        {/* Emoji Picker Popover */}
                        {showEmojiPicker && (
                          <div 
                            ref={emojiPickerRef}
                            className="absolute bottom-14 right-2 bg-[#0c0c0c] border border-neutral-900 p-3 rounded-2xl shadow-2xl z-[9999] w-56 animate-fadeIn"
                          >
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-900">
                              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Select Emoji</span>
                              <button 
                                type="button"
                                onClick={() => setShowEmojiPicker(false)}
                                className="text-neutral-550 hover:text-white cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-center text-lg select-none">
                              {['😀', '😂', '😍', '👍', '🔥', '🎉', '❤️', '👏', '🚀', '🙌', '💡', '🤔', '👀', '✨', '⚡'].map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setInputText(prev => prev + emoji);
                                    setTimeout(() => inputRef.current?.focus(), 50);
                                  }}
                                  className="hover:bg-neutral-900 p-1.5 rounded transition-all cursor-pointer transform hover:scale-115"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mentions Popover */}
                        {showMentionsList && activeRoom && activeRoom.isGroup && (
                          <div 
                            ref={mentionsRef}
                            className="absolute bottom-14 left-1/3 bg-[#0c0c0c] border border-neutral-900 rounded-2xl shadow-2xl z-[9999] w-60 max-h-48 overflow-y-auto p-1.5 custom-red-scrollbar animate-fadeIn"
                          >
                            <div className="flex items-center justify-between px-2.5 py-2 border-b border-neutral-900 mb-1.5 select-none">
                              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Mention Member</span>
                              <button 
                                type="button"
                                onClick={() => setShowMentionsList(false)}
                                className="text-neutral-550 hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="space-y-1">
                              {activeRoom.participants
                                .filter(p => p.userId !== currentUser?.id)
                                .map(p => {
                                  const profile = p.user?.profile;
                                  const name = profile?.fullName || (p.user?.role?.toLowerCase() === 'admin' ? 'Admin' : p.user?.email || 'Employee');
                                  const role = profile?.jobTitle || (p.user?.role?.toLowerCase() === 'admin' ? 'Administrator' : p.user?.role || 'Employee');
                                  const pic = profile?.pictureUrl;

                                  return (
                                    <button
                                      type="button"
                                      key={p.id}
                                      onClick={() => handleSelectMention(name)}
                                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-900/40 text-left transition-colors cursor-pointer border border-transparent hover:border-neutral-900"
                                    >
                                      <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-3xs text-neutral-400 shrink-0 select-none">
                                        {pic ? (
                                          <img src={pic} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                          <span>{name.charAt(0)}</span>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-white truncate tracking-wide">{name}</p>
                                        <p className="text-[9px] text-neutral-550 truncate font-light">{role}</p>
                                      </div>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-[0_3px_12px_rgba(190,9,25,0.25)] hover:shadow-[0_3px_16px_rgba(190,9,25,0.4)] whitespace-nowrap"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
                {/* Mobile Back trigger if mobile view is hiding list */}
                <button 
                  onClick={() => setIsMobileListOpen(true)}
                  className="md:hidden px-4 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>View Conversations</span>
                </button>
                <div className="w-16 h-16 rounded-full bg-red-500/5 text-[#be0919] border border-[#be0919]/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Your Conversations</h3>
                <p className="text-xs text-neutral-500 font-light mt-1 text-center max-w-[280px]">
                  Select a chat thread from the left menu or start a new message to communicate with your team.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
              <span className="text-sm font-semibold text-white tracking-wide">Start a Conversation</span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal type selection tabs */}
            <div className="flex border-b border-neutral-900 bg-[#050505]/40">
              <button
                onClick={() => { setIsGroupChat(false); setSelectedUserIds([]); }}
                className={`flex-1 py-3 text-xs font-semibold cursor-pointer relative transition-colors ${
                  !isGroupChat ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <span>Direct Message</span>
                {!isGroupChat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#be0919]" />}
              </button>
              <button
                onClick={() => { setIsGroupChat(true); setSelectedUserIds([]); }}
                className={`flex-1 py-3 text-xs font-semibold cursor-pointer relative transition-colors ${
                  isGroupChat ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
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
                          <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-xs text-neutral-450 shrink-0">
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
                onClick={() => setIsModalOpen(false)}
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
      )}

      {/* Edit Group Details / Group Info Modal */}
      {isEditGroupModalOpen && activeRoom && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-neutral-900 flex items-center justify-between shrink-0">
              <span className="text-sm font-semibold text-white tracking-wide">
                {isCurrentUserGroupAdmin(activeRoom) ? 'Edit Group Details' : 'Group Information'}
              </span>
              <button 
                onClick={() => setIsEditGroupModalOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
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
                  {isCurrentUserGroupAdmin(activeRoom) && (
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
                {isCurrentUserGroupAdmin(activeRoom) && (
                  <span className="text-[10px] text-neutral-500 font-light">Click circle to upload a custom group avatar</span>
                )}
              </div>

              {/* Group Name input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Group Name</label>
                {isCurrentUserGroupAdmin(activeRoom) ? (
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
                {isCurrentUserGroupAdmin(activeRoom) ? (
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
                  Group Members ({activeRoom.participants.length})
                </label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-red-scrollbar pr-1">
                  {activeRoom.participants.map(part => {
                    const profile = part.user?.profile;
                    const name = profile?.fullName || (part.user?.role?.toLowerCase() === 'admin' ? 'Admin' : part.user?.email || 'Employee');
                    const role = profile?.jobTitle || (part.user?.role?.toLowerCase() === 'admin' ? 'Administrator' : part.user?.role || 'Employee');
                    const pic = profile?.pictureUrl;
                    const isPartGroupAdmin = part.role === 'ADMIN' || part.user?.role?.toLowerCase() === 'admin';

                    return (
                      <div key={part.id} className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-900 bg-[#050505]/20">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-semibold text-[10px] text-neutral-450 shrink-0 select-none">
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
                onClick={() => setIsEditGroupModalOpen(false)}
                className="px-5 py-2.5 border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {isCurrentUserGroupAdmin(activeRoom) ? 'Cancel' : 'Close'}
              </button>
              {isCurrentUserGroupAdmin(activeRoom) && (
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
      )}

      {/* Lightbox Modal Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[99999] flex items-center justify-center animate-fadeIn p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div 
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxImage} 
              alt="Fullscreen View" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-neutral-900 shadow-2xl animate-scaleIn select-none cursor-default"
            />
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
      {isForwardModalOpen && forwardContent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-neutral-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white tracking-wide">Forward Message</h3>
              <button 
                onClick={() => {
                  setIsForwardModalOpen(false);
                  setForwardContent(null);
                }}
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
                  const details = getRoomDisplayDetails(room);
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleConfirmForward(room.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-900/40 text-left transition-colors border border-transparent hover:border-neutral-900 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden text-neutral-400 font-semibold text-xs shrink-0 select-none">
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
                onClick={() => {
                  setIsForwardModalOpen(false);
                  setForwardContent(null);
                }}
                className="px-4 py-2 border border-neutral-900 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
