import { ChatRoom, Message } from './types';

export const getRoomDisplayDetails = (
  room: ChatRoom, 
  currentUser: { id: string; email: string; role: string; fullName?: string } | null
) => {
  if (room.isGroup) {
    const myParticipation = room.participants.find(p => p.userId === currentUser?.id);
    const hasExited = myParticipation?.role === 'LEFT';

    if (hasExited) {
      return {
        name: room.name || 'Group Chat',
        avatarUrl: room.groupPicture || null,
        subtext: 'You left the group',
        isGroup: true,
        isOnline: false
      };
    }

    const activeParticipants = room.participants.filter(p => p.role !== 'LEFT');
    const onlineCount = activeParticipants.filter(p => p.userId !== currentUser?.id && p.user?.isOnline).length + 
      (currentUser && activeParticipants.some(p => p.userId === currentUser.id) ? 1 : 0);
    return {
      name: room.name || 'Group Chat',
      avatarUrl: room.groupPicture || null,
      subtext: `${activeParticipants.length} Members • ${onlineCount} Online`,
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

export const formatMessageTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

export const formatMessageDate = (dateStr: string) => {
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

export const formatRelativeTime = (dateStr: string) => {
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

export const groupMessagesByDate = (msgs: Message[]) => {
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
