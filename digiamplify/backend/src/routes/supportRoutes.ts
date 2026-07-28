import { Router } from 'express';
import { createTicket, getTickets, respondToTicket } from '../controllers/supportController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken as any, createTicket as any);
router.get('/', authenticateToken as any, getTickets as any);
router.post('/respond/:ticketId', authenticateToken as any, respondToTicket as any);

export default router;
