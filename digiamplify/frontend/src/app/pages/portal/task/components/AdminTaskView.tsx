import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Download, AlertCircle, FileText, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import CreateTaskModal from './CreateTaskModal';

export default function AdminTaskView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setFilteredTasks(data);
        calculateStats(data);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = tasks.filter(task => {
      const subject = task.subject?.toLowerCase() || '';
      const name = task.assignedTo?.profile?.fullName?.toLowerCase() || '';
      const email = task.assignedTo?.email?.toLowerCase() || '';
      return subject.includes(query) || name.includes(query) || email.includes(query);
    });
    setFilteredTasks(filtered);
  }, [searchQuery, tasks]);

  const calculateStats = (taskList: any[]) => {
    const total = taskList.length;
    const pending = taskList.filter(t => t.status === 'PENDING').length;
    const completed = taskList.filter(t => t.status === 'COMPLETED').length;
    setStats({ total, pending, completed });
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

  const handleDownload = (fileName: string, fileContent: string) => {
    const link = document.createElement('a');
    link.href = fileContent;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="flex flex-col select-none">
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

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6">
        <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 max-w-md mb-6 focus-within:border-neutral-700 transition-all">
          <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by subject or assignee name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs w-full font-light"
          />
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                  <th className="pb-4">Assignee</th>
                  <th className="pb-4">Subject</th>
                  <th className="pb-4">Priority</th>
                  <th className="pb-4">Due Date</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-sm font-light text-neutral-300">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-neutral-950/30 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-sm text-neutral-400 shrink-0">
                          {task.assignedTo?.profile?.pictureUrl ? (
                            <img src={task.assignedTo.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span>{(task.assignedTo?.profile?.fullName || 'U').charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{task.assignedTo?.profile?.fullName || 'No Name'}</p>
                          <p className="text-xs text-neutral-500 font-light mt-0.5">{task.assignedTo?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 max-w-[200px]">
                      <div>
                        <p className="font-semibold text-white text-sm truncate">{task.subject}</p>
                        <p className="text-xs text-neutral-500 font-light mt-0.5 truncate">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded font-semibold text-xs uppercase border ${
                        task.priority === 'High' 
                          ? 'bg-[#be0919]/10 text-[#ff4d5a] border-[#be0919]/20' 
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div>
                        <p className="text-white text-sm">{task.dueDate}</p>
                        {task.dueTime && <p className="text-xs text-neutral-500 mt-0.5">{task.dueTime}</p>}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                        task.status === 'COMPLETED' 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}
