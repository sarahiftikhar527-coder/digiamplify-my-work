import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
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

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'tasks' | 'requests'>('tasks');
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    ongoing: 0,
    overdue: 0
  });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        calculateStats(data);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error fetching tasks');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Error fetching task requests:', err);
    } finally {
      setLoadingRequests(false);
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
        setActivities(data);
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
    loadData();

    const interval = setInterval(() => {
      fetchTasks();
      fetchActivities();
      fetchRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculateStats = (taskList: any[]) => {
    const total = taskList.length;
    const completed = taskList.filter(t => t.status.toUpperCase() === 'COMPLETED' || t.status.toUpperCase() === 'FINISHED').length;
    const ongoing = taskList.filter(t => t.status.toUpperCase() === 'ONGOING' || t.status.toUpperCase() === 'PENDING').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = taskList.filter(t => {
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
          onClick={() => setActiveTab('requests')}
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
                tasks={tasks}
                onUpdateStatus={handleUpdateStatus}
                onOpenUpdateModal={handleOpenUpdateModal}
                onAddTaskClick={() => setIsCreateModalOpen(true)}
              />
            </div>
            <div className="lg:col-span-5">
              <TaskAnalytics tasks={tasks} />
            </div>
          </div>

          {/* Secondary Grid: Recently Updated Tasks & Priority Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TaskActivityLog activities={activities} />
            </div>
            <div className="lg:col-span-5">
              <PriorityBreakdown tasks={tasks} />
            </div>
          </div>
        </>
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
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-neutral-500 font-light font-normal">
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => {
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
                                  ? 'bg-[#be0919]/15 text-[#ff4d5a] border border-[#be0919]/20'
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

