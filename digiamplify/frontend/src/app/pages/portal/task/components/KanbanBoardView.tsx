'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle, 
  User, 
  Calendar, 
  ListChecks, 
  Paperclip, 
  GripVertical,
  ChevronDown,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { formatDateStandard } from '@/utils/dateUtils';

interface KanbanBoardViewProps {
  tasks: any[];
  onSelectTask: (task: any) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: string) => Promise<void> | void;
  onPreviewAttachment?: (fileName: string, fileContent: string) => void;
  onAddTaskClick?: () => void;
}

export default function KanbanBoardView({
  tasks = [],
  onSelectTask,
  onUpdateTaskStatus,
  onPreviewAttachment,
  onAddTaskClick
}: KanbanBoardViewProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{ [taskId: string]: boolean }>({});
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

  const columns = [
    {
      id: 'PENDING',
      title: 'To Do / Pending',
      color: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: Clock,
      tasks: tasks.filter(t => t.status === 'PENDING' || t.status === 'TODO')
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      color: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: PlayCircle,
      tasks: tasks.filter(t => t.status === 'IN_PROGRESS')
    },
    {
      id: 'REVIEW',
      title: 'Under Review',
      color: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: AlertCircle,
      tasks: tasks.filter(t => t.status === 'REVIEW')
    },
    {
      id: 'COMPLETED',
      title: 'Completed',
      color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      tasks: tasks.filter(t => t.status === 'COMPLETED' || t.status === 'FINISHED')
    }
  ];

  const getPriorityBadge = (priority: string) => {
    const p = (priority || '').toUpperCase();
    if (p === 'URGENT') return 'bg-red-500/10 text-red-400 border-red-500/30';
    if (p === 'HIGH') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (p === 'MEDIUM') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-neutral-800 text-neutral-400 border-neutral-700';
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOverColumn !== colId) {
      setDraggedOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedOverColumn(null);
    setDraggedTaskId(null);

    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === targetColumnId) return; // same status, no change

    if (onUpdateTaskStatus) {
      await onUpdateTaskStatus(taskId, targetColumnId);
    } else {
      // Fallback direct API call
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: targetColumnId })
        });
        window.location.reload();
      } catch (err) {
        console.error('Drag update error:', err);
      }
    }
  };

  const toggleSubtasksView = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setExpandedSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn pb-6 select-none">
      {columns.map((col) => {
        const IconComponent = col.icon;
        const isColumnHovered = draggedOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl bg-[#090909] border transition-all duration-300 overflow-hidden shadow-2xl min-h-[550px] ${
              isColumnHovered
                ? 'border-[#be0919] bg-[#be0919]/5 shadow-[0_0_25px_rgba(190,9,25,0.25)] ring-2 ring-[#be0919]/40 scale-[1.01]'
                : 'border-neutral-900'
            }`}
          >
            {/* ClickUp Header Bar */}
            <div className={`p-4 border-b border-neutral-900 flex items-center justify-between ${col.color}`}>
              <div className="flex items-center gap-2.5">
                <IconComponent className="w-4 h-4" />
                <h3 className="text-sm font-bold tracking-wide">{col.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.badgeBg}`}>
                  {col.tasks.length}
                </span>
                {onAddTaskClick && (
                  <button
                    onClick={onAddTaskClick}
                    className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800"
                    title="Add task to column"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Drag & Drop Column Cards Body */}
            <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 max-h-[calc(100vh-280px)]">
              {col.tasks.length === 0 ? (
                <div
                  className={`h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all ${
                    isColumnHovered
                      ? 'border-[#be0919] bg-[#be0919]/10 text-white font-bold'
                      : 'border-neutral-900 text-neutral-600 font-medium'
                  }`}
                >
                  <IconComponent className="w-6 h-6 mb-2 opacity-50 text-neutral-500" />
                  <span className="text-xs">
                    {isColumnHovered ? 'Drop Task Here' : 'Drag & drop tasks here'}
                  </span>
                </div>
              ) : (
                col.tasks.map((task) => {
                  const isBeingDragged = draggedTaskId === task.id;
                  const subtasks = task.subtasks || [];
                  const subtasksCount = subtasks.length;
                  const completedSubtasks = subtasks.filter((s: any) => s.completed).length;
                  const isSubtasksExpanded = !!expandedSubtasks[task.id];

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectTask(task)}
                      className={`bg-[#111111] hover:bg-[#161616] border border-neutral-850 hover:border-neutral-750 rounded-xl p-4 transition-all duration-200 cursor-grab active:cursor-grabbing shadow-md group relative space-y-3 ${
                        isBeingDragged ? 'opacity-30 scale-95 border-dashed border-[#be0919]' : ''
                      }`}
                    >
                      {/* Top Bar: Priority Badge, Grip Handle & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                            {task.priority || 'Normal'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {task.fileName && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onPreviewAttachment && task.fileContent) {
                                  onPreviewAttachment(task.fileName, task.fileContent);
                                }
                              }}
                              className="p-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
                              title="Preview Attachment"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <h4 className="text-xs font-bold text-white tracking-wide line-clamp-2 leading-relaxed group-hover:text-red-400 transition-colors">
                        {task.subject}
                      </h4>

                      {/* Description Excerpt */}
                      {task.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-2 font-normal leading-normal">
                          {task.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-semibold">
                          <span>Progress</span>
                          <span>{task.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                          <div
                            className="bg-gradient-to-r from-[#be0919] to-red-500 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Interactive Subtasks Dropdown */}
                      {subtasksCount > 0 && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={(e) => toggleSubtasksView(e, task.id)}
                            className="w-full text-left bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-850 p-2 rounded-lg text-[10px] text-neutral-300 font-medium flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <ListChecks className="w-3.5 h-3.5 text-red-500" />
                              <span>{completedSubtasks}/{subtasksCount} Subtasks</span>
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isSubtasksExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {isSubtasksExpanded && (
                            <div className="mt-2 space-y-1.5 bg-[#080808] border border-neutral-850 p-2 rounded-lg max-h-36 overflow-y-auto">
                              {subtasks.map((st: any) => (
                                <div key={st.id} className="flex items-center gap-2 text-[10px]">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.completed ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                                  <span className={`truncate ${st.completed ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer: Assignee Avatar & Due Date */}
                      <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
                        {/* Assignee Avatar */}
                        <div className="flex items-center gap-1.5 max-w-[130px] truncate">
                          <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 overflow-hidden">
                            {task.assignedTo?.profile?.pictureUrl ? (
                              <img src={task.assignedTo.profile.pictureUrl} alt="User" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3 h-3 text-neutral-400" />
                            )}
                          </div>
                          <span className="truncate text-white font-medium text-[10px]">
                            {task.assignedTo?.profile?.fullName || task.assignedTo?.email || 'User'}
                          </span>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-neutral-500 text-[10px]">
                            <Calendar className="w-3 h-3 text-neutral-500" />
                            <span>{formatDateStandard(task.dueDate)}</span>
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
