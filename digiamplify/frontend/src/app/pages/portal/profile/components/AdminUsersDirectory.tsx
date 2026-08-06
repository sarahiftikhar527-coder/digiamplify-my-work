import React, { useState } from 'react';
import { Search, User, Check, ExternalLink, Edit3, Download, Star, TrendingUp, Users, UserCheck, UserMinus, UserPlus, X, Eye, EyeOff } from 'lucide-react';
import { downloadCSV } from '@/utils/csvHelper';

interface AdminUsersDirectoryProps {
  usersList: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleApproveUser: (id: string) => void;
  handleRejectUser: (id: string) => void;
  handleApproveEdit: (id: string) => void;
  handleViewUser: (id: string) => void;
  handleEditUser: (id: string) => void;
  onRefresh: () => void;
}

export default function AdminUsersDirectory({
  usersList,
  searchQuery,
  setSearchQuery,
  handleApproveUser,
  handleRejectUser,
  handleApproveEdit,
  handleViewUser,
  handleEditUser,
  onRefresh
}: AdminUsersDirectoryProps) {
  const pendingRequests = usersList.filter((u: any) =>
    u.status !== 'REJECTED' &&
    u.status !== 'rejected' &&
    u.status === 'PENDING' &&
    u.role.toLowerCase() !== 'admin'
  );

  const approvedUsers = usersList.filter((u: any) =>
    u.status !== 'REJECTED' &&
    u.status !== 'rejected' &&
    (u.status === 'APPROVED' || u.status === 'approved') &&
    u.role.toLowerCase() !== 'admin'
  ).filter((u: any) => {
    const q = searchQuery.toLowerCase();
    const emailMatch = (u.email || '').toLowerCase().includes(q);
    const nameMatch = (u.profile?.fullName || '').toLowerCase().includes(q);
    const deptMatch = (u.profile?.department || '').toLowerCase().includes(q);
    return emailMatch || nameMatch || deptMatch;
  });

  const handleDownloadCSV = () => {
    const headers = [
      'User ID',
      'Email',
      'Role',
      'Status',
      'Full Name',
      'Username',
      'Date of Birth',
      'Gender',
      'Nationality',
      'Language',
      'Phone',
      'Emergency Phone',
      'Current Address',
      'Permanent Address',
      'Country',
      'City',
      'Education',
      'Job Title',
      'Department',
      'Team',
      'Manager',
      'Job Level',
      'Probation Period',
      'Date of Joining',
      'Confirmation Date',
      'Annual Leave',
      'Job Type',
      'Work Type',
      'Shift',
      'Working Days',
      'Weekly Off',
      'Notice Period',
      'Bank Name',
      'Account Holder Name',
      'Account Number',
      'Currency',
      'Bonus',
      'Annual Salary',
      'Salary Type',
      'Salary',
      'Deduction Per Absence',
      'Payment Date',
      'Last Login',
      'Is Online'
    ];

    downloadCSV(headers, approvedUsers, 'users_directory.csv', (u: any) => [
      u.id,
      u.email,
      u.role,
      u.status,
      u.profile?.fullName || '',
      u.profile?.userName || '',
      u.profile?.dateOfBirth || '',
      u.profile?.gender || '',
      u.profile?.nationality || '',
      u.profile?.language || '',
      u.profile?.phone || '',
      u.profile?.emergencyPhone || '',
      u.profile?.currentAddress || '',
      u.profile?.permanentAddress || '',
      u.profile?.country || '',
      u.profile?.city || '',
      u.profile?.education || '',
      u.profile?.jobTitle || '',
      u.profile?.department || '',
      u.profile?.team || '',
      u.profile?.manager || '',
      u.profile?.jobLevel || '',
      u.profile?.probationPeriod || '',
      u.profile?.dateOfJoining || '',
      u.profile?.confirmationDate || '',
      u.profile?.annualLeave || '',
      u.profile?.jobType || '',
      u.profile?.workType || '',
      u.profile?.shift || '',
      u.profile?.workingDays || '',
      u.profile?.weeklyOff || '',
      u.profile?.noticePeriod || '',
      u.profile?.bankName || '',
      u.profile?.accountHolderName || '',
      u.profile?.accountNumber || '',
      u.profile?.currency || '',
      u.profile?.bonus || '',
      u.profile?.annualSalary || '',
      u.profile?.salaryType || '',
      u.profile?.salary || '',
      u.profile?.deductionPerAbsence || '',
      u.profile?.paymentDate || '',
      u.lastLogin ? new Date(u.lastLogin).toISOString() : '',
      u.isOnline ? 'Yes' : 'No'
    ]);
  };

  const [activeTab, setActiveTab] = useState<'directory' | 'pending'>('directory');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setIsAdding(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing. Please log in.');

      const res = await fetch('http://localhost:5000/api/profile/add-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          password: addPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add employee');

      setAddSuccess('Employee created successfully!');
      setAddName('');
      setAddEmail('');
      setAddPassword('');

      onRefresh();

      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddSuccess('');
      }, 1500);
    } catch (err: any) {
      setAddError(err.message || 'An error occurred');
    } finally {
      setIsAdding(false);
    }
  };

  const totalEmployeesCount = usersList.filter((u: any) => (u.status === 'APPROVED' || u.status === 'approved') && u.role.toLowerCase() !== 'admin').length;
  const activeEmployeesCount = usersList.filter((u: any) => (u.status === 'APPROVED' || u.status === 'approved') && u.role.toLowerCase() !== 'admin' && u.isOnline).length;
  const inactiveEmployeesCount = usersList.filter((u: any) => (u.status === 'APPROVED' || u.status === 'approved') && u.role.toLowerCase() !== 'admin' && !u.isOnline).length;

  const formatCount = (count: number) => {
    return count < 10 ? `0${count}` : `${count}`;
  };

  return (
    <>
      <style>{`
        .custom-red-scrollbar-h::-webkit-scrollbar {
          height: 6px;
        }
        .custom-red-scrollbar-h::-webkit-scrollbar-track {
          background: #050505;
          border-radius: 4px;
        }
        .custom-red-scrollbar-h::-webkit-scrollbar-thumb {
          background: #be0919;
          border-radius: 4px;
        }
        .custom-red-scrollbar-h::-webkit-scrollbar-thumb:hover {
          background: #990714;
        }
      `}</style>

      {/* Page Heading */}
      <div className="mb-12 select-none text-left">
        <h1 className="text-3xl font-medium tracking-wide text-white">Employees Directory</h1>
        <p className="text-sm text-neutral-400 font-medium mt-3 leading-relaxed">
          Manage, monitor, and edit employee registration requests and profiles in the portal.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none">
        {/* Total Employees */}
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 flex items-center gap-5 shadow-md">
          <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-3 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs text-neutral-400 font-light poppins">Total Employees</span>
            <span className="text-2xl font-bold text-white font-sans mt-0.5">{formatCount(totalEmployeesCount)}</span>
            <span className="text-[11px] text-neutral-500 mt-0.5 poppins">All System Users</span>
          </div>
        </div>

        {/* Active User */}
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 flex items-center gap-5 shadow-md">
          <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs text-neutral-400 font-light poppins">Active Employees</span>
            <span className="text-2xl font-bold text-white font-sans mt-0.5">{formatCount(activeEmployeesCount)}</span>
            <span className="text-[11px] text-neutral-500 mt-0.5 poppins">Currently active</span>
          </div>
        </div>

        {/* Inactive User */}
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 flex items-center gap-5 shadow-md">
          <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl p-3 flex items-center justify-center shrink-0">
            <UserMinus className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs text-neutral-400 font-light poppins">Idle Employees</span>
            <span className="text-2xl font-bold text-white font-sans mt-0.5">{formatCount(inactiveEmployeesCount)}</span>
            <span className="text-[11px] text-neutral-500 mt-0.5 poppins">Not active</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-neutral-900 mb-8 gap-6 select-none">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer relative focus:outline-none ${activeTab === 'directory' ? 'text-[#be0919]' : 'text-neutral-400 hover:text-white'
            }`}
        >
          <span>Employees Directory</span>
          {activeTab === 'directory' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#be0919]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer relative focus:outline-none flex items-center gap-2 ${activeTab === 'pending' ? 'text-[#be0919]' : 'text-neutral-400 hover:text-white'
            }`}
        >
          <span>Pending Requests</span>
          {pendingRequests.length > 0 && (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#be0919]" />
          )}
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md mb-8 animate-fadeIn">
          <div className="mt-2"></div>

          <div className="overflow-x-auto w-full custom-red-scrollbar-h pb-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-neutral-900 text-neutral-400 text-xs font-semibold uppercase tracking-wider select-none">
                  <th className="py-4 px-4 pr-6">User</th>
                  <th className="py-4 px-4 pr-6">Requested Role</th>
                  <th className="py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-xs font-medium text-neutral-300">
                {pendingRequests.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 pr-6 text-white font-medium whitespace-nowrap">{u.email}</td>
                    <td className="py-4 px-4 pr-6 text-neutral-300 font-light whitespace-nowrap">{u.role}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleApproveUser(u.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold py-1.5 px-4 rounded transition-all shadow-[0_2px_8px_rgba(16,185,129,0.2)] cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectUser(u.id)}
                          className="bg-[#be0919] hover:bg-[#990714] text-white text-[11px] font-bold py-1.5 px-4 rounded transition-all shadow-[0_2px_8px_rgba(190,9,25,0.2)] cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-neutral-500 font-light select-none">No pending registration requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-8">

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:max-w-[450px]">
              <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-2.5 w-full focus-within:border-[#be0919] transition-all">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)] cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full custom-red-scrollbar-h pb-2">
            <table className="w-full text-left border-collapse min-w-[1150px]">
              <thead>
                <tr className="border-b border-neutral-900 text-neutral-400 text-xs font-semibold uppercase tracking-wider select-none">
                  <th className="py-4 px-4 pr-6">User</th>
                  <th className="py-4 px-4 pr-6">Role</th>
                  <th className="py-4 px-4 pr-6">Full Name</th>
                  <th className="py-4 px-4 pr-6">Department</th>
                  <th className="py-4 px-4 pr-6">Status</th>
                  <th className="py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-900 text-sm font-medium text-neutral-300">
                {approvedUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4.5 px-4 pr-6 flex items-center gap-3.5 whitespace-nowrap">
                      <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                        {u.profile?.pictureUrl ? (
                          <img src={u.profile.pictureUrl} alt="User picture" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4.5 h-4.5 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-medium truncate max-w-[150px] sm:max-w-[200px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-4 pr-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold select-none ${u.role.toLowerCase() === 'admin'
                        ? 'bg-red-500/10 text-[#ff4d5a] border border-red-500/20'
                        : 'bg-neutral-800 text-neutral-300 border border-neutral-700/50'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 pr-6 text-neutral-300 font-light whitespace-nowrap">
                      {u.profile?.fullName || '—'}
                    </td>
                    <td className="py-4.5 px-4 pr-6 text-neutral-300 font-light whitespace-nowrap">
                      {u.profile?.department || '—'}
                    </td>
                    <td className="py-4.5 px-4 pr-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold select-none ${u.isOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-[#ff4d5a] border border-red-500/20'
                        }`}>
                        {u.isOnline ? 'Active' : 'Idle'}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3.5 whitespace-nowrap">
                        {u.editRequestStatus === 'PENDING' && (
                          <button
                            onClick={() => handleApproveEdit(u.id)}
                            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-4.5 rounded transition-all shadow-[0_2px_8px_rgba(16,185,129,0.2)] cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleViewUser(u.id)}
                          className="inline-flex items-center gap-1.5 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-white/5 text-xs font-bold py-2 px-4.5 rounded transition-all cursor-pointer whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => handleEditUser(u.id)}
                          className="inline-flex items-center gap-1.5 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2 px-4.5 rounded transition-all shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)] cursor-pointer whitespace-nowrap"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {approvedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500 font-light select-none">No employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {approvedUsers.length > 0 && (
            <div className="flex justify-end mt-6 border-t border-neutral-900 pt-6">
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2.5 px-6 rounded transition-all shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)] cursor-pointer"
              >
                <Download className="w-4.5 h-4.5" />
                <span>Download Employees CSV</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative">

            {/* Header */}
            <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white tracking-wide">Add New Employee</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-500 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEmployeeSubmit} className="p-6 space-y-5">

              {addError && (
                <div className="bg-red-500/10 border border-red-500/20 text-[#ff4d5a] text-xs py-3 px-4 rounded-lg font-light text-center">
                  {addError}
                </div>
              )}

              {addSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-3 px-4 rounded-lg font-light text-center">
                  {addSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="bg-[#050505] border border-neutral-900 focus:border-[#be0919] outline-none text-white text-xs rounded-lg py-2.5 px-4 w-full transition-all font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. johndoe@company.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="bg-[#050505] border border-neutral-900 focus:border-[#be0919] outline-none text-white text-xs rounded-lg py-2.5 px-4 w-full transition-all font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter min. 6 characters"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="bg-[#050505] border border-neutral-900 focus:border-[#be0919] outline-none text-white text-xs rounded-lg py-2.5 pl-4 pr-10 w-full transition-all font-light"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-350 cursor-pointer p-0.5 rounded focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border border-neutral-800 text-neutral-300 hover:text-white hover:bg-white/5 text-xs font-bold py-2.5 px-5 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="bg-[#be0919] hover:bg-[#990714] disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_2px_8px_rgba(190,9,25,0.2)] hover:shadow-[0_2px_12px_rgba(190,9,25,0.35)] cursor-pointer"
                >
                  {isAdding ? 'Creating...' : 'Create Employee'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
