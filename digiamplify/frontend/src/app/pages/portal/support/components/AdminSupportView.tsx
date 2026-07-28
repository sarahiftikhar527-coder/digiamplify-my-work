import React from 'react';
import { Search, Flag, ExternalLink } from 'lucide-react';

interface AdminSupportViewProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeTab: 'ALL' | 'PENDING' | 'RESOLVED';
  setActiveTab: (val: 'ALL' | 'PENDING' | 'RESOLVED') => void;
  tickets: any[];
  filteredTickets: any[];
  onTicketClick: (ticket: any) => void;
}

export default function AdminSupportView({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  tickets,
  filteredTickets,
  onTicketClick
}: AdminSupportViewProps) {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Dashboard summary & tabs */}
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="select-none">
            <h2 className="text-xl font-bold text-white tracking-wide">Support Tickets Console</h2>
            <p className="text-xs text-neutral-500 font-light mt-1">Review, respond, and resolve employee queries and problems.</p>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-2.5 w-full md:max-w-[300px] focus-within:border-[#be0919] transition-all">
            <Search className="w-4 h-4 text-neutral-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by email, name or subject..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-neutral-900 pb-4 mb-6 select-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ALL' ? 'text-[#be0919] border-[#be0919]' : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'PENDING' ? 'text-[#be0919] border-[#be0919]' : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            Pending ({tickets.filter(t => t.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'RESOLVED' ? 'text-[#be0919] border-[#be0919]' : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            Resolved ({tickets.filter(t => t.status === 'RESOLVED').length})
          </button>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-400 text-sm font-semibold uppercase tracking-wider select-none">
                <th className="py-4 px-4">Employee</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Subject</th>
                <th className="py-4 px-4">Priority</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-900 text-sm font-medium text-neutral-300">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-4.5 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-semibold">{t.user?.profile?.fullName || '—'}</span>
                      <span className="text-xs text-neutral-400 font-light mt-1">{t.user?.email}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-4 text-sm text-neutral-200 font-normal">
                    {t.issueType}
                  </td>
                  <td className="py-4.5 px-4 text-sm text-neutral-200 font-normal max-w-[200px] truncate">
                    {t.subject}
                  </td>
                  <td className="py-4.5 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold select-none ${
                      t.priority === 'High' ? 'text-[#ff4d5a]' : t.priority === 'Medium' ? 'text-amber-400' : 'text-neutral-400'
                    }`}>
                      <Flag className="w-3.5 h-3.5" />
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4.5 px-4">
                    <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-sm font-semibold border select-none ${
                      t.status === 'RESOLVED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {t.status === 'RESOLVED' ? 'Resolved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4.5 px-4 text-right pr-6">
                    <button
                      onClick={() => onTicketClick(t)}
                      className="inline-flex items-center gap-1.5 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-white/5 text-sm font-bold py-2.5 px-5 rounded transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Respond</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-neutral-500 font-light text-xs select-none">No tickets found matching current view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
