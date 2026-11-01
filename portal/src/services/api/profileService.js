
import apiClient from './apiClient';

export async function getMyProfile() {
  const response = await apiClient.get('/profile/me');
  return response.data;
}

export async function getEmployees() {
  const response = await apiClient.get('/profile/employees');
  return response.data;
}

export async function getEmployeeProfile(userId) {
  if (!userId) {
    throw new Error('Please select an employee.');
  }

  const response = await apiClient.get(
    `/profile/employees/${encodeURIComponent(userId)}`
  );

  return response.data;
}

export async function updateMyProfile(profileData) {
  const response = await apiClient.patch('/profile/me', profileData);
  return response.data;
}

export async function updateEmployeeProfile(userId, profileData) {
  if (!userId) {
    throw new Error('Please select an employee before saving.');
  }

  const response = await apiClient.patch(
    `/profile/employees/${encodeURIComponent(userId)}`,
    profileData
  );

  return response.data;
}
