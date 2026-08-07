import { Router } from 'express';
import {
  getEmployeeFinanceData,
  getEmployeeFinanceDataForAdmin,
  addTransactionForAdmin,
  deleteTransactionForAdmin,
  getAdminFinanceOverview,
  updateEmployeeCardInfo,
  employeeWithdraw,
  employeeRequestTransaction,
  adminUpdateTransactionStatus
} from '../controllers/financeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/employee', authenticateToken as any, getEmployeeFinanceData as any);
router.post('/employee/card', authenticateToken as any, updateEmployeeCardInfo as any);
router.post('/employee/withdraw', authenticateToken as any, employeeWithdraw as any);
router.post('/employee/request', authenticateToken as any, employeeRequestTransaction as any);

router.get('/admin/overview', authenticateToken as any, getAdminFinanceOverview as any);
router.get('/admin/employee/:userId', authenticateToken as any, getEmployeeFinanceDataForAdmin as any);
router.post('/admin/transaction', authenticateToken as any, addTransactionForAdmin as any);
router.delete('/admin/transaction/:id', authenticateToken as any, deleteTransactionForAdmin as any);
router.patch('/admin/transaction/:id/status', authenticateToken as any, adminUpdateTransactionStatus as any);

export default router;

