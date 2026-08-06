import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper to map online status dynamically based on chatLastActive heartbeat within last 12 seconds
const mapUserChatOnline = (user: any) => {
  if (!user) return null;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    chatLastActive: user.chatLastActive,
    isOnline: user.chatLastActive ? (nowSeconds - user.chatLastActive <= 12) : false
  };
};

const mapRoomChatOnline = (room: any) => {
  if (!room) return null;
  return {
    ...room,
    participants: room.participants ? room.participants.map((p: any) => ({
      ...p,
      user: mapUserChatOnline(p.user)
    })) : []
  };
};

export const pingChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    await prisma.user.update({
      where: { id: currentUserId },
      data: { chatLastActive: nowSeconds }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending heartbeat' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        status: 'APPROVED'
      },
      select: {
        id: true,
        email: true,
        role: true,
        chatLastActive: true,
        profile: {
          select: {
            fullName: true,
            jobTitle: true,
            pictureUrl: true
          }
        }
      },
      orderBy: {
        profile: {
          fullName: 'asc'
        }
      }
    });
    res.status(200).json(users.map(mapUserChatOnline));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

export const getRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const participations = await prisma.participant.findMany({
      where: { userId: currentUserId },
      select: {
        chatRoomId: true,
        lastRead: true,
        role: true,
        joinedAt: true
      }
    });

    const roomIds = participations.map(p => p.chatRoomId);

    const rooms = await prisma.chatRoom.findMany({
      where: { id: { in: roomIds } },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                chatLastActive: true,
                profile: {
                  select: {
                    fullName: true,
                    jobTitle: true,
                    pictureUrl: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                profile: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const roomsWithUnread = await Promise.all(rooms.map(async (room) => {
      const userParticipation = participations.find(p => p.chatRoomId === room.id);
      const lastRead = userParticipation ? userParticipation.lastRead : new Date(0);
      const isLeft = userParticipation?.role === 'LEFT';
      const exitTime = userParticipation?.joinedAt || new Date();

      let unreadCount = 0;
      if (!isLeft) {
        unreadCount = await prisma.message.count({
          where: {
            chatRoomId: room.id,
            createdAt: { gt: lastRead },
            senderId: { not: currentUserId }
          }
        });
      } else {
        // Fetch the latest message up to the exit time for preview
        const latestMessages = await prisma.message.findMany({
          where: {
            chatRoomId: room.id,
            createdAt: { lte: exitTime }
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                profile: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        });
        (room as any).messages = latestMessages;
      }

      return {
        ...mapRoomChatOnline(room),
        unreadCount
      };
    }));

    res.status(200).json(roomsWithUnread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching chat rooms' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { isGroup, name, userIds } = req.body;

    if (!isGroup) {
      const targetUserId = userIds && userIds[0];
      if (!targetUserId) {
        res.status(400).json({ error: 'Target user ID is required for direct chat' });
        return;
      }

      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          isGroup: false,
          AND: [
            { participants: { some: { userId: currentUserId } } },
            { participants: { some: { userId: targetUserId } } }
          ]
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  chatLastActive: true,
                  profile: {
                    select: {
                      fullName: true,
                      jobTitle: true,
                      pictureUrl: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (existingRoom) {
        res.status(200).json(mapRoomChatOnline(existingRoom));
        return;
      }

      const newRoom = await prisma.chatRoom.create({
        data: {
          isGroup: false,
          participants: {
            create: [
              { userId: currentUserId, role: "ADMIN" },
              { userId: targetUserId, role: "MEMBER" }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  chatLastActive: true,
                  profile: {
                    select: {
                      fullName: true,
                      jobTitle: true,
                      pictureUrl: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      res.status(201).json(mapRoomChatOnline(newRoom));
    } else {
      if (!name || name.trim() === '') {
        res.status(400).json({ error: 'Group name is required' });
        return;
      }

      if (user.role.toLowerCase() !== 'admin') {
        const uniqueUserIds = Array.from(new Set([currentUserId, ...(userIds || [])]));
        
        const groupRequest = await prisma.groupRequest.create({
          data: {
            groupName: name.trim(),
            requestedById: currentUserId,
            memberIds: JSON.stringify(uniqueUserIds)
          }
        });

        res.status(202).json({
          message: `Your request to create group "${name.trim()}" has been sent to the Admin for approval.`,
          isRequest: true,
          request: groupRequest
        });
        return;
      }

      const uniqueUserIds = Array.from(new Set([currentUserId, ...(userIds || [])]));

      const participantUsers = await prisma.user.findMany({
        where: { id: { in: uniqueUserIds } },
        select: { id: true, role: true }
      });

      const isUserSystemAdmin = (uid: string) => {
        const u = participantUsers.find(pu => pu.id === uid);
        return u?.role?.toLowerCase() === 'admin';
      };

      const newRoom = await prisma.chatRoom.create({
        data: {
          isGroup: true,
          name: name.trim(),
          participants: {
            create: uniqueUserIds.map(uid => ({
              userId: uid,
              role: (uid === currentUserId || isUserSystemAdmin(uid)) ? "ADMIN" : "MEMBER"
            }))
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  chatLastActive: true,
                  profile: {
                    select: {
                      fullName: true,
                      jobTitle: true,
                      pictureUrl: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      const creator = await prisma.user.findUnique({
        where: { id: currentUserId },
        include: { profile: { select: { fullName: true } } }
      });
      const creatorName = creator?.profile?.fullName || creator?.email || 'Admin';

      await prisma.message.create({
        data: {
          chatRoomId: newRoom.id,
          senderId: currentUserId,
          content: `Group "${name.trim()}" was created by ${creatorName}.`,
          isSystem: true
        }
      });

      res.status(201).json(mapRoomChatOnline(newRoom));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating chat room' });
  }
};

export const getGroupRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId }
    });

    if (!user || user.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admins only' });
      return;
    }

    const requests = await prisma.groupRequest.findMany({
      include: {
        requestedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            chatLastActive: true,
            profile: {
              select: {
                fullName: true,
                jobTitle: true,
                pictureUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedRequests = await Promise.all(requests.map(async (request) => {
      let memberIds: string[] = [];
      try {
        memberIds = JSON.parse(request.memberIds);
      } catch (e) {
        console.error('Error parsing memberIds:', e);
      }

      const members = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: {
          id: true,
          email: true,
          role: true,
          chatLastActive: true,
          profile: {
            select: {
              fullName: true,
              jobTitle: true,
              pictureUrl: true
            }
          }
        }
      });

      return {
        ...request,
        requestedBy: mapUserChatOnline(request.requestedBy),
        members: members.map(mapUserChatOnline)
      };
    }));

    res.status(200).json(mappedRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching group requests' });
  }
};

export const approveGroupRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { requestId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId }
    });

    if (!user || user.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admins only' });
      return;
    }

    const groupRequest = await prisma.groupRequest.findUnique({
      where: { id: requestId },
      include: {
        requestedBy: {
          select: {
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!groupRequest) {
      res.status(404).json({ error: 'Group request not found' });
      return;
    }

    if (groupRequest.status !== 'PENDING') {
      res.status(400).json({ error: `Group request is already ${groupRequest.status}` });
      return;
    }

    let memberIds: string[] = [];
    try {
      memberIds = JSON.parse(groupRequest.memberIds);
    } catch (e) {
      res.status(500).json({ error: 'Invalid members list in request' });
      return;
    }

    const participantUsers = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, role: true }
    });

    const isUserSystemAdmin = (uid: string) => {
      const u = participantUsers.find(pu => pu.id === uid);
      return u?.role?.toLowerCase() === 'admin';
    };

    const newRoom = await prisma.chatRoom.create({
      data: {
        isGroup: true,
        name: groupRequest.groupName,
        participants: {
          create: memberIds.map(uid => ({
            userId: uid,
            role: (uid === groupRequest.requestedById || isUserSystemAdmin(uid)) ? "ADMIN" : "MEMBER"
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                chatLastActive: true,
                profile: {
                  select: {
                    fullName: true,
                    jobTitle: true,
                    pictureUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });

    await prisma.groupRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' }
    });

    const requesterName = groupRequest.requestedBy?.profile?.fullName || 'Employee';
    await prisma.message.create({
      data: {
        chatRoomId: newRoom.id,
        senderId: currentUserId,
        content: `Group "${groupRequest.groupName}" was approved by Admin (requested by ${requesterName}).`,
        isSystem: true
      }
    });

    res.status(200).json(mapRoomChatOnline(newRoom));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error approving group request' });
  }
};

export const rejectGroupRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { requestId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId }
    });

    if (!user || user.role.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admins only' });
      return;
    }

    const groupRequest = await prisma.groupRequest.findUnique({
      where: { id: requestId }
    });

    if (!groupRequest) {
      res.status(404).json({ error: 'Group request not found' });
      return;
    }

    if (groupRequest.status !== 'PENDING') {
      res.status(400).json({ error: `Group request is already ${groupRequest.status}` });
      return;
    }

    const updated = await prisma.groupRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error rejecting group request' });
  }
};

export const getRoomMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { roomId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const participation = await prisma.participant.findUnique({
      where: {
        userId_chatRoomId: {
          userId: currentUserId,
          chatRoomId: roomId
        }
      }
    });

    if (!participation) {
      res.status(403).json({ error: 'You are not a participant in this room' });
      return;
    }

    const isLeft = participation.role === 'LEFT';

    if (!isLeft) {
      const now = new Date();
      await prisma.participant.update({
        where: {
          userId_chatRoomId: {
            userId: currentUserId,
            chatRoomId: roomId
          }
        },
        data: {
          lastRead: now
        }
      });
    }

    const messages = await prisma.message.findMany({
      where: { 
        chatRoomId: roomId,
        createdAt: isLeft ? { lte: participation.joinedAt } : undefined
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            chatLastActive: true,
            profile: {
              select: {
                fullName: true,
                jobTitle: true,
                pictureUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const mappedMessages = messages.map(msg => ({
      ...msg,
      sender: mapUserChatOnline(msg.sender)
    }));

    res.status(200).json(mappedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { roomId } = req.params;
    const { content, fileName, fileContent, isSystem } = req.body;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if ((!content || content.trim() === '') && !fileContent) {
      res.status(400).json({ error: 'Message content or file attachment is required' });
      return;
    }

    const participation = await prisma.participant.findUnique({
      where: {
        userId_chatRoomId: {
          userId: currentUserId,
          chatRoomId: roomId
        }
      }
    });

    if (!participation || participation.role === 'LEFT') {
      res.status(403).json({ error: 'You are no longer an active participant in this room' });
      return;
    }

    const now = new Date();

    const message = await prisma.message.create({
      data: {
        chatRoomId: roomId,
        senderId: currentUserId,
        content: content ? content.trim() : '',
        fileName: fileName || null,
        fileContent: fileContent || null,
        isSystem: isSystem === true ? true : false
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            chatLastActive: true,
            profile: {
              select: {
                fullName: true,
                jobTitle: true,
                pictureUrl: true
              }
            }
          }
        }
      }
    });

    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: now }
    });

    await prisma.participant.update({
      where: {
        userId_chatRoomId: {
          userId: currentUserId,
          chatRoomId: roomId
        }
      },
      data: { lastRead: now }
    });

    const mappedMessage = {
      ...message,
      sender: mapUserChatOnline(message.sender)
    };

    res.status(201).json(mappedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending message' });
  }
};

export const updateRoomDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { roomId } = req.params;
    const { name, groupPicture, description } = req.body;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId }
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const isSystemAdmin = user.role.toLowerCase() === 'admin';

    let isGroupAdmin = false;
    if (isSystemAdmin) {
      isGroupAdmin = true;
    } else {
      const participation = await prisma.participant.findUnique({
        where: {
          userId_chatRoomId: {
            userId: currentUserId,
            chatRoomId: roomId
          }
        }
      });
      if (participation && participation.role === 'ADMIN') {
        isGroupAdmin = true;
      }
    }

    if (!isGroupAdmin) {
      res.status(403).json({ error: 'Forbidden: Group Admins only can modify group details' });
      return;
    }

    const updatedRoom = await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        groupPicture: groupPicture !== undefined ? groupPicture : undefined,
        description: description !== undefined ? description.trim() : undefined
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                chatLastActive: true,
                profile: {
                  select: {
                    fullName: true,
                    jobTitle: true,
                    pictureUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const sender = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: { select: { fullName: true } } }
    });
    const senderName = sender?.profile?.fullName || sender?.email || 'Admin';
    
    await prisma.message.create({
      data: {
        chatRoomId: roomId,
        senderId: currentUserId,
        content: `${senderName} updated the group profile details.`,
        isSystem: true
      }
    });

    res.status(200).json(mapRoomChatOnline(updatedRoom));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating group details' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { messageId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (message.senderId !== currentUserId) {
      res.status(403).json({ error: 'You can only delete your own messages' });
      return;
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    res.status(200).json({ success: true, messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting message' });
  }
};

export const pinMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { roomId } = req.params;
    const { messageId, pin } = req.body; // pin: true to pin, false to unpin

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Parse existing pinned IDs
    let pinnedIds: string[] = [];
    try {
      pinnedIds = room.pinnedMessageIds ? JSON.parse(room.pinnedMessageIds) : [];
    } catch { pinnedIds = []; }

    if (pin) {
      pinnedIds = [messageId];
    } else {
      pinnedIds = pinnedIds.filter((id: string) => id !== messageId);
    }

    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { pinnedMessageIds: JSON.stringify(pinnedIds) }
    });

    res.status(200).json({ pinnedMessageIds: pinnedIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error pinning message' });
  }
};

export const exitRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { roomId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: true
      }
    });

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const participation = room.participants.find(p => p.userId === currentUserId);
    if (!participation || participation.role === 'LEFT') {
      res.status(400).json({ error: 'You are not an active participant in this room' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: true }
    });

    const userName = user?.profile?.fullName || user?.email || 'Someone';

    // Update role to LEFT and joinedAt to the exit time
    await prisma.participant.update({
      where: { id: participation.id },
      data: {
        role: 'LEFT',
        joinedAt: new Date()
      }
    });

    // Create system message
    await prisma.message.create({
      data: {
        chatRoomId: roomId,
        senderId: currentUserId,
        content: `${userName} left the group`,
        isSystem: true
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error exiting group' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { roomId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find and delete the participant record for the current user
    const participation = await prisma.participant.findUnique({
      where: {
        userId_chatRoomId: {
          userId: currentUserId,
          chatRoomId: roomId
        }
      }
    });

    if (!participation) {
      res.status(404).json({ error: 'Participant not found in this room' });
      return;
    }

    await prisma.participant.delete({
      where: { id: participation.id }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting group conversation' });
  }
};

export const addParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;
    const { roomId } = req.params;
    const { targetUserId } = req.body;

    if (!currentUserId || !targetUserId) {
      res.status(400).json({ error: 'Missing target user ID' });
      return;
    }

    // Verify current user is a group admin or system admin
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const isSystemAdmin = user.role.toLowerCase() === 'admin';
    let isGroupAdmin = false;

    if (isSystemAdmin) {
      isGroupAdmin = true;
    } else {
      const participation = await prisma.participant.findUnique({
        where: {
          userId_chatRoomId: {
            userId: currentUserId,
            chatRoomId: roomId
          }
        }
      });
      if (participation && participation.role === 'ADMIN') {
        isGroupAdmin = true;
      }
    }

    if (!isGroupAdmin) {
      res.status(403).json({ error: 'Only group admins can add members' });
      return;
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true }
    });

    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    const adminName = user.profile?.fullName || user.email || 'Admin';
    const targetName = targetUser.profile?.fullName || targetUser.email || 'User';

    // Upsert participant record
    const existingParticipation = await prisma.participant.findUnique({
      where: {
        userId_chatRoomId: {
          userId: targetUserId,
          chatRoomId: roomId
        }
      }
    });

    if (existingParticipation) {
      if (existingParticipation.role !== 'LEFT') {
        res.status(400).json({ error: 'User is already a participant in this room' });
        return;
      }
      // Reactivate user
      await prisma.participant.update({
        where: { id: existingParticipation.id },
        data: {
          role: 'MEMBER',
          joinedAt: new Date()
        }
      });
    } else {
      await prisma.participant.create({
        data: {
          userId: targetUserId,
          chatRoomId: roomId,
          role: 'MEMBER',
          joinedAt: new Date()
        }
      });
    }

    // Create system message
    await prisma.message.create({
      data: {
        chatRoomId: roomId,
        senderId: currentUserId,
        content: `${adminName} added ${targetName}`,
        isSystem: true
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding participant' });
  }
};
