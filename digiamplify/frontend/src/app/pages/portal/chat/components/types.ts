export interface UserProfile {
  fullName: string | null;
  jobTitle: string | null;
  pictureUrl: string | null;
}

export interface User {
  id: string;
  email: string;
  role: string;
  isOnline: boolean;
  profile: UserProfile | null;
  chatLastActive?: number | null;
}

export interface Message {
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

export interface Participant {
  id: string;
  userId: string;
  joinedAt: string;
  lastRead: string;
  user: User;
  role: string;
}

export interface ChatRoom {
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

export interface GroupRequest {
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
