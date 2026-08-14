import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Download, UploadCloud, Edit, AlertCircle, Flag, ChevronDown, FileText } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmps, setSelectedEmps] = useState<any[]>([]);

  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  
  const [attachments, setAttachments] = useState<{ name: string; content: string }[]>([]);
  const [subtasksList, setSubtasksList] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  const getTodayDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCurrentTimeStr = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/profile/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (isOpen) {
      fetchEmployees();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setSelectedEmps([]);
    setSearchQuery('');
    setSubject('');
    setPriority('High');
    setDescription('');
    setDueDate('');
    setDueTime('');
    setAttachments([]);
    setSubtasksList([]);
    setNewSubtaskInput('');
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError(`File ${file.name} exceeds 10MB limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachments((prev) => [...prev, { name: file.name, content: reader.result as string }]);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        processFile(files[i]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedEmps.length === 0) {
      setError('Please select at least one employee to assign this task.');
      return;
    }
    if (!subject) {
      setError('Please enter a task subject.');
      return;
    }
    if (!description) {
      setError('Please enter a description for the task.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    const todayStr = getTodayDateStr();
    if (dueDate < todayStr) {
      setError('Due date cannot be in the past.');
      return;
    }

    if (dueDate === todayStr && dueTime) {
      const nowTimeStr = getCurrentTimeStr();
      if (dueTime < nowTimeStr) {
        setError('Due time cannot be in the past.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedToIds: selectedEmps.map(emp => emp.id),
          subject,
          priority,
          description,
          dueDate,
          dueTime: dueTime || null,
          fileName: attachments.length > 0 ? JSON.stringify(attachments.map(a => a.name)) : null,
          fileContent: attachments.length > 0 ? JSON.stringify(attachments.map(a => a.content)) : null,
          initialSubtasks: subtasksList
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      alert(data.message || 'Task processed successfully');
      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while creating task');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  let currentUserId: string | null = null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      currentUserId = JSON.parse(storedUser).id || null;
    }
  } catch (e) {
    console.error(e);
  }

  const filteredEmployees = employees.filter(emp => {
    // Only show approved users
    if (emp.status !== 'APPROVED') return false;

    const name = emp.profile?.fullName || '';
    const email = emp.email || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <style>{`
        .custom-red-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-track {
          background: #050505;
          border-radius: 8px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb {
          background: #be0919;
          border-radius: 8px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #990714;
        }
      `}</style>

      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-red-scrollbar relative animate-fadeIn shadow-2xl">
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2.5">
              <Edit className="w-5.5 h-5.5 text-[#be0919]" />
              <span>Create New Task</span>
            </h2>
            <p className="text-xs text-neutral-500 font-light mt-3.5">Add task details and assign to team members or yourself.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-lg text-white transition-all cursor-pointer flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-[#be0919]/10 border border-[#be0919]/30 text-[#ff4d5a] text-xs py-3.5 px-4 rounded-lg mb-6 text-center font-light">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col relative" ref={dropdownRef}>
            <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
              Assign To <span className="text-red-500">*</span>
            </label>
            
            {/* Selected employee chips list */}
            {selectedEmps.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto custom-red-scrollbar pr-1 pb-1">
                {selectedEmps.map(emp => (
                  <div key={emp.id} className="flex items-center gap-1.5 bg-[#be0919]/10 border border-[#be0919]/25 text-white px-3 py-1.5 rounded-full text-xs font-normal animate-fadeIn">
                    <div className="w-4.5 h-4.5 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-[9px] text-neutral-400 shrink-0">
                      {emp.profile?.pictureUrl ? (
                        <img src={emp.profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(emp.profile?.fullName || 'U').charAt(0)}</span>
                      )}
                    </div>
                    <span>{emp.profile?.fullName || emp.email}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedEmps(prev => prev.filter(e => e.id !== emp.id))}
                      className="p-0.5 hover:bg-neutral-800 rounded-full cursor-pointer flex items-center justify-center text-neutral-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 focus-within:border-[#be0919]/50 transition-all">
              <input
                type="text"
                placeholder="Search and select team member(s) or yourself..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="bg-transparent border-none outline-none text-white text-sm w-full font-light"
              />
            </div>

            {showDropdown && (
              <div className="absolute top-full mt-1.5 z-30 w-full bg-[#0c0c0c] border border-neutral-900 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-red-scrollbar">
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmps.some(e => e.id === emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedEmps(prev => prev.filter(e => e.id !== emp.id));
                        } else {
                          setSelectedEmps(prev => [...prev, emp]);
                        }
                      }}
                      className={`px-4 py-3 hover:bg-[#be0919]/10 cursor-pointer flex items-center justify-between border-b border-neutral-900 last:border-none ${
                        isSelected ? 'bg-[#be0919]/5' : ''
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? 'text-[#ff4d5a]' : 'text-white'}`}>
                          {emp.profile?.fullName || 'No Name'}
                        </p>
                        <p className="text-xs text-neutral-500 font-light mt-0.5">{emp.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold text-[#ff4d5a] tracking-wider px-2 py-0.5 bg-[#be0919]/10 rounded border border-[#be0919]/20">
                            Selected
                          </span>
                        )}
                        <span className="text-xs text-neutral-400 font-medium px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800">
                          {emp.profile?.jobTitle || 'Staff'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <p className="p-4 text-center text-xs text-neutral-500 font-light">No employees found.</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 focus-within:border-[#be0919]/50 transition-all">
                <input
                  type="text"
                  placeholder="Enter task subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm w-full font-light"
                />
              </div>
            </div>

            <div className="flex flex-col relative" ref={priorityDropdownRef}>
              <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
                Priority <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                className="flex items-center justify-between bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 focus:border-[#be0919]/50 transition-all w-full text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Flag className={`w-4 h-4 shrink-0 ${
                    priority === 'High' ? 'text-[#ff4d5a]' : priority === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                  }`} />
                  <span className="text-white text-sm font-light">{priority}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
              </button>
              
              {showPriorityDropdown && (
                <div className="absolute top-[80px] left-0 right-0 z-30 bg-[#0c0c0c] border border-neutral-900 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
                  {['High', 'Medium', 'Low'].map((p) => (
                    <div
                      key={p}
                      onClick={() => {
                        setPriority(p);
                        setShowPriorityDropdown(false);
                      }}
                      className="px-4 py-3 hover:bg-[#be0919]/10 cursor-pointer flex items-center gap-2.5 text-white text-sm font-light border-b border-neutral-900 last:border-none"
                    >
                      <Flag className={`w-3.5 h-3.5 shrink-0 ${
                        p === 'High' ? 'text-[#ff4d5a]' : p === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                      }`} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 focus-within:border-[#be0919]/50 transition-all">
              <textarea
                placeholder="Enter description for task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-transparent border-none outline-none text-white text-sm w-full font-light resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 focus-within:border-[#be0919]/50 transition-all relative">
                <Calendar className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                <input
                  type="date"
                  value={dueDate}
                  min={getTodayDateStr()}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm w-full font-light cursor-pointer scheme-dark"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
                Due Time
              </label>
              <div className="flex items-center bg-[#050505] border border-neutral-900 rounded-lg px-4 py-3 focus-within:border-[#be0919]/50 transition-all relative">
                <Clock className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                <input
                  type="time"
                  value={dueTime}
                  min={dueDate === getTodayDateStr() ? getCurrentTimeStr() : undefined}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm w-full font-light cursor-pointer scheme-dark"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
              Attachment
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dotted border-white/60 bg-[#050505] hover:bg-neutral-950/50 rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              
              <UploadCloud className="w-10 h-10 text-neutral-400 mb-3" />
              <p className="text-base font-semibold text-white text-center">Drag & Drop files here</p>
              <p className="text-sm text-neutral-400 mt-2 text-center">
                or <span className="text-[#be0919] hover:underline font-normal">browse files</span> from computer
              </p>
              
              <div className="flex items-center gap-3 mt-5 select-none">
                <span className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded shadow-sm">.PDF</span>
                <span className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded shadow-sm">.DOC</span>
                <span className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded shadow-sm">.PNG</span>
                <span className="px-3.5 py-1.5 bg-white text-black font-bold text-xs rounded shadow-sm">.JPG</span>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 max-w-full">
                {attachments.map((file, idx) => (
                  <div key={idx} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center gap-2 text-xs text-white">
                    <FileText className="w-4.5 h-4.5 text-neutral-450 shrink-0" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachments(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
              Subtasks Checklist (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter subtask title and press Add..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newSubtaskInput.trim()) {
                      setSubtasksList(prev => [...prev, newSubtaskInput.trim()]);
                      setNewSubtaskInput('');
                    }
                  }
                }}
                className="flex-1 bg-[#050505] border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSubtaskInput.trim()) {
                    setSubtasksList(prev => [...prev, newSubtaskInput.trim()]);
                    setNewSubtaskInput('');
                  }
                }}
                className="px-4 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
              >
                + Add Item
              </button>
            </div>

            {subtasksList.length > 0 && (
              <div className="mt-3 space-y-1.5 bg-[#050505] border border-neutral-900 rounded-xl p-3 max-h-40 overflow-y-auto">
                {subtasksList.map((st, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[#101010] border border-neutral-850 rounded-lg text-xs text-white">
                    <span className="truncate max-w-[400px]">{st}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasksList(prev => prev.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-red-400 text-xs px-1.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-8 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-lg transition-all shadow-[0_4px_15px_rgba(190,9,25,0.3)] hover:shadow-[0_4px_20px_rgba(190,9,25,0.45)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
