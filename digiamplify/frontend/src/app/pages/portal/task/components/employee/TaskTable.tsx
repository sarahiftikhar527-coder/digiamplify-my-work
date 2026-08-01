import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskTableProps {
  tasks: any[];
  onUpdateStatus: (taskId: string, newStatus: string) => void;
  onOpenUpdateModal: (task: any) => void;
  onAddTaskClick?: () => void;
}

export default function TaskTable({ tasks, onUpdateStatus, onOpenUpdateModal, onAddTaskClick }: TaskTableProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Ongoing' | 'Completed' | 'Overdue'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Helper: calculate days remaining dynamically
  const getDaysLeft = (dueDateStr: string, status: string) => {
    const isCompleted = status.toUpperCase() === 'COMPLETED' || status.toUpperCase() === 'FINISHED';
    if (isCompleted) {
      return { text: 'Completed', color: 'text-emerald-450' };
    }
    if (!dueDateStr) return { text: 'No due date', color: 'text-neutral-500' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-[#ff4d5a]' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-[#be0919]' };
    } else if (diffDays === 1) {
      return { text: '1 day left', color: 'text-[#ff4d5a]' };
    } else if (diffDays < 7) {
      return { text: `${diffDays} days left`, color: 'text-[#ff4d5a]' };
    } else {
      const weeks = Math.floor(diffDays / 7);
      return { text: `${weeks} ${weeks === 1 ? 'week' : 'weeks'} left`, color: 'text-emerald-500' };
    }
  };

  // Helper: Format date to e.g. "13 July, 2026"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const status = task.status.toUpperCase();
    const isOverdue = !['COMPLETED', 'FINISHED'].includes(status) && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

    if (activeTab === 'Ongoing') {
      return status === 'ONGOING' || status === 'PENDING';
    }
    if (activeTab === 'Completed') {
      return status === 'COMPLETED' || status === 'FINISHED';
    }
    if (activeTab === 'Overdue') {
      return isOverdue;
    }
    return true; // "All"
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleDropdown = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === taskId ? null : taskId);
  };

  const handleStatusSelect = (taskId: string, newStatus: string) => {
    onUpdateStatus(taskId, newStatus);
    setOpenDropdownId(null);
  };

  const getPriorityColor = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'high') return 'bg-[#ff4d5a]';
    if (p === 'medium') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusStyles = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'FINISHED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s === 'DELAYED') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (s === 'CANCELLED') {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    // Ongoing / Pending
    return 'bg-[#be0919]/10 text-[#ff4d5a] border-[#be0919]/20';
  };

  const getStatusLabel = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'FINISHED') return 'Finished';
    if (s === 'DELAYED') return 'Delayed';
    if (s === 'CANCELLED') return 'Cancelled';
    return 'Ongoing';
  };

  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 shadow-md relative">
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

      {/* Tabs and Add Task button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-5 mb-6">
        <div className="flex items-center bg-[#050505] p-1 rounded-lg border border-neutral-900">
          {(['All', 'Ongoing', 'Completed', 'Overdue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-md text-xs font-normal transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#be0919] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {onAddTaskClick && (
          <button
            onClick={onAddTaskClick}
            className="bg-[#be0919] hover:bg-[#990714] text-white px-5 py-2.5 rounded-lg text-xs font-normal transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(190,9,25,0.25)]"
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Task Table with dynamic red horizontal scrollbar */}
      <div className="overflow-x-auto min-h-[300px] custom-red-scrollbar-h pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-neutral-900 text-[11px] font-normal text-neutral-500 uppercase tracking-wider">
              <th className="pb-3 pl-4 font-normal">Task Details</th>
              <th className="pb-3 font-normal w-28">Priority</th>
              <th className="pb-3 font-normal w-40">Assigned By</th>
              <th className="pb-3 font-normal w-36">Due Date</th>
              <th className="pb-3 pr-4 font-normal w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-sm font-light text-neutral-300">
            {paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-neutral-500 font-light font-normal">
                  No tasks found in this tab.
                </td>
              </tr>
            ) : (
              paginatedTasks.map(task => {
                const daysInfo = getDaysLeft(task.dueDate, task.status);
                const assignedByName = task.assignedBy?.profile?.fullName || 'Admin';
                const assignedByAvatar = task.assignedBy?.profile?.pictureUrl;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onOpenUpdateModal(task)}
                    className="hover:bg-neutral-950/40 transition-all cursor-pointer group"
                  >
                    {/* Task Details */}
                    <td className="py-4 pl-4 pr-3 max-w-[220px]">
                      <div>
                        <p className="font-normal text-white group-hover:text-[#ff4d5a] transition-all duration-200 truncate">
                          {task.subject}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-1 font-normal">
                          {task.description}
                        </p>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-4 pr-3 w-28">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="text-xs text-neutral-300 font-normal">{task.priority}</span>
                      </div>
                    </td>

                    {/* Assigned By */}
                    <td className="py-4 pr-3 w-40">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden text-[10px] font-normal text-neutral-400 shrink-0">
                          {assignedByAvatar ? (
                            <img src={assignedByAvatar} alt={assignedByName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{assignedByName.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-300 font-normal">{assignedByName}</span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-4 pr-3 w-36">
                      <div>
                        <p className="text-xs text-neutral-300 font-normal">{formatDate(task.dueDate)}</p>
                        <p className={`text-[10px] mt-0.5 font-normal ${daysInfo.color}`}>{daysInfo.text}</p>
                      </div>
                    </td>

                    {/* Status Select Dropdown */}
                    <td className="py-4 pr-4 w-32" onClick={e => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={e => toggleDropdown(e, task.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-normal transition-all cursor-pointer ${getStatusStyles(
                            task.status
                          )}`}
                        >
                          <span>{getStatusLabel(task.status)}</span>
                          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                        </button>

                        {openDropdownId === task.id && (
                          <div className="absolute right-0 mt-1.5 w-32 bg-[#0c0c0c] border border-neutral-900 rounded-lg shadow-xl z-50 overflow-hidden py-1 animate-fadeIn">
                            {(['Ongoing', 'Delayed', 'Finished', 'Cancelled'] as const).map(option => {
                              // map ui values to api values
                              let apiStatus = 'ONGOING';
                              if (option === 'Finished') apiStatus = 'COMPLETED';
                              else if (option === 'Delayed') apiStatus = 'DELAYED';
                              else if (option === 'Cancelled') apiStatus = 'CANCELLED';

                              return (
                                <button
                                  key={option}
                                  onClick={() => handleStatusSelect(task.id, apiStatus)}
                                  className="w-full text-left px-3.5 py-2 text-xs text-neutral-300 hover:bg-[#be0919]/10 hover:text-white transition-all font-normal"
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {filteredTasks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-neutral-900 pt-5">
          <p className="text-xs text-neutral-500 font-light flex items-center">
            Showing
            <span className="text-neutral-300 font-normal mx-1.5">{startIndex + 1}</span>
            to
            <span className="text-neutral-300 font-normal mx-1.5">
              {Math.min(startIndex + itemsPerPage, filteredTasks.length)}
            </span>
            of
            <span className="text-neutral-300 font-normal ml-1.5">{filteredTasks.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-normal transition-all duration-200 cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#be0919] text-white shadow-sm'
                    : 'border border-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
