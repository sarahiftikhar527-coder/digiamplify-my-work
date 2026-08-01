import { Router } from 'express';
import { getProfile, upsertProfile, getAllProfiles, getProfileByUserId, upsertProfileByUserId, approveUserRequest, rejectUserRequest, requestEditPermission, approveEditPermission, verifyDocument } from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();


router.get('/', authenticateToken as any, getProfile);
router.post('/', authenticateToken as any, upsertProfile);
router.post('/request-edit', authenticateToken as any, requestEditPermission);


router.get('/all', authenticateToken as any, getAllProfiles);
router.get('/:userId', authenticateToken as any, getProfileByUserId);
router.post('/:userId', authenticateToken as any, upsertProfileByUserId);
router.post('/approve/:userId', authenticateToken as any, approveUserRequest);
router.post('/reject/:userId', authenticateToken as any, rejectUserRequest);
router.post('/approve-edit/:userId', authenticateToken as any, approveEditPermission);
router.post('/verify-doc/:userId', authenticateToken as any, verifyDocument);

export default router;
