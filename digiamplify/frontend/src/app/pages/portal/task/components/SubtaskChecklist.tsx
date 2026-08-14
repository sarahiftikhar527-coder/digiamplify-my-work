'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, CheckCircle2, ListChecks } from 'lucide-react';

interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
}

interface SubtaskChecklistProps {
  taskId: string;
  subtasks: Subtask[];
  onSubtasksUpdated: () => void;
  readOnly?: boolean;
}

export default function SubtaskChecklist({
  taskId,
  subtasks = [],
  onSubtasksUpdated,
  readOnly = false
}: SubtaskChecklistProps) {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isAdding) return;

    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle.trim() })
      });

      if (res.ok) {
        setNewTitle('');
        onSubtasksUpdated();
      }
    } catch (err) {
      console.error('Failed to add subtask:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
    if (readOnly) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !currentStatus })
      });

      if (res.ok) {
        onSubtasksUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (readOnly) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        onSubtasksUpdated();
      }
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  return (
    <div className="space-y-4 bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-5 shadow-lg">
      
      {/* Subtasks Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ListChecks className="w-4 h-4 text-[#be0919]" />
          <h4 className="text-sm font-bold text-white tracking-wide">Subtasks Checklist</h4>
        </div>
        {totalCount > 0 && (
          <span className="text-xs font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
            {completedCount}/{totalCount} Completed ({progressPercent}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
          <div
            className="bg-gradient-to-r from-[#be0919] to-red-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {subtasks.length === 0 ? (
          <div className="text-xs text-neutral-500 py-3 text-center border border-dashed border-neutral-900 rounded-xl">
            No subtasks created yet.
          </div>
        ) : (
          subtasks.map((st) => (
            <div
              key={st.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                st.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-neutral-400'
                  : 'bg-[#121212] border-neutral-850 hover:border-neutral-800 text-white'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleSubtask(st.id, st.completed)}
                disabled={readOnly}
                className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer focus:outline-none"
              >
                {st.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-neutral-500 hover:text-white shrink-0" />
                )}
                <span className={`text-xs font-medium truncate ${st.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                  {st.title}
                </span>
              </button>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete subtask"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Subtask Input */}
      {!readOnly && (
        <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add new subtask item..."
            className="flex-1 bg-[#141414] border border-neutral-800 rounded-xl py-2 px-3.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || isAdding}
            className="px-3.5 py-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      )}

    </div>
  );
}
