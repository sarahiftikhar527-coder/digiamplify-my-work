'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import PersonalDetails from './components/PersonalTab';
import Documents from './components/DocumentsTab';
import JobDetails from './components/JobTab';
import PaymentDetails from './components/PaymentTab';
import AdminUsersDirectory from './components/AdminUsersDirectory';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Download,
  Edit3,
  FileText,
  ExternalLink,
  ChevronLeft,
  Calendar,
  CheckCircle,
  Clock,
  Briefcase,
  DollarSign,
  CreditCard,
  Coins,
  MoreVertical,
  ChevronDown,
  Camera,
  Check,
  MessageSquare
} from 'lucide-react';

const formatDocDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return { date: '—', time: '' };
  try {
    const d = new Date(dateStr);
    const standardMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = `${d.getDate()} ${standardMonths[d.getMonth()]}, ${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const time = `${hours}:${minutes} ${ampm}`;
    return { date, time };
  } catch {
    return { date: '13 July, 2026', time: '10:30 AM' };
  }
};

const formatLastLogin = (dateStr: any) => {
  if (!dateStr) return 'Never';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    if (isToday) {
      return `Today, ${timeStr}`;
    }
    const day = d.getDate();
    const standardMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = standardMonths[d.getMonth()];
    return `${day} ${month}, ${timeStr}`;
  } catch (e) {
    return 'Never';
  }
};

const getBase64Size = (base64Str: string | null | undefined): string => {
  if (!base64Str) return '';
  const base64Data = base64Str.split(',')[1] || base64Str;
  const bytes = Math.round((base64Data.length * 3) / 4);
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

const getFormattedUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function ProfilePage() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    fullName: '',
    userName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    language: '',
    email: '',
    workEmail: '',
    phone: '',
    emergencyPhone: '',
    currentAddress: '',
    permanentAddress: '',
    country: '',
    city: '',
    education: '',
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
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    currency: '',
    bonus: '',
    annualSalary: '',
    salaryType: '',
    salary: '',
    deductionPerAbsence: '',
    paymentDate: '',
    cnicFileName: '',
    cnicContent: '',
    cnicStatus: 'Verified',
    cvFileName: '',
    cvContent: '',
    cvStatus: 'Verified',
    contractFileName: '',
    contractContent: '',
    contractStatus: 'Verified',
    pictureUrl: '',
    pictureStatus: 'Pending',
    portfolioUrl: '',
    portfolioStatus: 'Verified',
  });
  const [activeTab, setActiveTab] = useState<'personal' | 'documents' | 'job' | 'payment'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/profile/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users list');
      }

      setUsersList(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (userId: string) => {
    setSelectedUserId(userId);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/admin/profile/${userId}`);
    }
    setIsLoading(true);
    setError('');
    setIsViewingProfile(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setProfile({ notFound: true, userId } as any);
        setFormData(null);
        setIsEditing(true);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user profile');
      }

      setProfile(data);
      setFormData(data);
      setIsEditing(true);
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    setSelectedUserId(userId);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/admin/profile/${userId}`);
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setProfile({ notFound: true, userId } as any);
        setFormData(null);
        setIsViewingProfile(true);
        setIsEditing(false);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user profile');
      }

      setProfile(data);
      setFormData(data);
      setIsViewingProfile(true);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedUserId(null);
    setIsEditing(false);
    setIsViewingProfile(false);
    setProfile(null);
    fetchAllUsers();
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin/profile');
    }
  };

  const handleApproveUser = async (userId: string) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/profile/approve/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve user');
      }

      setSuccess('User request approved successfully!');
      fetchAllUsers();
    } catch (err: any) {
      setError(err.message || 'Error approving user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/profile/reject/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject user');
      }

      setSuccess('User request rejected successfully!');
      fetchAllUsers();
    } catch (err: any) {
      setError(err.message || 'Error rejecting user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestEdit = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/profile/request-edit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request edit permission');
      }

      setSuccess('Edit request sent to admin successfully!');
      fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Error occurred requesting edit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEdit = async (userId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/profile/approve-edit/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve edit request');
      }

      setSuccess('Edit permission approved successfully!');
      fetchAllUsers();
    } catch (err: any) {
      setError(err.message || 'Error occurred approving edit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDocument = async (userId: string, docType: 'cnic' | 'cv' | 'contract' | 'picture' | 'portfolio') => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`http://localhost:5000/api/profile/verify-doc/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ docType })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify document');
      }

      setSuccess('Document verified successfully!');
      if (isAdmin && selectedUserId) {
        handleViewUser(selectedUserId);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred verifying document');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setProfile({ userId: '' } as any);
        setFormData({
          fullName: '',
          userName: '',
          dateOfBirth: '',
          gender: '',
          nationality: '',
          language: '',
          email: '',
          workEmail: '',
          phone: '',
          emergencyPhone: '',
          currentAddress: '',
          permanentAddress: '',
          country: '',
          city: '',
          education: '',
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
          bankName: '',
          accountHolderName: '',
          accountNumber: '',
          currency: '',
          bonus: '',
          annualSalary: '',
          salaryType: '',
          salary: '',
          deductionPerAbsence: '',
          paymentDate: '',
          cnicFileName: '',
          cnicContent: '',
          cnicStatus: 'Pending',
          cvFileName: '',
          cvContent: '',
          cvStatus: 'Pending',
          contractFileName: '',
          contractContent: '',
          contractStatus: 'Pending',
          pictureUrl: '',
          pictureStatus: 'Pending',
          portfolioUrl: '',
          portfolioStatus: 'Pending',
        });
        setIsEditing(true);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile details');
      }

      setProfile(data);
      setFormData(data);

      if (data.pictureUrl) localStorage.setItem('profilePicture', data.pictureUrl);
      if (data.jobTitle) localStorage.setItem('jobTitle', data.jobTitle);
      window.dispatchEvent(new Event('profileUpdate'));

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role?.toLowerCase() === 'admin') {
        setIsAdmin(true);
        let urlUserId = '';
        if (pathname) {
          const pathParts = pathname.split('/');
          const lastSegment = pathParts[pathParts.length - 1];
          if (lastSegment && lastSegment !== 'profile') {
            urlUserId = lastSegment;
          }
        }

        if (urlUserId) {
          if (selectedUserId !== urlUserId) {
            handleViewUser(urlUserId);
          }
        } else {
          if (selectedUserId !== null || !isViewingProfile) {
            setSelectedUserId(null);
            setIsEditing(false);
            setIsViewingProfile(false);
            setProfile(null);
            fetchAllUsers();
          }
        }
      } else {
        setIsAdmin(false);
        fetchProfile();
      }
    } else {
      window.location.href = '/login';
    }
  }, [pathname]);
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const renderDocStatus = (docType: 'cnic' | 'cv' | 'contract' | 'picture' | 'portfolio', statusValue: string | null | undefined, hasFile: boolean) => {
    if (!hasFile) return null;
    const isVerified = statusValue === 'Verified';

    return (
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${isVerified
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-[#ff4d5a] border border-red-500/20'
          }`}>
          {isVerified ? 'Verified' : 'Not Verified'}
        </span>
        {isAdmin && isViewingProfile && !isVerified && (
          <button
            type="button"
            onClick={() => handleVerifyDocument(profile.userId, docType)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1 px-2.5 rounded cursor-pointer transition-colors shadow-sm"
          >
            <Check className="w-3 h-3" />
            <span>Verify</span>
          </button>
        )}
      </div>
    );
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleFieldChange('pictureUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const url = isAdmin && selectedUserId
        ? `http://localhost:5000/api/profile/${selectedUserId}`
        : 'http://localhost:5000/api/profile';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setProfile(data);
      setFormData(data);

      // Sync with Sidebar (only if not admin)
      if (!isAdmin) {
        if (data.pictureUrl) localStorage.setItem('profilePicture', data.pictureUrl);
        if (data.jobTitle) localStorage.setItem('jobTitle', data.jobTitle);
        window.dispatchEvent(new Event('profileUpdate'));
      }

      if (activeTab === 'personal') {
        setSuccess('Personal details saved! Moving to Documents...');
        setTimeout(() => {
          setActiveTab('documents');
          setSuccess('');
        }, 1000);
      } else if (activeTab === 'documents') {
        setSuccess('Documents saved! Moving to Job Details...');
        setTimeout(() => {
          setActiveTab('job');
          setSuccess('');
        }, 1000);
      } else if (activeTab === 'job') {
        setSuccess('Job details saved! Moving to Payment Details...');
        setTimeout(() => {
          setActiveTab('payment');
          setSuccess('');
        }, 1000);
      } else {
        setSuccess('Profile completed successfully!');
        setTimeout(() => {
          setIsEditing(false);
          setSuccess('');
          if (isAdmin) {
            handleBack();
          }
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = (fileName: string, base64Content: string) => {
    if (!base64Content) {
      alert('No document file uploaded.');
      return;
    }
    const link = document.createElement('a');
    link.href = base64Content;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#050505] text-white">
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 p-6 pt-24 sm:p-10 md:pt-10 flex flex-col justify-start overflow-y-auto max-h-screen">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-neutral-500 font-light text-sm flex items-center gap-1.5">
            <span className="text-red-500 font-medium">Profile</span>
            <span>/</span>
            <span>{isAdmin ? 'Admin Portal' : 'Dashboard'}</span>
          </div>
        </div>

        {/* Global Loading / Errors / Success alerts */}
        {isLoading && !profile && !isAdmin && (
          <div className="text-center py-20 text-neutral-400 text-sm font-light">Loading profile details...</div>
        )}
        {isLoading && isAdmin && !selectedUserId && (
          <div className="text-center py-20 text-neutral-400 text-sm font-light">Loading users list...</div>
        )}
        {isLoading && isAdmin && selectedUserId && !profile && (
          <div className="text-center py-20 text-neutral-400 text-sm font-light">Loading user profile...</div>
        )}

        {error && (
          <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-3.5 px-4 rounded-[14px] mb-6 text-center font-light">
            {success}
          </div>
        )}
        {isAdmin && !selectedUserId && !isLoading && (
          <AdminUsersDirectory
            usersList={usersList}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleApproveUser={handleApproveUser}
            handleRejectUser={handleRejectUser}
            handleApproveEdit={handleApproveEdit}
            handleViewUser={handleViewUser}
            handleEditUser={handleEditUser}
          />
        )}
        {isEditing && !isLoading && profile && (profile as any).notFound && (
          <div className="max-w-xl mx-auto mt-12 animate-fadeIn">
            <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-[#be0919]/10 border border-[#be0919]/20 flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-[#be0919]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Profile Information Found</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed mb-8">
                This employee has not completed their profile setup yet. Once the user logs in and completes their initial profile details, you will be able to manage and edit their information here.
              </p>
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-8 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold hover:bg-white/5 transition-all cursor-pointer"
              >
                Back to Users List
              </button>
            </div>
          </div>
        )}

        {isEditing && !isLoading && (isAdmin ? !!selectedUserId : true) && (!profile || !(profile as any).notFound) && (
          <div className="space-y-8 animate-fadeIn">

            {/* Header section card */}
            <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl overflow-hidden relative shadow-[0_4px_30px_rgba(0,0,0,0.4)]">

              <div
                className="h-[200px] bg-cover bg-center flex items-center justify-center relative border-b border-neutral-900"
                style={{ backgroundImage: `url('/assets/portal/profile/bg-img.webp')` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>

              <div className="p-6 lg:p-8 pt-20 lg:pt-24 relative">
                <div className="absolute -top-20 left-6 lg:left-8 w-32 h-32 rounded-full border-[3px] border-neutral-900 bg-[#0c0c0c] shadow-xl shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                    {formData.pictureUrl ? (
                      <img src={formData.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-14 h-14 text-neutral-600" />
                    )}
                  </div>

                  <label className="absolute bottom-0 right-0 bg-[#be0919] hover:bg-[#990714] text-white p-2 rounded-full border border-neutral-900 shadow-md cursor-pointer transition-colors flex items-center justify-center focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500 z-10">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-left">
                  <h2 className="text-2xl font-medium text-white tracking-wide leading-tight">
                    {formData.fullName || 'New Employee Profile'}
                  </h2>
                  <p className="text-[14px] text-neutral-400 mt-1 font-normal">
                    {formData.jobTitle || 'Fill job details'}
                  </p>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-2 mt-4 text-[15px] text-white font-normal poppins">
                    <span className="flex items-center gap-2">
                      <Mail className="w-[18px] h-[18px] text-white shrink-0" />
                      <span>{formData.email || '—'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-[18px] h-[18px] text-white shrink-0" />
                      <span>{formData.phone || '—'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-[18px] h-[18px] text-white shrink-0" />
                      <span>{formData.city && formData.country ? `${formData.city}, ${formData.country}` : (formData.city || formData.country || '—')}</span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-900/80 my-5 -mx-6" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

                  <div className="flex items-center gap-8 text-center sm:text-left justify-center sm:justify-start">
                    <div>
                      <span className="block text-[12px] text-neutral-500 font-normal">Department</span>
                      <span className="text-[14px] font-normal text-white mt-0.5 block">
                        {formData.department || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[12px] text-neutral-500 font-normal">Manager</span>
                      <span className="text-[14px] font-normal text-white mt-0.5 block">
                        {formData.manager || '—'}
                      </span>
                    </div>
                  </div>

                  {profile && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-800 rounded-lg py-2 px-4 hover:bg-white/5 transition-all cursor-pointer focus:outline-none shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full rounded-md border-[1.5px] border-white/40 bg-black scrollbar-none">
              <div className="flex items-center justify-center gap-x-4 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 w-full min-w-[768px] md:min-w-0 h-[56px] px-4">

                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center justify-center gap-2 text-[13px] xl:text-[14px] font-semibold transition-colors cursor-pointer focus:outline-none whitespace-nowrap ${activeTab === 'personal' ? 'text-[#be0919]' : 'text-white hover:text-white/80'
                    }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Personal Details and Contact</span>
                </button>

                <div className="w-[1.5px] h-6 bg-white/40 shrink-0" />

                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`flex items-center justify-center gap-2 text-[13px] xl:text-[14px] font-semibold transition-colors cursor-pointer focus:outline-none whitespace-nowrap ${activeTab === 'documents' ? 'text-[#be0919]' : 'text-white hover:text-white/80'
                    }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Documents</span>
                </button>

                <div className="w-[1.5px] h-6 bg-white/40 shrink-0" />

                <button
                  type="button"
                  onClick={() => setActiveTab('job')}
                  className={`flex items-center justify-center gap-2 text-[13px] xl:text-[14px] font-semibold transition-colors cursor-pointer focus:outline-none whitespace-nowrap ${activeTab === 'job' ? 'text-[#be0919]' : 'text-white hover:text-white/80'
                    }`}
                >
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>Job Details</span>
                </button>

                <div className="w-[1.5px] h-6 bg-white/40 shrink-0" />

                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className={`flex items-center justify-center gap-2 text-[13px] xl:text-[14px] font-semibold transition-colors cursor-pointer focus:outline-none whitespace-nowrap ${activeTab === 'payment' ? 'text-[#be0919]' : 'text-white hover:text-white/80'
                    }`}
                >
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  <span>Payment Details</span>
                </button>

              </div>
            </div>

            <div className="transition-all duration-350 min-h-[300px]">
              {activeTab === 'personal' && (
                <PersonalDetails data={formData} onChange={handleFieldChange} />
              )}
              {activeTab === 'documents' && (
                <Documents data={formData} onChange={handleFieldChange} isAdmin={isAdmin} />
              )}
              {activeTab === 'job' && (
                <JobDetails data={formData} onChange={handleFieldChange} />
              )}
              {activeTab === 'payment' && (
                <PaymentDetails data={formData} onChange={handleFieldChange} />
              )}
            </div>

            <div className="flex items-center justify-end gap-4 border-t border-neutral-900 pt-6">
              {(profile || isAdmin) && (
                <button
                  type="button"
                  onClick={() => {
                    if (isAdmin) {
                      handleBack();
                    } else {
                      setFormData(profile);
                      setIsEditing(false);
                    }
                  }}
                  className="py-3 px-8 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold hover:bg-white/5 transition-all cursor-pointer"
                >
                  {isAdmin ? 'Back to List' : 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="py-3 px-10 rounded-lg bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold transition-all shadow-[0_4px_15px_rgba(190,9,25,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : (activeTab === 'payment' ? 'Save & Finish' : 'Save & Next')}
              </button>
            </div>

          </div>
        )}

        {!isEditing && profile && (
          <div className="space-y-8 animate-fadeIn max-w-[1200px]">

            {isAdmin && isViewingProfile ? (
              <>
                {/* Admin Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="p-2.5 bg-[#0a0a0a] hover:bg-neutral-900 border border-neutral-900 rounded-lg text-white transition-all cursor-pointer flex items-center justify-center"
                      title="Back to Directory"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-wide">Employee Profile</h2>
                      <p className="text-xs text-neutral-500 font-light mt-1">Complete overview and details about the employee.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewingProfile(false);
                      setIsEditing(true);
                    }}
                    className="bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2.5 px-8 rounded-lg transition-all shadow-[0_4px_12px_rgba(190,9,25,0.2)] hover:shadow-[0_4px_16px_rgba(190,9,25,0.35)] cursor-pointer focus:outline-none shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Flat Dark Summary Card with Vertical Divider */}
                <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-10 shadow-lg flex flex-col md:grid md:grid-cols-[1.1fr_1px_1fr] gap-x-12 items-center text-left">
                  {/* Left Side */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                    <div className="w-28 h-28 rounded-xl border border-neutral-900 bg-neutral-955 shadow-md shrink-0 overflow-hidden flex items-center justify-center">
                      {profile.pictureUrl ? (
                        <img src={profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-neutral-600" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 items-center sm:items-start">
                      <h3 className="text-[23px] font-medium text-white tracking-wide truncate max-w-[250px]">
                        {profile.fullName || 'No Name'}
                      </h3>
                      {profile.jobTitle && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded border border-white/30 text-xs text-white/70 bg-transparent">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span>{profile.jobTitle}</span>
                        </div>
                      )}
                      <div className="mt-6 space-y-4 text-xs font-light text-white/80">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                          <span className="truncate max-w-[220px]">{profile.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                          <span>{profile.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                          <span>{profile.city && profile.country ? `${profile.city}, ${profile.country}` : (profile.city || profile.country || '—')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                          <span>{profile.dateOfJoining ? `Joined on ${new Date(profile.dateOfJoining).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}` : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden md:block w-[1px] h-full bg-white/20 self-stretch" />

                  {/* Right Side */}
                  <div className="w-full flex flex-col gap-y-4 text-[13px] self-center md:pl-8">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Department</span>
                      <span className="text-white font-normal">{profile.department || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Manager</span>
                      <span className="text-white font-normal">{profile.manager || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Employment Type</span>
                      <span className="text-white font-normal">{profile.jobType || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Role</span>
                      <span className="text-white font-normal">{profile.jobTitle || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Status</span>
                      <div>
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-medium border ${(profile as any).status?.toLowerCase() === 'approved'
                            ? ((profile as any).isOnline
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-neutral-800/40 text-neutral-400 border border-neutral-700/50')
                            : (profile as any).status?.toLowerCase() === 'rejected'
                              ? 'bg-red-500/10 text-[#ff4d5a] border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                          {(profile as any).status?.toLowerCase() === 'approved'
                            ? ((profile as any).isOnline ? 'Active' : 'Idle')
                            : (profile as any).status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Last Login</span>
                      <span className="text-white font-normal">{formatLastLogin((profile as any).lastLogin)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Original Header Card for Employee */
              <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl overflow-hidden relative shadow-lg">
                <div
                  className="h-[220px] bg-cover bg-center flex items-center justify-center relative border-b border-neutral-900"
                  style={{ backgroundImage: `url('/assets/portal/profile/bg-img.webp')` }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="p-6 lg:p-8 pt-20 lg:pt-24 relative">
                  <div className="absolute -top-20 left-6 lg:left-8 w-32 h-32 rounded-full border-[3px] border-neutral-900 bg-[#0a0a0a] shadow-xl shrink-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                      {profile.pictureUrl ? (
                        <img src={profile.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 text-neutral-600" />
                      )}
                    </div>
                  </div>

                  <div className="text-left">
                    <h2 className="text-2xl font-medium text-white tracking-wide leading-tight">
                      {profile.fullName || 'No Name'}
                    </h2>
                    <p className="text-[14px] text-neutral-400 mt-1 font-normal">
                      {profile.jobTitle || 'No Title'}
                    </p>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-2 mt-4 text-[15px] text-white font-normal poppins">
                      <span className="flex items-center gap-2">
                        <Mail className="w-[18px] h-[18px] text-white shrink-0" />
                        <span>{profile.email || 'None'}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone className="w-[18px] h-[18px] text-white shrink-0" />
                        <span>{profile.phone || 'None'}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-[18px] h-[18px] text-white shrink-0" />
                        <span>{profile.city && profile.country ? `${profile.city}, ${profile.country}` : (profile.city || profile.country || 'None')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-900/80 my-5 -mx-6" />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 text-center sm:text-left justify-center sm:justify-start">
                      <div>
                        <span className="block text-[12px] text-neutral-500 font-normal">Department</span>
                        <span className="text-[14px] font-normal text-white mt-0.5 block">
                          {profile.department || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[12px] text-neutral-500 font-normal">Manager</span>
                        <span className="text-[14px] font-normal text-white mt-0.5 block">
                          {profile.manager || '—'}
                        </span>
                      </div>
                    </div>

                    {profile.editRequestStatus === 'APPROVED' ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_4px_12px_rgba(190,9,25,0.2)] hover:shadow-[0_4px_16px_rgba(190,9,25,0.35)] cursor-pointer focus:outline-none shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                    ) : profile.editRequestStatus === 'PENDING' ? (
                      <button
                        type="button"
                        disabled
                        className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-bold py-2.5 px-6 rounded-lg cursor-not-allowed shrink-0"
                      >
                        <Clock className="w-3.5 h-3.5 text-neutral-500 animate-pulse" />
                        <span>Edit Request Pending</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestEdit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_4px_12px_rgba(190,9,25,0.2)] hover:shadow-[0_4px_16px_rgba(190,9,25,0.35)] cursor-pointer focus:outline-none shrink-0 disabled:opacity-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Request Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Read-Only Details Stack */}
            <div className="space-y-8">

              {/* Personal and Contact Information Card */}
              <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-6 shadow-md w-full">
                <h3 className="text-sm font-semibold text-white mb-6 border-l-2 border-red-500 pl-3">
                  Personal and Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 text-xs font-light">

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Full Name</span>
                      <span className="text-white font-normal">{profile.fullName || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">User Name</span>
                      <span className="text-white font-normal">{profile.userName || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Date of Birth</span>
                      <span className="text-white font-normal">{profile.dateOfBirth || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Gender</span>
                      <span className="text-white font-normal">{profile.gender || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Nationality</span>
                      <span className="text-white font-normal">{profile.nationality || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Language</span>
                      <span className="text-white font-normal">{profile.language || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Country</span>
                      <span className="text-white font-normal">{profile.country || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">City</span>
                      <span className="text-white font-normal">{profile.city || '—'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Email</span>
                      <span className="text-white font-normal break-all">{profile.email || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Work Email</span>
                      <span className="text-white font-normal break-all">{profile.workEmail || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Phone</span>
                      <span className="text-white font-normal">{profile.phone || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Emergency Number</span>
                      <span className="text-white font-normal">{profile.emergencyPhone || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Current Address</span>
                      <span className="text-white font-normal leading-relaxed">{profile.currentAddress || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Permanent Address</span>
                      <span className="text-white font-normal leading-relaxed">{profile.permanentAddress || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Education</span>
                      <span className="text-white font-normal leading-relaxed">{profile.education || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details Card */}
              <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-6 shadow-md w-full">
                <h3 className="text-sm font-semibold text-white mb-6 border-l-2 border-red-500 pl-3">
                  Job Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 text-xs font-light">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Department</span>
                      <span className="text-white font-normal">{profile.department || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Role</span>
                      <span className="text-white font-normal">{profile.jobTitle || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Manager</span>
                      <span className="text-white font-normal">{profile.manager || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Joining Date</span>
                      <span className="text-white font-normal">{profile.dateOfJoining || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Job type</span>
                      <span className="text-white font-normal">{profile.jobType || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Job Level</span>
                      <span className="text-white font-normal">{profile.jobLevel || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Working Days</span>
                      <span className="text-white font-normal">{profile.workingDays || '—'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Probation Period</span>
                      <span className="text-white font-normal">{profile.probationPeriod || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Notice Period</span>
                      <span className="text-white font-normal">{profile.noticePeriod || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Team</span>
                      <span className="text-white font-normal">{profile.team || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Annual leave</span>
                      <span className="text-white font-normal">{profile.annualLeave || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Work Type</span>
                      <span className="text-white font-normal">{profile.workType || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Shift</span>
                      <span className="text-white font-normal">{profile.shift || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Day off</span>
                      <span className="text-white font-normal">{profile.weeklyOff || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Payment Details & Documents Card (Side-by-Side) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Payment Details Card */}
                <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-6 shadow-md h-full">
                  <h3 className="text-sm font-semibold text-white mb-6 border-l-2 border-red-500 pl-3">
                    Payment Details
                  </h3>

                  <div className="space-y-4 text-xs font-light">
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Bank Name</span>
                      <span className="text-white font-normal">{profile.bankName || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Holder Name</span>
                      <span className="text-white font-normal">{profile.accountHolderName || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Account Number</span>
                      <span className="text-white font-normal">{profile.accountNumber || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Currency</span>
                      <span className="text-white font-normal">{profile.currency || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Bonus</span>
                      <span className="text-white font-normal">{profile.bonus || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Annual Salary</span>
                      <span className="text-white font-normal">{profile.annualSalary || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Salary Type</span>
                      <span className="text-white font-normal">{profile.salaryType || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Salary</span>
                      <span className="text-white font-normal">{profile.salary || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Deduction per Absence</span>
                      <span className="text-white font-normal">{profile.deductionPerAbsence || '—'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Payment Date</span>
                      <span className="text-white font-normal">
                        {profile.paymentDate ? (
                          /^\d+$/.test(profile.paymentDate)
                            ? profile.paymentDate
                            : (profile.paymentDate.split(' ')[0] && /^\d+$/.test(profile.paymentDate.split(' ')[0])
                              ? profile.paymentDate.split(' ')[0]
                              : profile.paymentDate)
                        ) : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Documents Summary Card */}
                <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl p-6 shadow-md overflow-hidden h-full">
                  <h3 className="text-sm font-semibold text-white mb-6 border-l-2 border-red-500 pl-3">
                    Documents
                  </h3>

                  <div className="space-y-4 text-xs font-light">

                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">CNIC</span>
                      <div>
                        {profile.cnicFileName ? (
                          <>
                            <button
                              onClick={() => handleDownloadFile(profile.cnicFileName, profile.cnicContent)}
                              className="text-white hover:text-red-400 font-normal text-left transition-colors cursor-pointer block truncate max-w-[200px]"
                              title="Download CNIC"
                            >
                              {profile.cnicFileName}
                            </button>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">{getBase64Size(profile.cnicContent)}</span>
                            {renderDocStatus('cnic', profile.cnicStatus, !!profile.cnicFileName)}
                          </>
                        ) : (
                          <span className="text-white font-normal">—</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Passport Picture</span>
                      <div>
                        {profile.pictureUrl ? (
                          <>
                            <button
                              onClick={() => handleDownloadFile('Profile_Picture.png', profile.pictureUrl)}
                              className="text-white hover:text-red-400 font-normal text-left transition-colors cursor-pointer block truncate max-w-[200px]"
                              title="Download Photo"
                            >
                              Profile_Picture.png
                            </button>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">{getBase64Size(profile.pictureUrl)}</span>
                            {renderDocStatus('picture', profile.pictureStatus, !!profile.pictureUrl)}
                          </>
                        ) : (
                          <span className="text-white font-normal">—</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Portfolio</span>
                      <div>
                        {profile.portfolioUrl ? (
                          <>
                            <a
                              href={getFormattedUrl(profile.portfolioUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-white hover:text-red-400 font-normal text-left transition-colors cursor-pointer block truncate max-w-[200px]"
                            >
                              {profile.portfolioUrl}
                            </a>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">Link</span>
                            {renderDocStatus('portfolio', profile.portfolioStatus, !!profile.portfolioUrl)}
                          </>
                        ) : (
                          <span className="text-white font-normal">—</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Resume</span>
                      <div>
                        {profile.cvFileName ? (
                          <>
                            <button
                              onClick={() => handleDownloadFile(profile.cvFileName, profile.cvContent)}
                              className="text-white hover:text-red-400 font-normal text-left transition-colors cursor-pointer block truncate max-w-[200px]"
                              title="Download CV"
                            >
                              {profile.cvFileName}
                            </button>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">{getBase64Size(profile.cvContent)}</span>
                            {renderDocStatus('cv', profile.cvStatus, !!profile.cvFileName)}
                          </>
                        ) : (
                          <span className="text-white font-normal">—</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-neutral-500">Contract</span>
                      <div>
                        {profile.contractFileName ? (
                          <>
                            <button
                              onClick={() => handleDownloadFile(profile.contractFileName, profile.contractContent)}
                              className="text-white hover:text-red-400 font-normal text-left transition-colors cursor-pointer block truncate max-w-[200px]"
                              title="Download Contract"
                            >
                              {profile.contractFileName}
                            </button>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">{getBase64Size(profile.contractContent)}</span>
                            {renderDocStatus('contract', profile.contractStatus, !!profile.contractFileName)}
                          </>
                        ) : (
                          <span className="text-white font-normal">—</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
