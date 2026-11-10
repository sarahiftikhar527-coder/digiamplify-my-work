
import { useCallback, useEffect, useState } from 'react';

import ProfileHeader from '../../components/ProfileHeader';
import ProfileTabs from '../../components/ProfileTabs';
import PersonalDetailsForm from '../../components/PersonalDetailsForm';
import ContactForm from '../../components/ContactForm';
import AddressEducationForm from '../../components/AddressEducationForm';
import DocumentsTab from '../../components/DocumentsTab';
import JobDetailsTab from '../../components/JobDetailsTab';
import PaymentDetailsTab from '../../components/PaymentDetailsTab';
import RequestEditModal from '../../components/RequestEditModal';

import {
  getMyProfile,
  getMyChangeRequest,
  updateMyProfile,
  uploadMyAvatar,
} from '@/services/api/profileService';

import './profile.css';

const INITIAL_PROFILE = {
  avatarUrl: '',
  fullName: '',
  userName: '',
  dob: '',
  gender: '',
  nationality: '',
  language: '',
  email: '',
  workEmail: '',
  phone: '',
  emergencyNumber: '',
  currentAddress: '',
  permanentAddress: '',
  country: '',
  city: '',
  education: '',
  bankName: '',
  annualSalary: 0,
  accountHolder: '',
  salaryType: 'Monthly',
  accountNumber: '',
  salary: 0,
  currency: 'Rupees',
  deductionPerAbsence: 0,
  bonus: 0,
  salaryPaymentDate: '',
  jobTitle: '',
  department: '',
  team: '',
  manager: '',
  jobLevel: 'Junior',
  probationPeriod: '',
  dateOfJoining: '',
  confirmationDate: '',
  annualLeave: 0,
  jobType: 'Full Time',
  workType: 'Remote',
  shift: 'Day Shift',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  weeklyOff: 'Sunday',
  noticePeriod: '',
  documents: [],
};

const REQUEST_FIELDS = [
  'avatarUrl',
  'fullName',
  'userName',
  'dob',
  'gender',
  'nationality',
  'language',
  'workEmail',
  'phone',
  'emergencyNumber',
  'currentAddress',
  'permanentAddress',
  'country',
  'city',
  'education',
  'documents',
];

const DISMISS_KEY = 'profile-request-dismissed';

const getResponseBody = (response) =>
  response?.data ?? response ?? null;

const getProfileData = (response) => {
  const body = getResponseBody(response);

  return (
    body?.profile ??
    body?.data?.profile ??
    body?.data ??
    body
  );
};

const getRequest = (response) => {
  const body = getResponseBody(response);

  if (!body) return null;

  return (
    body?.request ??
    body?.data?.request ??
    body?.data ??
    null
  );
};

const normalizeDocument = (doc, index) => {
  const url =
    doc?.url ||
    doc?.secure_url ||
    doc?.fileUrl ||
    doc?.documentUrl ||
    doc?.file?.url ||
    doc?.file?.path ||
    '';

  const fileName =
    doc?.fileName ||
    doc?.originalName ||
    doc?.filename ||
    doc?.file?.originalName ||
    doc?.file?.filename ||
    doc?.name ||
    '';

  return {
    ...doc,
    id: doc?.id || doc?._id || `document-${index}`,
    label:
      doc?.label ||
      doc?.title ||
      doc?.name ||
      `Document ${index + 1}`,
    kind: doc?.kind || 'file',
    fileName,
    url,
    backFileName: doc?.backFileName || '',
    backUrl: doc?.backUrl || '',
    uploadedOn:
      doc?.uploadedOn ||
      doc?.uploadedAt ||
      doc?.createdAt ||
      '',
    status: doc?.status || (url ? 'pending' : 'missing'),
  };
};

const normalizeProfile = (response) => {
  const data = getProfileData(response);

  if (!data || typeof data !== 'object') {
    return { ...INITIAL_PROFILE };
  }

  return {
    ...INITIAL_PROFILE,
    ...data,
    avatarUrl:
      data.avatarUrl ||
      data.user?.avatarUrl ||
      '',
    fullName:
      data.fullName ||
      data.user?.name ||
      '',
    email:
      data.email ||
      data.user?.email ||
      '',
    workingDays: Array.isArray(data.workingDays)
      ? data.workingDays
      : INITIAL_PROFILE.workingDays,
    documents: Array.isArray(data.documents)
      ? data.documents.map(normalizeDocument)
      : [],
  };
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Unable to load your profile. Please try again.';

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) || '';
  } catch {
    return '';
  }
};

const writeDismissed = (id) => {
  try {
    sessionStorage.setItem(DISMISS_KEY, id);
  } catch {
    return;
  }
};

const buildPayload = (draft) => {
  const payload = {};

  REQUEST_FIELDS.forEach((field) => {
    if (field === 'documents') {
      payload.documents = (draft.documents || []).map(
        ({ previewUrl, isNew, ...doc }) => doc
      );

      return;
    }

    payload[field] = draft[field] ?? '';
  });

  return payload;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draft, setDraft] = useState(INITIAL_PROFILE);

  const [request, setRequest] = useState(null);
  const [dismissedId, setDismissedId] = useState(readDismissed());

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [pageError, setPageError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [success, setSuccess] = useState('');

  const isPending = request?.status === 'pending';

  const pendingAvatarUrl =
    isPending && typeof request?.changes?.avatarUrl === 'string'
      ? request.changes.avatarUrl
      : '';

  const displayedAvatarUrl =
    pendingAvatarUrl ||
    profile.avatarUrl ||
    '';

  /* ================================
     LOAD CHANGE REQUEST
  ================================= */

  const loadRequest = useCallback(async () => {
    try {
      const response = await getMyChangeRequest();
      const data = getRequest(response);

      setRequest(data);
      return data;
    } catch {
      setRequest(null);
      return null;
    }
  }, []);

  /* ================================
     LOAD PROFILE
  ================================= */

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setPageError('');

    try {
      const [profileResponse, requestResponse] =
        await Promise.all([
          getMyProfile(),
          getMyChangeRequest().catch(() => null),
        ]);

      const profileData = normalizeProfile(profileResponse);
      const requestData = getRequest(requestResponse);

      setProfile(profileData);
      setDraft(profileData);
      setRequest(requestData);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ================================
     UPLOAD PROFILE AVATAR
  ================================= */

  const handleAvatarSelect = useCallback(
    async (file) => {
      if (!file || avatarUploading || saving) return;

      if (request?.status === 'pending') {
        setAvatarError(
          'Your previous profile request is still awaiting admin approval.'
        );
        return;
      }

      setAvatarError('');
      setPageError('');
      setSuccess('');

      if (!file.type?.startsWith('image/')) {
        setAvatarError('Please select a valid image file.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setAvatarError('Image size must not exceed 2 MB.');
        return;
      }

      setAvatarUploading(true);

      try {
        const uploadResponse = await uploadMyAvatar(file);
        const uploadBody = getResponseBody(uploadResponse);

        const uploadedUrl =
          uploadBody?.url ||
          uploadBody?.avatarUrl ||
          uploadBody?.data?.url ||
          uploadBody?.data?.avatarUrl ||
          '';

        if (!uploadedUrl) {
          throw new Error(
            'Image uploaded, but the server did not return its URL.'
          );
        }

        const saveResponse = await updateMyProfile({
          avatarUrl: uploadedUrl,
        });

        const saveBody = getResponseBody(saveResponse);

        if (saveBody?.pendingApproval) {
          const savedRequest = getRequest(saveResponse);

          setRequest(savedRequest);

          if (!savedRequest?.changes?.avatarUrl) {
            await loadRequest();
          }

          setSuccess(
            saveBody?.message ||
              'Your profile photo has been submitted for admin approval.'
          );
        } else {
          const refreshedResponse = await getMyProfile();
          const refreshedProfile = normalizeProfile(refreshedResponse);

          setProfile(refreshedProfile);
          setDraft(refreshedProfile);

          await loadRequest();

          setSuccess(
            saveBody?.message ||
              'Your profile photo has been saved successfully.'
          );
        }
      } catch (error) {
        setAvatarError(
          error?.response?.data?.message ||
            error?.message ||
            'Unable to upload your profile photo. Please try again.'
        );
      } finally {
        setAvatarUploading(false);
      }
    },
    [avatarUploading, saving, request?.status, loadRequest]
  );

  /* ================================
     PROFILE FORM CHANGES
  ================================= */

  const handleChange = (field, value) => {
    if (!isEditing || saving) return;

    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess('');
  };

  /* ================================
     OPEN EDIT MODAL
  ================================= */

  const handleRequestEdit = () => {
    if (isPending || saving || avatarUploading) return;

    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    if (isPending || saving) return;

    setDraft({ ...profile });
    setIsEditing(true);
    setShowEditModal(false);

    setPageError('');
    setAvatarError('');
    setSuccess('');
  };

  /* ================================
     CANCEL EDITING
  ================================= */

  const handleCancelEdit = () => {
    if (saving) return;

    setDraft({ ...profile });
    setIsEditing(false);

    setPageError('');
    setAvatarError('');
  };

  /* ================================
     SAVE PROFILE CHANGES
  ================================= */

  const handleSave = async () => {
    if (!isEditing || saving || isPending) return;

    setSaving(true);
    setPageError('');
    setSuccess('');

    try {
      const response = await updateMyProfile(
        buildPayload(draft)
      );

      const body = getResponseBody(response);

      if (body?.pendingApproval) {
        const savedRequest = getRequest(response);

        setRequest(savedRequest);

        if (!savedRequest) {
          await loadRequest();
        }

        setSuccess(
          body?.message ||
            'Your changes were sent to the admin for approval.'
        );
      } else {
        const refreshedResponse = await getMyProfile();
        const refreshedProfile = normalizeProfile(refreshedResponse);

        setProfile(refreshedProfile);
        setDraft(refreshedProfile);

        await loadRequest();

        setSuccess(
          body?.message ||
            'Your profile was saved successfully.'
        );
      }

      setIsEditing(false);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     DISMISS APPROVAL DECISION
  ================================= */

  const dismissDecision = () => {
    if (!request?.id) return;

    writeDismissed(request.id);
    setDismissedId(request.id);
  };

  const showDecision =
    request &&
    !isPending &&
    request.id !== dismissedId &&
    (
      request.status === 'approved' ||
      request.status === 'rejected'
    );

  /* ================================
     FORM PROPS
  ================================= */

  const shared = {
    values: draft,
    onChange: handleChange,
    editable: isEditing && !saving,
  };

  const readOnly = {
    values: profile,
    onChange: () => {},
    editable: false,
  };

  /* ================================
     LOADING STATE
  ================================= */

  if (loading) {
    return (
      <main className="pf-page">
        <div className="pf-directory-state" role="status">
          Loading your profile...
        </div>
      </main>
    );
  }

  /* ================================
     MAIN PROFILE PAGE
  ================================= */

  return (
    <main className="pf-page">

      {pageError && (
        <div className="pf-alert pf-alert--error" role="alert">
          <span>{pageError}</span>

          <button
            type="button"
            onClick={() => setPageError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {avatarError && (
        <div className="pf-alert pf-alert--error" role="alert">
          <span>{avatarError}</span>

          <button
            type="button"
            onClick={() => setAvatarError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="pf-alert pf-alert--success" role="status">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {isPending && (
        <div className="pf-alert pf-alert--warning" role="status">
          <span>
            Your profile changes are waiting for admin approval.
            They will appear here once approved. You can edit again
            after the admin reviews this request.
          </span>
        </div>
      )}

      {showDecision && request.status === 'approved' && (
        <div className="pf-alert pf-alert--success" role="status">
          <span>
            Your last profile changes were approved and saved.
            {request.reviewNote
              ? ` Note: ${request.reviewNote}`
              : ''}
          </span>

          <button
            type="button"
            onClick={dismissDecision}
          >
            Dismiss
          </button>
        </div>
      )}

      {showDecision && request.status === 'rejected' && (
        <div className="pf-alert pf-alert--error" role="status">
          <span>
            Your last profile changes were rejected. Nothing was changed.
            {request.reviewNote
              ? ` Reason: ${request.reviewNote}`
              : ''}
          </span>

          <button
            type="button"
            onClick={dismissDecision}
          >
            Dismiss
          </button>
        </div>
      )}

      <ProfileHeader
        profile={profile}
        avatarUrl={displayedAvatarUrl}
        avatarError=""
        onAvatarSelect={handleAvatarSelect}
        canEdit={!isPending && !avatarUploading}
        isEditing={isEditing}
        editBlockedLabel={
          isPending ? 'Awaiting Approval' : ''
        }
        onRequestEdit={handleRequestEdit}
        onCancel={handleCancelEdit}
        onSave={handleSave}
        saving={saving || avatarUploading}
      />

      {avatarUploading && (
        <div className="pf-alert pf-alert--warning" role="status">
          Uploading your profile photo...
        </div>
      )}

      <ProfileTabs
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'personal' && (
        <div className="pf-layout">

          <div className="pf-card">
            <PersonalDetailsForm {...shared} />

            <hr className="pf-divider" />

            <ContactForm {...shared} />
          </div>

          <div className="pf-card">
            <AddressEducationForm {...shared} />
          </div>

        </div>
      )}

      {activeTab === 'documents' && (
        <DocumentsTab {...shared} />
      )}

      {activeTab === 'job' && (
        <JobDetailsTab {...readOnly} />
      )}

      {activeTab === 'payment' && (
        <PaymentDetailsTab {...readOnly} />
      )}

      <RequestEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleConfirmEdit}
      />

    </main>
  );
}
