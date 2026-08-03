import React, { useState, useEffect } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import TaskStatsCards from './employee/TaskStatsCards';
import TaskTable from './employee/TaskTable';
import TaskAnalytics from './employee/TaskAnalytics';
import TaskActivityLog from './employee/TaskActivityLog';
import PriorityBreakdown from './employee/PriorityBreakdown';
import UpdateTaskModal from './employee/UpdateTaskModal';
import CreateTaskModal from './CreateTaskModal';

export default function EmployeeTaskView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'tasks' | 'requests' | 'assigned'>('tasks');
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    ongoing: 0,
    overdue: 0
  });

  const [currentPageRequests, setCurrentPageRequests] = useState(1);
  const [currentPageAssigned, setCurrentPageAssigned] = useState(1);
  const itemsPerPage = 5;

  const totalPagesRequests = Math.max(1, Math.ceil(requests.length / itemsPerPage));
  const startIndexRequests = (currentPageRequests - 1) * itemsPerPage;
  const paginatedRequests = requests.slice(startIndexRequests, startIndexRequests + itemsPerPage);

  const tasksAssignedByMe = tasks.filter(t => t.assignedById === currentUser?.id && t.assignedToId !== currentUser?.id);
  const totalPagesAssigned = Math.max(1, Math.ceil(tasksAssignedByMe.length / itemsPerPage));
  const startIndexAssigned = (currentPageAssigned - 1) * itemsPerPage;
  const paginatedAssigned = tasksAssignedByMe.slice(startIndexAssigned, startIndexAssigned + itemsPerPage);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
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

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTasks(), fetchActivities(), fetchRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
    loadData();

    const interval = setInterval(() => {
      fetchTasks();
      fetchActivities();
      fetchRequests(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculateStats = (taskList: any[]) => {
    const userStr = localStorage.getItem('user');
    let myId = currentUser?.id;
    if (!myId && userStr) {
      try {
        myId = JSON.parse(userStr).id;
      } catch (e) {
        console.error(e);
      }
    }

    const myTasks = myId ? taskList.filter(t => t.assignedToId === myId) : taskList;
    const total = myTasks.length;
    const completed = myTasks.filter(t => t.status.toUpperCase() === 'COMPLETED' || t.status.toUpperCase() === 'FINISHED').length;
    const ongoing = myTasks.filter(t => t.status.toUpperCase() === 'ONGOING' || t.status.toUpperCase() === 'PENDING').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = myTasks.filter(t => {
      const isFinished = t.status.toUpperCase() === 'COMPLETED' || t.status.toUpperCase() === 'FINISHED';
      return !isFinished && t.dueDate && new Date(t.dueDate) < today;
    }).length;

    setStats({ total, completed, ongoing, overdue });
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh all task metrics
        await Promise.all([fetchTasks(), fetchActivities()]);
      } else {
        alert('Failed to update task status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenUpdateModal = (task: any) => {
    setSelectedTask(task);
    setIsUpdateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#be0919]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-8 text-center text-xs text-neutral-500 font-light">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col select-none space-y-6">
      <style>{`
        .custom-red-scrollbar-h::-webkit-scrollbar {
          height: 6px;
        }
        .custom-red-scrollbar-h::-webkit-scrollbar-track {
          background: #050505;
          border-radius: 8px;
        }
        .custom-red-scrollbar-h::-webkit-scrollbar-thumb {
          background: #be0919;
          border-radius: 8px;
        }
        .custom-red-scrollbar-h::-webkit-scrollbar-thumb:hover {
          background: #990714;
        }
      `}</style>
      {/* Title, Stats Cards & Today's Progress in one integrated line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-4">
        {/* Left Side: Title and the 4 Stats Cards */}
        <div className="lg:col-span-9 flex flex-col justify-between h-full">
          <div className="mb-4">
            <h1 className="text-3xl font-semibold text-white tracking-wide">My Tasks</h1>
            <p className="text-sm text-white font-light mt-3.5">Manage your tasks and stay productive.</p>
          </div>
          <div className="mt-8 w-full">
            <TaskStatsCards stats={stats} layout="cards-only" />
          </div>
        </div>

        {/* Right Side: Circular Gauge Progress Circle */}
        <div className="lg:col-span-3 flex justify-center lg:justify-end">
          <TaskStatsCards stats={stats} layout="circle-only" />
        </div>
      </div>

      {/* Switcher Tab */}
      <div className="flex items-center bg-[#050505] p-1 rounded-lg border border-neutral-900 w-fit">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'tasks'
            ? 'bg-[#be0919] text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
            }`}
        >
          My Tasks
        </button>
        <button
          onClick={() => { setActiveTab('assigned'); setCurrentPageAssigned(1); }}
          className={`px-5 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'assigned'
            ? 'bg-[#be0919] text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
            }`}
        >
          Assigned Tasks
        </button>
        <button
          onClick={() => { setActiveTab('requests'); setCurrentPageRequests(1); }}
          className={`px-5 py-2.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'requests'
            ? 'bg-[#be0919] text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
            }`}
        >
          My Requests
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <>
          {/* Main Grid: Table & Task Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TaskTable
                tasks={tasks.filter(t => t.assignedToId === currentUser?.id)}
                onUpdateStatus={handleUpdateStatus}
                onOpenUpdateModal={handleOpenUpdateModal}
                onAddTaskClick={() => setIsCreateModalOpen(true)}
              />
            </div>
            <div className="lg:col-span-5">
              <TaskAnalytics tasks={tasks.filter(t => t.assignedToId === currentUser?.id)} />
            </div>
          </div>

          {/* Secondary Grid: Recently Updated Tasks & Priority Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TaskActivityLog activities={activities} />
            </div>
            <div className="lg:col-span-5">
              <PriorityBreakdown tasks={tasks.filter(t => t.assignedToId === currentUser?.id)} />
            </div>
          </div>
        </>
      ) : activeTab === 'assigned' ? (
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 relative">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-5 mb-6">
            <h2 className="text-xl font-bold text-white tracking-wide">Assigned Tasks</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#be0919] hover:bg-[#990714] text-white px-5 py-2.5 rounded-lg text-xs font-normal transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(190,9,25,0.25)]"
            >
              + Create Task Request
            </button>
          </div>

          <div className="overflow-x-auto min-h-[300px] custom-red-scrollbar-h pb-2">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-neutral-900 text-[11px] font-normal text-neutral-500 uppercase tracking-wider">
                  <th className="pb-3 pl-4 font-normal">Task Details</th>
                  <th className="pb-3 font-normal w-32 pr-6">Priority</th>
                  <th className="pb-3 font-normal w-56 pr-6">Assigned To</th>
                  <th className="pb-3 font-normal w-44 pr-6">Due Date</th>
                  <th className="pb-3 font-normal w-36 pr-6">Progress</th>
                  <th className="pb-3 pr-4 font-normal w-36">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-sm font-light text-neutral-300">
                {paginatedAssigned.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-neutral-500 font-light font-normal">
                      No assigned tasks found.
                    </td>
                  </tr>
                ) : (
                  paginatedAssigned.map(task => {
                    const assignedToName = task.assignedTo?.profile?.fullName || task.assignedTo?.email || 'Employee';
                    const assignedToAvatar = task.assignedTo?.profile?.pictureUrl;
                    
                    const getStatusStylesLocal = (status: string) => {
                      const s = status.toUpperCase();
                      if (s === 'COMPLETED' || s === 'FINISHED') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      if (s === 'DELAYED') return 'bg-[#be0919]/10 text-[#ff4d5a] border border-[#be0919]/20';
                      if (s === 'PENDING') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                      if (s === 'ONGOING') return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                      if (s === 'CANCELLED') return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                      return 'bg-neutral-900 text-neutral-400 border border-neutral-800';
                    };

                    const getStatusLabelLocal = (status: string) => {
                      const s = status.toUpperCase();
                      if (s === 'COMPLETED' || s === 'FINISHED') return 'Finished';
                      if (s === 'DELAYED') return 'Delayed';
                      if (s === 'PENDING') return 'Pending';
                      if (s === 'ONGOING') return 'Ongoing';
                      if (s === 'CANCELLED') return 'Cancelled';
                      return status;
                    };

                    const getPriorityColorLocal = (priority: string) => {
                      const p = priority.toLowerCase();
                      if (p === 'high') return 'bg-[#ff4d5a]';
                      if (p === 'medium') return 'bg-amber-500';
                      return 'bg-emerald-500';
                    };

                    return (
                      <tr key={task.id} className="hover:bg-neutral-950/40 transition-all font-normal">
                        <td className="py-4 pl-4 pr-6 max-w-[260px]">
                          <div>
                            <p className="font-normal text-[15px] text-white truncate">{task.subject}</p>
                            <p className="text-[13px] text-neutral-500 mt-1 line-clamp-1 font-normal">
                              {task.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 pr-6 w-32">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColorLocal(task.priority)}`} />
                            <span className="text-sm text-neutral-300 font-normal">{task.priority}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-6 w-56">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden text-[10px] font-normal text-neutral-400 shrink-0">
                              {assignedToAvatar ? (
                                <img src={assignedToAvatar} alt={assignedToName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{assignedToName.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-neutral-300 font-normal truncate max-w-[150px]">{assignedToName}</p>
                              <p className="text-xs text-neutral-500 font-normal truncate max-w-[150px]">{task.assignedTo?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-6 w-44">
                          <span className="text-sm text-neutral-300 font-normal">{task.dueDate}</span>
                          {task.dueTime && <span className="block text-xs text-neutral-500 font-normal mt-0.5">{task.dueTime}</span>}
                        </td>
                        <td className="py-4 pr-6 w-36">
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
                        <td className="py-4 pr-4 w-36">
                          <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-normal text-xs uppercase tracking-wider ${getStatusStylesLocal(task.status)}`}>
                            {getStatusLabelLocal(task.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {tasksAssignedByMe.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-neutral-900 pt-5">
              <p className="text-xs text-neutral-500 font-light flex items-center">
                Showing
                <span className="text-neutral-300 font-normal mx-1.5">{startIndexAssigned + 1}</span>
                to
                <span className="text-neutral-300 font-normal mx-1.5">
                  {Math.min(startIndexAssigned + itemsPerPage, tasksAssignedByMe.length)}
                </span>
                of
                <span className="text-neutral-300 font-normal ml-1.5">{tasksAssignedByMe.length}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageAssigned(p => Math.max(1, p - 1))}
                  disabled={currentPageAssigned === 1}
                  className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPagesAssigned }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPageAssigned(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-normal transition-all duration-200 cursor-pointer ${
                      currentPageAssigned === page
                        ? 'bg-[#be0919] text-white shadow-sm'
                        : 'border border-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPageAssigned(p => Math.min(totalPagesAssigned, p + 1))}
                  disabled={currentPageAssigned === totalPagesAssigned}
                  className="p-2 border border-neutral-900 rounded-lg text-neutral-400 hover:text-white disabled:opacity-40 disabled:hover:text-neutral-400 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 relative">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-5 mb-6">
            <h2 className="text-xl font-bold text-white tracking-wide">Task Creation Requests</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#be0919] hover:bg-[#990714] text-white px-5 py-2.5 rounded-lg text-xs font-normal transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(190,9,25,0.25)]"
            >
              + Add Task Request
            </button>
          </div>

          {loadingRequests ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#be0919]" />
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[300px] custom-red-scrollbar-h pb-2">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-neutral-900 text-[11px] font-normal text-neutral-500 uppercase tracking-wider">
                    <th className="pb-3 pl-4 font-normal">Task Details</th>
                    <th className="pb-3 font-normal w-28">Priority</th>
                    <th className="pb-3 font-normal w-40">Assigned To</th>
                    <th className="pb-3 font-normal w-36">Due Date</th>
                    <th className="pb-3 pr-4 font-normal w-36">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-sm font-light text-neutral-300">
                  {paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-neutral-500 font-light font-normal">
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((req) => {
                      const assignedToName = req.assignedTo?.profile?.fullName || 'Employee';
                      const assignedToAvatar = req.assignedTo?.profile?.pictureUrl;

                      return (
                        <tr key={req.id} className="hover:bg-neutral-950/40 transition-all font-normal">
                          <td className="py-4 pl-4 pr-3 max-w-[220px]">
                            <div>
                              <p className="font-semibold text-white truncate">{req.subject}</p>
                              <p className="text-xs text-neutral-500 mt-1 line-clamp-1 font-normal">
                                {req.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 pr-3 w-28">
                            <span className="text-xs text-neutral-300 font-normal">{req.priority}</span>
                          </td>
                          <td className="py-4 pr-3 w-40">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden text-[10px] font-normal text-neutral-400 shrink-0">
                                {assignedToAvatar ? (
                                  <img src={assignedToAvatar} alt={assignedToName} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{assignedToName.charAt(0)}</span>
                                )}
                              </div>
                              <span className="text-xs text-neutral-300 font-normal">{assignedToName}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-3 w-36">
                            <span className="text-xs text-neutral-300 font-normal">{req.dueDate}</span>
                          </td>
                          <td className="py-4 pr-4 w-36">
                            <div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${req.status === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : req.status === 'REJECTED'
                                  ? 'bg-[#be0919]/15 text-[#ff4d5a] border-[#be0919]/20'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                }`}>
                                {req.status}
                              </span>
                              {req.status === 'REJECTED' && req.rejectionReason && (
                                <p className="text-[11px] text-[#ff4d5a] mt-1 font-normal break-words whitespace-normal" title={req.rejectionReason}>
                                  Reason: {req.rejectionReason}
                                </p>
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
                    className={`w-8 h-8 rounded-lg text-xs font-normal transition-all duration-200 cursor-pointer ${
                      currentPageRequests === page
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

      {/* Inline Modal for status and progress updating */}
      <UpdateTaskModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        task={selectedTask}
        onTaskUpdated={() => {
          fetchTasks();
          fetchActivities();
        }}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
          fetchTasks();
          fetchActivities();
          fetchRequests();
        }}
      />
    </div>
  );
}

