import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Download, AlertCircle, FileText, ClipboardList, Clock, CheckCircle, ChevronLeft, ChevronRight, LinkIcon } from 'lucide-react';
import CreateTaskModal from './CreateTaskModal';
interface TaskGroup {
  taskGroupId: string | null;
  tasks: any[];
}

const groupTasks = (taskList: any[]): TaskGroup[] => {
  const groups: TaskGroup[] = [];
  const groupMap: { [key: string]: TaskGroup } = {};

  taskList.forEach(task => {
    if (task.taskGroupId) {
      if (!groupMap[task.taskGroupId]) {
        groupMap[task.taskGroupId] = {
          taskGroupId: task.taskGroupId,
          tasks: []
        };
        groups.push(groupMap[task.taskGroupId]);
      }
      groupMap[task.taskGroupId].tasks.push(task);
    } else {
      groups.push({
        taskGroupId: null,
        tasks: [task]
      });
    }
  });

  return groups;
};

export default function AdminTaskView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Ongoing' | 'Delayed' | 'Completed' | 'Cancelled' | 'Overdue'>('All');

  const [activeTab, setActiveTab] = useState<'tasks' | 'requests'>('tasks');
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  const [currentPageTasks, setCurrentPageTasks] = useState(1);
  const [currentPageRequests, setCurrentPageRequests] = useState(1);
  const itemsPerPage = 5;

  const taskGroups = React.useMemo(() => {
    return groupTasks(filteredTasks);
  }, [filteredTasks]);

  const totalPagesTasks = Math.max(1, Math.ceil(taskGroups.length / itemsPerPage));
  const startIndexTasks = (currentPageTasks - 1) * itemsPerPage;
  const paginatedTaskGroups = taskGroups.slice(startIndexTasks, startIndexTasks + itemsPerPage);

  const totalPagesRequests = Math.max(1, Math.ceil(requests.length / itemsPerPage));
  const startIndexRequests = (currentPageRequests - 1) * itemsPerPage;
  const paginatedRequests = requests.slice(startIndexRequests, startIndexRequests + itemsPerPage);

  const fetchTasks = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            setFilteredTasks(data);
            calculateStats(data);
            return data;
          }
          return prev;
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error fetching tasks');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchRequests = async (silent = false) => {
    try {
      if (!silent) setLoadingRequests(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching task requests:', err);
    } finally {
      if (!silent) setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchRequests();

    const interval = setInterval(() => {
      fetchTasks(true);
      fetchRequests(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = tasks.filter(task => {
      // 1. Search filter
      const subject = task.subject?.toLowerCase() || '';
      const name = task.assignedTo?.profile?.fullName?.toLowerCase() || '';
      const email = task.assignedTo?.email?.toLowerCase() || '';
      const matchesSearch = subject.includes(query) || name.includes(query) || email.includes(query);
      if (!matchesSearch) return false;

      // 2. Status filter
      const status = task.status.toUpperCase();
      const isOverdue = !['COMPLETED', 'FINISHED'].includes(status) && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

      if (statusFilter === 'Pending') return status === 'PENDING';
      if (statusFilter === 'Ongoing') return status === 'ONGOING';
      if (statusFilter === 'Delayed') return status === 'DELAYED';
      if (statusFilter === 'Completed') return status === 'COMPLETED' || status === 'FINISHED';
      if (statusFilter === 'Cancelled') return status === 'CANCELLED';
      if (statusFilter === 'Overdue') return isOverdue;

      return true; // 'All'
    });
    setFilteredTasks(filtered);
    setCurrentPageTasks(1);
  }, [searchQuery, statusFilter, tasks]);

  const calculateStats = (taskList: any[]) => {
    const total = taskList.length;
    const pending = taskList.filter(t => t.status === 'PENDING').length;
    const completed = taskList.filter(t => t.status === 'COMPLETED').length;
    setStats({ total, pending, completed });
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'FINISHED') {
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';
    }
    if (s === 'DELAYED') {
      return 'bg-[#be0919]/15 text-[#ff4d5a] border border-[#be0919]/25';
    }
    if (s === 'PENDING') {
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
    }
    if (s === 'ONGOING') {
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
    }
    if (s === 'CANCELLED') {
      return 'bg-purple-500/15 text-purple-400 border border-purple-500/25';
    }
    return 'bg-neutral-900 text-neutral-400 border border-neutral-850';
  };

  const getStatusLabel = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'FINISHED') return 'Finished';
    if (s === 'DELAYED') return 'Delayed';
    if (s === 'PENDING') return 'Pending';
    if (s === 'ONGOING') return 'Ongoing';
    if (s === 'CANCELLED') return 'Cancelled';
    return status;
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTasks();
      } else {
        alert('Failed to delete task');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this task request?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Request approved and task created successfully.');
        fetchTasks();
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Please enter a rejection reason (optional):');
    if (reason === null) return; // cancelled

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: reason })
      });
      if (res.ok) {
        alert('Request rejected successfully.');
        fetchRequests();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error(err);
      alert('Error rejecting request');
    }
  };

  const handleDownload = (fileName: string, fileContent: string) => {
    if (fileName.trim().startsWith('[') && fileContent.trim().startsWith('[')) {
      try {
        const names = JSON.parse(fileName);
        const contents = JSON.parse(fileContent);
        if (Array.isArray(names) && Array.isArray(contents)) {
          names.forEach((name, index) => {
            const content = contents[index];
            if (content) {
              const link = document.createElement('a');
              link.href = content;
              link.download = name;
              link.click();
            }
          });
          return;
        }
      } catch (e) {
        console.error('Error parsing attachments:', e);
      }
    }

    const link = document.createElement('a');
    link.href = fileContent;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="flex flex-col select-none">
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
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-[#be0919]" />
            <span>Task Management</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 font-light mt-2">Assign and track tasks given to employees.</p>
        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#be0919] hover:bg-[#990714] text-white py-3 px-6 rounded-lg text-xs font-bold transition-all shadow-[0_4px_15px_rgba(190,9,25,0.3)] hover:shadow-[0_4px_20px_rgba(190,9,25,0.45)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl py-4 px-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919] shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm text-neutral-300 font-light block whitespace-nowrap">Total Tasks</span>
            <span className="text-2xl sm:text-3xl font-medium mt-1 block text-white">{stats.total}</span>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl py-4 px-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm text-neutral-300 font-light block whitespace-nowrap">Pending Tasks</span>
            <span className="text-2xl sm:text-3xl font-medium mt-1 block text-white">{stats.pending}</span>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl py-4 px-6 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-[#be0919] shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm text-neutral-300 font-light block whitespace-nowrap">Completed Tasks</span>
            <span className="text-2xl sm:text-3xl font-medium mt-1 block text-white">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-[#050505] p-1 rounded-lg border border-neutral-900 w-fit mb-6">
        <button
          onClick={() => { setActiveTab('tasks'); setCurrentPageTasks(1); }}
          className={`px-5 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'tasks'
            ? 'bg-[#be0919] text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
            }`}
        >
          Active Tasks
        </button>
        <button
          onClick={() => { setActiveTab('requests'); setCurrentPageRequests(1); }}
          className={`px-5 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeTab === 'requests'
            ? 'bg-[#be0919] text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
            }`}
        >
          <span>Approval Requests</span>
          {requests.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="bg-white text-[#be0919] font-bold px-2 py-0.5 rounded-full text-[10px] min-w-5 text-center">
              {requests.filter(r => r.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 max-w-md w-full focus-within:border-neutral-700 transition-all shrink-0">
              <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search by subject or assignee name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
              />
            </div>

            <div className="flex items-center bg-[#050505] p-1 rounded-lg border border-neutral-900 overflow-x-auto custom-red-scrollbar-h w-fit max-w-full">
              {(['All', 'Pending', 'Ongoing', 'Delayed', 'Completed', 'Cancelled', 'Overdue'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 rounded-md text-xs font-normal transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    statusFilter === tab
                      ? 'bg-[#be0919] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab === 'All' ? 'All Tasks' : tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#be0919]" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-neutral-500 font-light">{error}</div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 font-light">No tasks found.</div>
          ) : (
            <div className="overflow-x-auto custom-red-scrollbar-h pb-2 mt-12">
              <table className="w-full text-left border-collapse min-w-[1250px]">
                <thead>
                  <tr className="border-b border-neutral-900 text-[11px] font-normal text-neutral-500 uppercase tracking-wider">
                    <th className="pb-4 pl-4 font-normal w-56 pr-8">Assignee</th>
                    <th className="pb-4 font-normal w-60 pr-8">Subject</th>
                    <th className="pb-4 font-normal w-32 pr-8">Priority</th>
                    <th className="pb-4 font-normal w-40 pr-8">Due Date</th>
                    <th className="pb-4 font-normal w-36 pr-8">Progress</th>
                    <th className="pb-4 font-normal w-36 pr-8">Status</th>
                    <th className="pb-4 font-normal w-44 pr-8">Proof</th>
                    <th className="pb-4 text-right font-normal w-32 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-sm font-light text-neutral-300">
                  {paginatedTaskGroups.map((group) => {
                    return group.tasks.map((task, taskIdx) => {
                      const isFirst = taskIdx === 0;
                      const spanCount = group.tasks.length;
                      return (
                        <tr key={task.id} className="hover:bg-neutral-950/30 transition-colors">
                          <td className="py-4 pr-8 pl-4 w-56 align-middle border-r border-neutral-900/40">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-sm text-neutral-400 shrink-0">
                                {task.assignedTo?.profile?.pictureUrl ? (
                                  <img src={task.assignedTo.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span>{(task.assignedTo?.profile?.fullName || 'U').charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-normal text-white text-sm">{task.assignedTo?.profile?.fullName || 'No Name'}</p>
                                <p className="text-xs text-neutral-500 font-light mt-0.5">{task.assignedTo?.email}</p>
                              </div>
                            </div>
                          </td>
                          {isFirst && (
                            <>
                              <td rowSpan={spanCount} className="py-4 pr-8 w-60 max-w-[200px] align-middle">
                                <div>
                                  <p className="font-normal text-white text-sm truncate">{task.subject}</p>
                                  <p className="text-xs text-neutral-500 font-light mt-0.5 truncate">{task.description}</p>
                                </div>
                              </td>
                              <td rowSpan={spanCount} className="py-4 pr-8 w-32 align-middle">
                                <span className={`inline-flex items-center px-3 py-1 rounded font-normal text-xs uppercase border ${task.priority === 'High'
                                  ? 'bg-[#be0919]/10 text-[#ff4d5a] border-[#be0919]/20'
                                  : task.priority === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  }`}>
                                  {task.priority}
                                </span>
                              </td>
                              <td rowSpan={spanCount} className="py-4 pr-8 w-40 align-middle">
                                <div>
                                  <p className="text-white text-sm font-normal">{task.dueDate}</p>
                                  {task.dueTime && <p className="text-xs text-neutral-500 mt-0.5">{task.dueTime}</p>}
                                </div>
                              </td>
                              <td rowSpan={spanCount} className="py-4 pr-8 w-36 align-middle">
                                <div className="flex flex-col gap-1.5 w-24">
                                  <div className="flex justify-between items-center text-[11px] text-neutral-400 font-normal">
                                    <span className="font-normal">Progress</span>
                                    <span className="font-normal text-white">{task.progress || 0}%</span>
                                  </div>
                                  <div className="w-full bg-neutral-900 rounded-full h-1">
                                    <div
                                      className="bg-[#be0919] h-1 rounded-full transition-all duration-350"
                                      style={{ width: `${task.progress || 0}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td rowSpan={spanCount} className="py-4 pr-8 w-36 align-middle">
                                <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-normal text-xs uppercase tracking-wider ${getStatusBadgeClass(task.status)}`}>
                                  {getStatusLabel(task.status)}
                                </span>
                              </td>
                              <td rowSpan={spanCount} className="py-4 pr-8 w-44 align-middle">
                                <div className="flex flex-col gap-1.5 items-start">
                                  {task.completionUrl && (
                                    <a
                                      href={task.completionUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-400 hover:text-blue-300 font-normal hover:underline flex items-center gap-1.5 truncate max-w-[150px]"
                                      title={task.completionUrl}
                                    >
                                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                                      <span>Proof Link</span>
                                    </a>
                                  )}
                                  {task.completionFileName && task.completionFileContent && (
                                    <button
                                      onClick={() => handleDownload(task.completionFileName, task.completionFileContent)}
                                      className="text-sm text-emerald-400 hover:text-emerald-300 font-normal hover:underline flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 outline-none"
                                    >
                                      <Download className="w-3.5 h-3.5 shrink-0" />
                                      <span>Proof Doc</span>
                                    </button>
                                  )}
                                  {!task.completionUrl && !(task.completionFileName && task.completionFileContent) && (
                                    <span className="text-neutral-500 font-normal text-sm">—</span>
                                  )}
                                </div>
                              </td>
                              <td rowSpan={spanCount} className="py-4 text-right w-32 pr-4 align-middle">
                                <div className="flex items-center justify-end gap-2.5">
                                  {task.fileName && task.fileContent && (
                                    <button
                                      onClick={() => handleDownload(task.fileName, task.fileContent)}
                                      title={`Download ${task.fileName}`}
                                      className="p-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                                    >
                                      <Download className="w-4.5 h-4.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="p-2.5 bg-[#be0919]/10 hover:bg-[#be0919]/20 border border-[#be0919]/20 rounded-lg text-[#ff4d5a] transition-all cursor-pointer flex items-center justify-center"
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Section */}
          {taskGroups.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-neutral-900 pt-5">
              <p className="text-xs text-neutral-500 font-light flex items-center">
                Showing
                <span className="text-neutral-300 font-normal mx-1.5">{startIndexTasks + 1}</span>
                to
                <span className="text-neutral-300 font-normal mx-1.5">
                  {Math.min(startIndexTasks + itemsPerPage, taskGroups.length)}
                </span>
                of
                <span className="text-neutral-300 font-normal ml-1.5">{taskGroups.length}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageTasks(p => Math.max(1, p - 1))}
                  disabled={currentPageTasks === 1}
                  className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPagesTasks }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPageTasks(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-normal transition-all duration-200 cursor-pointer ${currentPageTasks === page
                      ? 'bg-[#be0919] text-white shadow-sm'
                      : 'border border-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPageTasks(p => Math.min(totalPagesTasks, p + 1))}
                  disabled={currentPageTasks === totalPagesTasks}
                  className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6">
          {loadingRequests ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#be0919]" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 font-light">No task requests found.</div>
          ) : (
            <div className="overflow-x-auto custom-red-scrollbar-h pb-2 mt-12">
              <table className="w-full text-left border-collapse min-w-[1250px]">
                <thead>
                  <tr className="border-b border-neutral-900 text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                    <th className="pb-4 pr-6 font-semibold">Requested By</th>
                    <th className="pb-4 pr-6 font-semibold">Assignee</th>
                    <th className="pb-4 pr-6 font-semibold">Subject</th>
                    <th className="pb-4 pr-6 font-semibold">Priority</th>
                    <th className="pb-4 pr-6 font-semibold">Due Date</th>
                    <th className="pb-4 pr-6 font-semibold">Status</th>
                    <th className="pb-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-sm font-normal text-neutral-300">
                  {paginatedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-950/30 transition-colors">
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-medium text-sm text-neutral-400 shrink-0">
                            {req.assignedBy?.profile?.pictureUrl ? (
                              <img src={req.assignedBy.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{(req.assignedBy?.profile?.fullName || 'U').charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{req.assignedBy?.profile?.fullName || 'No Name'}</p>
                            <p className="text-xs text-neutral-500 font-normal mt-0.5">{req.assignedBy?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-medium text-sm text-neutral-400 shrink-0">
                            {req.assignedTo?.profile?.pictureUrl ? (
                              <img src={req.assignedTo.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{(req.assignedTo?.profile?.fullName || 'U').charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{req.assignedTo?.profile?.fullName || 'No Name'}</p>
                            <p className="text-xs text-neutral-500 font-normal mt-0.5">{req.assignedTo?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-6 max-w-[200px]">
                        <div>
                          <p className="font-medium text-white text-sm truncate">{req.subject}</p>
                          <p className="text-xs text-neutral-500 font-normal mt-0.5 truncate">{req.description}</p>
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded font-medium text-xs uppercase border ${req.priority === 'High'
                          ? 'bg-[#be0919]/10 text-[#ff4d5a] border-[#be0919]/20'
                          : req.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <div>
                          <p className="text-white text-sm font-normal">{req.dueDate}</p>
                          {req.dueTime && <p className="text-xs text-neutral-500 font-normal mt-0.5">{req.dueTime}</p>}
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <div>
                          <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-medium text-xs uppercase tracking-wider ${req.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : req.status === 'REJECTED'
                              ? 'bg-[#be0919]/15 text-[#ff4d5a] border border-[#be0919]/20'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                            }`}>
                            {req.status}
                          </span>
                          {req.status === 'REJECTED' && req.rejectionReason && (
                            <p className="text-[11px] text-[#ff4d5a] font-normal mt-1 max-w-[150px] truncate" title={req.rejectionReason}>
                              Reason: {req.rejectionReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          {req.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleApproveRequest(req.id)}
                                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded transition-all cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                className="px-3.5 py-1.5 bg-[#be0919] hover:bg-[#990714] text-white font-medium text-xs rounded transition-all cursor-pointer shadow-[0_2px_8px_rgba(190,9,25,0.25)]"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full font-medium text-xs uppercase tracking-wider text-white border border-white bg-transparent">
                              Processed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Section */}
          {requests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-neutral-900 pt-5">
              <p className="text-xs text-neutral-500 font-light flex items-center">
                Showing
                <span className="text-neutral-300 font-normal mx-1.5">{startIndexRequests + 1}</span>
                to
                <span className="text-neutral-300 font-normal mx-1.5">
                  {Math.min(startIndexRequests + itemsPerPage, requests.length)}
                </span>
                of
                <span className="text-neutral-300 font-normal ml-1.5">{requests.length}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageRequests(p => Math.max(1, p - 1))}
                  disabled={currentPageRequests === 1}
                  className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPagesRequests }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPageRequests(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-normal transition-all duration-200 cursor-pointer ${currentPageRequests === page
                        ? 'bg-[#be0919] text-white shadow-sm'
                        : 'border border-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPageRequests(p => Math.min(totalPagesRequests, p + 1))}
                  disabled={currentPageRequests === totalPagesRequests}
                  className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}
