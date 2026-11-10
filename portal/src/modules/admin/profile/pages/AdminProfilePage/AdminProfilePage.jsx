import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Mail,
  Search,
  Users,
  UserRound,
} from 'lucide-react';
import ProfileHeader from '../../components/ProfileHeader';
import ProfileTabs from '../../components/ProfileTabs';
import PersonalDetailsForm from '../../components/PersonalDetailsForm';
import ContactForm from '../../components/ContactForm';
import AddressEducationForm from '../../components/AddressEducationForm';
import DocumentsTab from '../../components/DocumentsTab';
import JobDetailsTab from '../../components/JobDetailsTab';
import PaymentDetailsTab from '../../components/PaymentDetailsTab';
import EditProfileModal from '../../components/EditProfileModal';
import {
  getEmployees,
  getEmployeeProfile,
  updateEmployeeProfile,
  uploadEmployeeAvatar,
} from '@/services/api/profileService';
import './profile.css';

const INITIAL_PROFILE = {
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
  annualSalary: '',
  accountHolder: '',
  salaryType: '',
  accountNumber: '',
  salary: '',
  currency: '',
  deductionPerAbsence: '',
  bonus: '',
  salaryPaymentDate: '',
  jobTitle: '',
  department: '',
  team: '',
  manager: '',
  jobLevel: '',
  probationPeriod: '',
  dateOfJoining: '',
  confirmationDate: '',
  annualLeave: '',
  jobType: '',
  workType: '',
  shift: '',
  workingDays: '',
  weeklyOff: '',
  noticePeriod: '',
  avatarUrl: '',
  documents: [],
};

function normalizeDocuments(documents) {
  if (Array.isArray(documents)) {
    return documents.map((doc, index) => ({
      ...doc,
      id: doc?.id || doc?._id || `document-${index}`,
      name:
        doc?.name ||
        doc?.fileName ||
        doc?.originalName ||
        doc?.label ||
        `Document ${index + 1}`,
      // viewUrl comes from the server and always points to the current
      // file address, so it is preferred for opening a document.
      url:
        doc?.viewUrl ||
        doc?.url ||
        doc?.secure_url ||
        doc?.dataUrl ||
        doc?.fileUrl ||
        '',
      type: doc?.type || doc?.mimeType || '',
      size: Number(doc?.size || 0),
      uploadedAt:
        doc?.uploadedAt ||
        doc?.uploadedOn ||
        doc?.date ||
        doc?.createdAt ||
        '',
      status: doc?.status || 'pending',
    }));
  }

  if (documents && typeof documents === 'object') {
    return Object.entries(documents).map(([key, value], index) => {
      const doc =
        value && typeof value === 'object' ? value : { url: value };

      return {
        ...doc,
        id: doc.id || doc._id || key || `document-${index}`,
        name:
          doc.name ||
          doc.fileName ||
          doc.originalName ||
          doc.label ||
          key ||
          `Document ${index + 1}`,
        url:
          doc.viewUrl ||
          doc.url ||
          doc.secure_url ||
          doc.dataUrl ||
          doc.fileUrl ||
          '',
        type: doc.type || doc.mimeType || '',
        size: Number(doc.size || 0),
        uploadedAt:
          doc.uploadedAt ||
          doc.uploadedOn ||
          doc.date ||
          doc.createdAt ||
          '',
        status: doc.status || 'pending',
      };
    });
  }

  return [];
}

function normalizeProfile(response) {
  const data =
    response?.data?.profile ??
    response?.profile ??
    response?.data?.data ??
    response?.data ??
    response;

  return {
    ...INITIAL_PROFILE,
    ...(data && typeof data === 'object' ? data : {}),
    documents: normalizeDocuments(data?.documents),
  };
}

function normalizeEmployees(response) {
  const data =
    response?.data?.employees ??
    response?.employees ??
    response?.data?.data ??
    response?.data ??
    response;

  return Array.isArray(data) ? data : [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

function employeeId(employee) {
  return employee?._id || employee?.id || employee?.userId || '';
}

function employeeName(employee) {
  return (
    employee?.name ||
    employee?.fullName ||
    employee?.email ||
    'Unnamed employee'
  );
}

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'E'
  );
}

export default function AdminProfilePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [saved, setSaved] = useState(INITIAL_PROFILE);
  const [draft, setDraft] = useState(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState('personal');

  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setError('');

    try {
      const response = await getEmployees();
      setEmployees(normalizeEmployees(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const loadSelectedProfile = useCallback(async (id) => {
    if (!id) return;

    setLoadingProfile(true);
    setError('');
    setSuccess('');
    setIsEditing(false);
    setShowEditModal(false);
    setAvatarFile(null);
    setAvatarPreview('');
    setSaved(INITIAL_PROFILE);
    setDraft(INITIAL_PROFILE);

    try {
      const response = await getEmployeeProfile(id);
      const profile = normalizeProfile(response);

      setSaved(profile);
      setDraft(profile);
      setAvatarPreview(profile.avatarUrl || '');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleEmployeeSelect = (id) => {
    if (!id || saving) return;

    setSelectedEmployeeId(id);
    setActiveTab('personal');
    setIsEditing(false);
    setShowEditModal(false);
    setError('');
    setSuccess('');

    loadSelectedProfile(id);
  };

  const handleBackToEmployees = () => {
    if (saving) return;

    setSelectedEmployeeId('');
    setActiveTab('personal');
    setIsEditing(false);
    setShowEditModal(false);
    setAvatarFile(null);
    setAvatarPreview('');
    setDraft(INITIAL_PROFILE);
    setSaved(INITIAL_PROFILE);
    setError('');
    setSuccess('');
  };

  const handleChange = (field, value) => {
    if (!isEditing || saving) return;

    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess('');
  };

  const handleAvatarSelect = (file) => {
    if (!file || !isEditing || saving) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('The profile image must be 5 MB or smaller.');
      return;
    }

    setError('');
    setSuccess('');
    setAvatarFile(file);

    const preview = URL.createObjectURL(file);

    setAvatarPreview((previous) => {
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }

      return preview;
    });
  };

  const handleStartEdit = () => {
    if (!selectedEmployeeId || loadingProfile || saving) return;

    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedEmployeeId || loadingProfile || saving) return;

    setDraft({ ...saved });
    setAvatarFile(null);
    setAvatarPreview(saved.avatarUrl || '');
    setIsEditing(true);
    setShowEditModal(false);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    if (saving) return;

    setDraft({ ...saved });
    setAvatarFile(null);
    setAvatarPreview(saved.avatarUrl || '');
    setIsEditing(false);
    setShowEditModal(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!selectedEmployeeId || !isEditing || saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = { ...draft };

      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.user;

      // A new photo is uploaded first. The profile is then saved as plain
      // JSON with the link of the uploaded photo (never as a multipart form).
      if (avatarFile) {
        const uploaded = await uploadEmployeeAvatar(
          selectedEmployeeId,
          avatarFile
        );

        const url = uploaded?.data?.url || uploaded?.url || '';

        if (!url) {
          throw new Error('Photo upload failed. Please try again.');
        }

        payload.avatarUrl = url;
      }

      await updateEmployeeProfile(selectedEmployeeId, payload);

      const response = await getEmployeeProfile(selectedEmployeeId);
      const updated = normalizeProfile(response);

      setSaved(updated);
      setDraft(updated);
      setAvatarPreview(updated.avatarUrl || '');
      setAvatarFile(null);
      setIsEditing(false);
      setShowEditModal(false);

      setSuccess('Employee profile saved successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      employeeName(employee),
      employee.email,
      employee.role,
    ].some((value) =>
      String(value || '').toLowerCase().includes(query)
    );
  });

  const sharedFormProps = {
    values: draft,
    onChange: handleChange,
    editable: isEditing && !saving,
  };

  const tabContent = {
    personal: (
      <div className="pf-form-grid">
        <PersonalDetailsForm {...sharedFormProps} />
        <ContactForm {...sharedFormProps} />
        <AddressEducationForm {...sharedFormProps} />
      </div>
    ),
    documents: (
      <DocumentsTab
        {...sharedFormProps}
        employeeId={selectedEmployeeId}
      />
    ),
    job: <JobDetailsTab {...sharedFormProps} />,
    payment: <PaymentDetailsTab {...sharedFormProps} />,
  };

  return (
    <main className="profile-page">
      {error && (
        <div className="pf-alert pf-alert--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {success && selectedEmployeeId && (
        <div className="pf-alert pf-alert--success" role="status">
          {success}
        </div>
      )}

      {!selectedEmployeeId ? (
        <section className="pf-select-screen">
          <div className="pf-select-hero">
            <div className="pf-select-hero__icon">
              <Users size={25} />
            </div>

            <span className="pf-select-eyebrow">
              PEOPLE MANAGEMENT
            </span>

            <h1>
              Select <span>Employee</span>
            </h1>

            <p>
              Choose a team member to access their profile,
              personal information and employment details.
            </p>

            <div className="pf-select-stats">
              <div className="pf-select-stat">
                <Users size={18} />
                <div>
                  <strong>{employees.length}</strong>
                  <span>Employees</span>
                </div>
              </div>

              <div className="pf-select-stat-divider" />

              <div className="pf-select-stat">
                <UserRound size={18} />
                <div>
                  <strong>Profiles</strong>
                  <span>Management</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pf-employee-panel">
            <div className="pf-employee-panel__top">
              <div>
                <span className="pf-select-eyebrow">YOUR TEAM</span>
                <h2>Employee Directory</h2>
                <p>
                  Choose an employee to view their existing profile.
                </p>
              </div>

              <button
                className="pf-refresh-button"
                type="button"
                onClick={loadEmployees}
                disabled={loadingEmployees}
              >
                {loadingEmployees ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="pf-employee-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search by name, email or role..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search employees"
              />
            </div>

            {loadingEmployees ? (
              <div className="pf-directory-state" role="status">
                <span className="pf-loading-spinner" />
                <p>Loading employee directory...</p>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="pf-employee-grid">
                {filteredEmployees.map((employee) => {
                  const id = employeeId(employee);
                  const name = employeeName(employee);

                  if (!id) return null;

                  return (
                    <button
                      type="button"
                      className="pf-employee-card"
                      key={id}
                      onClick={() => handleEmployeeSelect(id)}
                    >
                      <div className="pf-employee-card__top">
                        <div className="pf-employee-avatar">
                          {getInitials(name)}
                        </div>

                        <span className="pf-employee-card__arrow">
                          <ArrowRight size={17} />
                        </span>
                      </div>

                      <h3>{name}</h3>

                      <div className="pf-employee-card__meta">
                        <Mail size={15} />
                        <span>
                          {employee.email || 'No email available'}
                        </span>
                      </div>

                      <div className="pf-employee-card__footer">
                        <span className="pf-employee-role">
                          <BriefcaseBusiness size={14} />
                          {employee.role || 'Employee'}
                        </span>

                        <span className="pf-view-profile">
                          View profile
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="pf-directory-state">
                <div className="pf-empty-icon">
                  <Users size={24} />
                </div>
                <h3>No employees found</h3>
                <p>
                  {search
                    ? 'Try another name, email or role.'
                    : 'No employees are available in the directory.'}
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <button
            className="pf-back-to-employees"
            type="button"
            onClick={handleBackToEmployees}
            disabled={saving}
          >
            <ArrowLeft size={17} />
            Back to Employees
          </button>

          {loadingProfile ? (
            <div className="pf-directory-state" role="status">
              <span className="pf-loading-spinner" />
              <p>Loading employee profile...</p>
            </div>
          ) : (
            <>
              <ProfileHeader
                profile={draft}
                avatarUrl={avatarPreview || draft.avatarUrl}
                avatarError={error}
                onAvatarSelect={handleAvatarSelect}
                canEdit={true}
                isEditing={isEditing}
                onEdit={handleStartEdit}
                onRequestEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onSave={handleSave}
                saving={saving}
              />

              <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              <section
                className="pf-tab-panel"
                role="tabpanel"
                aria-label={`${activeTab} profile details`}
              >
                {tabContent[activeTab] || tabContent.personal}
              </section>
            </>
          )}
        </>
      )}

      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleConfirmEdit}
      />
    </main>
  );
}
