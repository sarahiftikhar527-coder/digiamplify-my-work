
import apiClient, { unwrap } from '@/services/api/apiClient';

export const getFinanceDashboard = ({ signal, ...params } = {}) =>
  unwrap(
    apiClient.get('/finance/dashboard', {
      params,
      signal,
    })
  );

export const getPayrollRecords = ({ signal, ...params } = {}) =>
  unwrap(
    apiClient.get('/finance/payroll', {
      params,
      signal,
    })
  );

export const getMyFinanceDashboard = ({ signal, ...params } = {}) =>
  unwrap(
    apiClient.get('/finance/me/dashboard', {
      params,
      signal,
    })
  );

export const getMyPayrollRecords = ({ signal, ...params } = {}) =>
  unwrap(
    apiClient.get('/finance/me/payroll', {
      params,
      signal,
    })
  );

export const getProfileEmployees = ({ signal } = {}) =>
  unwrap(
    apiClient.get('/profile/employees', {
      signal,
    })
  );

export const createPayrollRecord = (payload) =>
  unwrap(
    apiClient.post('/finance/payroll', payload)
  );

export const updatePayrollRecord = (id, payload) =>
  unwrap(
    apiClient.patch(`/finance/payroll/${id}`, payload)
  );

export const deletePayrollRecord = (id) =>
  unwrap(
    apiClient.delete(`/finance/payroll/${id}`)
  );
