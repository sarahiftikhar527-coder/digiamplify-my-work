import React from 'react';
import { Search, User, Check, ExternalLink, Edit3, Download } from 'lucide-react';
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
}

export default function AdminUsersDirectory({
  usersList,
  searchQuery,
  setSearchQuery,
  handleApproveUser,
  handleRejectUser,
  handleApproveEdit,
  handleViewUser,
  handleEditUser
}: AdminUsersDirectoryProps) {
  const pendingRequests = usersList.filter((u: any) => u.status === 'PENDING' && u.role.toLowerCase() !== 'admin');
  
  const approvedUsers = usersList.filter((u: any) => u.status === 'APPROVED' || u.role.toLowerCase() === 'admin').filter((u: any) => {
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
      {}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md mb-8 animate-fadeIn">
        <h2 className="text-xl font-bold text-white tracking-wide select-none">Pending Registration Requests</h2>
        <p className="text-xs text-neutral-500 font-light mt-1 mb-6 select-none">Review and approve or reject employee registration requests.</p>

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

      {}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="select-none">
            <h2 className="text-xl font-bold text-white tracking-wide">Users Directory</h2>
            <p className="text-xs text-neutral-500 font-light mt-1">Manage and edit user profiles in the portal.</p>
          </div>

          <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-2.5 w-full sm:max-w-[300px] focus-within:border-[#be0919] transition-all">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
            />
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
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold select-none ${
                      u.role.toLowerCase() === 'admin'
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
                  <td colSpan={5} className="py-8 text-center text-neutral-500 font-light select-none">No users found.</td>
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
              <span>Download Users CSV</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
