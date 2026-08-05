import { Router } from 'express';
import { 
  getUsers, 
  getRooms, 
  createRoom, 
  getRoomMessages, 
  sendMessage,
  getGroupRequests,
  approveGroupRequest,
  rejectGroupRequest,
  pingChat,
  updateRoomDetails,
  deleteMessage,
  pinMessage
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/ping', authenticateToken as any, pingChat as any);

router.get('/users', authenticateToken as any, getUsers as any);
router.get('/rooms', authenticateToken as any, getRooms as any);
router.post('/rooms', authenticateToken as any, createRoom as any);
router.put('/rooms/:roomId', authenticateToken as any, updateRoomDetails as any);
router.get('/rooms/:roomId/messages', authenticateToken as any, getRoomMessages as any);
router.post('/rooms/:roomId/messages', authenticateToken as any, sendMessage as any);
router.post('/rooms/:roomId/pin', authenticateToken as any, pinMessage as any);
router.delete('/messages/:messageId', authenticateToken as any, deleteMessage as any);

// Group chat approval endpoints
router.get('/group-requests', authenticateToken as any, getGroupRequests as any);
router.post('/group-requests/:requestId/approve', authenticateToken as any, approveGroupRequest as any);
router.post('/group-requests/:requestId/reject', authenticateToken as any, rejectGroupRequest as any);

export default router;
