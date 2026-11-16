import apiClient from './apiClient';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

// Fired after the profile / photo changes so the topbar and sidebar refresh.
export const PROFILE_CHANGED_EVENT = 'digiamplify:profile-changed';

function notifyProfileChanged() {
  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

function getApiErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function encodeId(id) {
  return encodeURIComponent(String(id));
}

function buildImageForm(file) {
  if (!file) {
    throw new Error('Please select a photo.');
  }

  if (!file.type?.startsWith('image/')) {
    throw new Error('Please select a valid image file.');
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('Image size must not exceed 2 MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  return formData;
}

export async function getMyProfile() {
  try {
    const response = await apiClient.get('/profile/me');
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to load your profile.')
    );
  }
}

export async function getEmployees() {
  try {
    const response = await apiClient.get('/profile/employees');
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to load employees.')
    );
  }
}

export async function getEmployeeProfile(userId) {
  if (!userId) {
    throw new Error('Please select an employee.');
  }

  try {
    const response = await apiClient.get(
      `/profile/employees/${encodeId(userId)}`
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to load employee profile.')
    );
  }
}

export async function updateMyProfile(profileData) {
  try {
    const response = await apiClient.patch(
      '/profile/me',
      profileData
    );

    notifyProfileChanged();

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to update your profile.')
    );
  }
}

export async function updateEmployeeProfile(userId, profileData) {
  if (!userId) {
    throw new Error('Please select an employee before saving.');
  }

  try {
    const response = await apiClient.patch(
      `/profile/employees/${encodeId(userId)}`,
      profileData
    );

    notifyProfileChanged();

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to update employee profile.')
    );
  }
}

export async function uploadMyAvatar(file) {
  const formData = buildImageForm(file);

  try {
    const response = await apiClient.post(
      '/profile/me/avatar',
      formData
    );

    notifyProfileChanged();

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to upload your profile photo.')
    );
  }
}

export async function uploadEmployeeAvatar(userId, file) {
  if (!userId) {
    throw new Error('Please select an employee before uploading a photo.');
  }

  const formData = buildImageForm(file);

  try {
    const response = await apiClient.post(
      `/profile/employees/${encodeId(userId)}/avatar`,
      formData
    );

    notifyProfileChanged();

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to upload employee profile photo.')
    );
  }
}

export async function getMyChangeRequest() {
  try {
    const response = await apiClient.get(
      '/profile/me/change-request'
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to load your change request.')
    );
  }
}

export async function getChangeRequests(status = 'pending') {
  try {
    const response = await apiClient.get(
      '/profile/change-requests',
      {
        params: { status },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to load profile change requests.')
    );
  }
}

export async function getChangeRequestCount() {
  try {
    const response = await apiClient.get(
      '/profile/change-requests/count'
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to load pending request count.')
    );
  }
}

export async function approveChangeRequest(requestId, note = '') {
  if (!requestId) {
    throw new Error('Change request ID is required.');
  }

  try {
    const response = await apiClient.patch(
      `/profile/change-requests/${encodeId(requestId)}/approve`,
      { note }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to approve change request.')
    );
  }
}

export async function rejectChangeRequest(requestId, note = '') {
  if (!requestId) {
    throw new Error('Change request ID is required.');
  }

  try {
    const response = await apiClient.patch(
      `/profile/change-requests/${encodeId(requestId)}/reject`,
      { note }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Unable to reject change request.')
    );
  }
}