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
    await Promise.all([fetchTasks(), fetchActivities()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateStats = (taskList: any[]) => {
    const total = taskList.length;
    const completed = taskList.filter(t => t.status.toUpperCase() === 'COMPLETED' || t.status.toUpperCase() === 'FINISHED').length;
    const ongoing = taskList.filter(t => t.status.toUpperCase() === 'ONGOING' || t.status.toUpperCase() === 'PENDING').length;
    
    const today = new Date();
    today.setHours(0,0,0,0);
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
        }}
      />
    </div>
  );
}

