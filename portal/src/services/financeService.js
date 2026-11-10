import apiClient, { unwrap } from '@/services/api/apiClient';

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== '' && v !== undefined && v !== null && v !== 'All'
    )
  );

export const getFinanceDashboard = ({ signal, ...params } = {}) =>
  unwrap(apiClient.get('/finance/dashboard', { params, signal }));

export const getPayrollRecords = ({ signal, ...params } = {}) =>
  unwrap(apiClient.get('/finance/payroll', { params, signal }));

export const getMyFinanceDashboard = ({ signal, ...params } = {}) =>
  unwrap(apiClient.get('/finance/me/dashboard', { params, signal }));

export const getMyPayrollRecords = ({ signal, ...params } = {}) =>
  unwrap(apiClient.get('/finance/me/payroll', { params, signal }));

export const getProfileEmployees = ({ signal } = {}) =>
  unwrap(apiClient.get('/profile/employees', { signal }));

export const createPayrollRecord = (payload) =>
  unwrap(apiClient.post('/finance/payroll', payload));

export const updatePayrollRecord = (id, payload) =>
  unwrap(apiClient.patch(`/finance/payroll/${id}`, payload));

export const deletePayrollRecord = (id) =>
  unwrap(apiClient.delete(`/finance/payroll/${id}`));

/* ---------- Receipts ---------- */
export const getReceipts = ({ signal, ...params } = {}) =>
  unwrap(apiClient.get('/receipts', { params: clean(params), signal }));

export const getMyReceipts = ({ signal, ...params } = {}) =>
  unwrap(apiClient.get('/receipts/me', { params: clean(params), signal }));

export const getReceipt = (id) => unwrap(apiClient.get(`/receipts/${id}`));

export const createReceipt = (payload) =>
  unwrap(apiClient.post('/receipts', payload));

export const updateReceipt = (id, payload) =>
  unwrap(apiClient.patch(`/receipts/${id}`, payload));

export const markReceiptPaid = (id) =>
  unwrap(apiClient.post(`/receipts/${id}/mark-paid`));

export const deleteReceipt = (id) =>
  unwrap(apiClient.delete(`/receipts/${id}`));