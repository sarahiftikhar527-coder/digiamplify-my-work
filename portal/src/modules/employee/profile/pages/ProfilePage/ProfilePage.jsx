import { useCallback, useEffect, useState } from 'react';
import ProfileHeader from '../../components/ProfileHeader';
import ProfileTabs from '../../components/ProfileTabs';
import PersonalDetailsForm from '../../components/PersonalDetailsForm';
import ContactForm from '../../components/ContactForm';
import AddressEducationForm from '../../components/AddressEducationForm';
import DocumentsTab from '../../components/DocumentsTab';
import JobDetailsTab from '../../components/JobDetailsTab';
import PaymentDetailsTab from '../../components/PaymentDetailsTab';
import { getMyProfile } from '@/services/api/profileService';
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

const getProfileData = (response) =>
  response?.data?.profile ??
  response?.data?.data ??
  response?.profile ??
  response?.data ??
  response;

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
    fullName: data.fullName || data.user?.name || '',
    email: data.email || data.user?.email || '',
    workingDays: Array.isArray(data.workingDays)
      ? data.workingDays
      : INITIAL_PROFILE.workingDays,
    documents: Array.isArray(data.documents)
      ? data.documents.map((doc, index) =>
          normalizeDocument(doc, index)
        )
      : [],
  };
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Unable to load your profile. Please try again.';

export default function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setPageError('');

    try {
      const response = await getMyProfile();
      const data = normalizeProfile(response);
      setProfile(data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const shared = {
    values: profile,
    onChange: () => {},
    editable: false,
  };

  if (loading) {
    return (
      <main className="pf-page">
        <div className="pf-directory-state" role="status">
          Loading your profile...
        </div>
      </main>
    );
  }

  return (
    <main className="pf-page">
      {pageError && (
        <div className="pf-alert pf-alert--error" role="alert">
          <span>{pageError}</span>
          <button type="button" onClick={loadProfile}>
            Try again
          </button>
        </div>
      )}

      <ProfileHeader
        profile={profile}
        avatarUrl={profile.avatarUrl || ''}
        avatarError=""
        canEdit={false}
        isEditing={false}
      />

      <ProfileTabs
        activeTab={activeTab}
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
        <JobDetailsTab {...shared} />
      )}

      {activeTab === 'payment' && (
        <PaymentDetailsTab {...shared} />
      )}
    </main>
  );
}
