import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Download, FileText, AlertCircle, RefreshCw, UploadCloud, Link as LinkIcon } from 'lucide-react';

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
  onTaskUpdated: () => void;
}

export default function UpdateTaskModal({ isOpen, onClose, task, onTaskUpdated }: UpdateTaskModalProps) {
  const [status, setStatus] = useState('ONGOING');
  const [progress, setProgress] = useState(0);
  const [completionUrl, setCompletionUrl] = useState('');
  const [completionAttachments, setCompletionAttachments] = useState<{ name: string; content: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setCompletionAttachments((prev) => [...prev, { name: file.name, content: reader.result as string }]);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (task) {
      setStatus(task.status.toUpperCase());
      setProgress(task.progress || 0);
      setCompletionUrl(task.completionUrl || '');
      
      if (task.completionFileName && task.completionFileContent) {
        if (task.completionFileName.trim().startsWith('[') && task.completionFileContent.trim().startsWith('[')) {
          try {
            const names = JSON.parse(task.completionFileName);
            const contents = JSON.parse(task.completionFileContent);
            if (Array.isArray(names) && Array.isArray(contents)) {
              setCompletionAttachments(names.map((name, index) => ({
                name,
                content: contents[index] || ''
              })));
            }
          } catch (e) {
            setCompletionAttachments([{ name: task.completionFileName, content: task.completionFileContent }]);
          }
        } else {
          setCompletionAttachments([{ name: task.completionFileName, content: task.completionFileContent }]);
        }
      } else {
        setCompletionAttachments([]);
      }
      setError('');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleDownload = (fileName: string, fileContent: string) => {
    const link = document.createElement('a');
    link.href = fileContent;
    link.download = fileName;
    link.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hasAttachment = completionAttachments.length > 0 || completionUrl.trim() !== '';
    if (status === 'COMPLETED' && !hasAttachment) {
      setError('An attachment (document or URL link) is mandatory to set task status to Finished.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      let finalFileName = null;
      let finalFileContent = null;

      if (completionAttachments.length > 0) {
        finalFileName = JSON.stringify(completionAttachments.map(a => a.name));
        finalFileContent = JSON.stringify(completionAttachments.map(a => a.content));
      }

      const res = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          progress,
          completionFileName: finalFileName,
          completionFileContent: finalFileContent,
          completionUrl: completionUrl || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      onTaskUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority.toLowerCase();
    if (p === 'high') {
      return 'bg-[#be0919]/10 text-[#ff4d5a] border-[#be0919]/20';
    }
    if (p === 'medium') {
      return 'bg-amber-500/10 text-amber-450 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex justify-center items-start overflow-y-auto p-4 md:p-10 backdrop-blur-sm">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-8 max-w-xl w-full relative animate-fadeIn shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getPriorityBadge(task.priority)}`}>
              {task.priority} Priority
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">{task.subject}</h2>
          <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed">
            Task assigned by <span className="font-semibold text-neutral-300">{task.assignedBy?.profile?.fullName || 'Admin'}</span>
          </p>
        </div>

        {/* Description Section */}
        <div className="bg-[#050505] border border-neutral-900 rounded-lg p-4 mb-6">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Description</span>
          <p className="text-xs text-neutral-300 font-light leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        {/* Info Rows */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4.5 h-4.5 text-[#be0919]" />
            <div>
              <span className="text-[9px] text-neutral-500 font-medium block">DUE DATE</span>
              <span className="text-xs text-white font-semibold">{task.dueDate}</span>
            </div>
          </div>
          {task.dueTime && (
            <div className="flex items-center gap-2.5">
              <Clock className="w-4.5 h-4.5 text-[#be0919]" />
              <div>
                <span className="text-[9px] text-neutral-500 font-medium block">DUE TIME</span>
                <span className="text-xs text-white font-semibold">{task.dueTime}</span>
              </div>
            </div>
          )}
        </div>

        {/* Attachment Section */}
        {task.fileName && task.fileContent && (
          <div className="space-y-2 mb-6">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Attached Files</span>
            {(() => {
              const getAttachments = (n: string, c: string) => {
                if (n.trim().startsWith('[') && c.trim().startsWith('[')) {
                  try {
                    const names = JSON.parse(n);
                    const contents = JSON.parse(c);
                    if (Array.isArray(names) && Array.isArray(contents)) {
                      return names.map((name, index) => ({
                        name,
                        content: contents[index] || ''
                      }));
                    }
                  } catch (e) {}
                }
                return [{ name: n, content: c }];
              };
              return getAttachments(task.fileName, task.fileContent).map((file, idx) => (
                <div key={idx} className="bg-[#050505] border border-neutral-900 rounded-lg p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-[#be0919] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs text-white truncate block font-medium">{file.name}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(file.name, file.content)}
                    className="p-2 bg-neutral-900 border border-neutral-850 hover:bg-[#be0919]/10 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer shrink-0"
                    title={`Download ${file.name}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ));
            })()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-neutral-900 pt-6 space-y-5">
          {/* Status Lock Notice */}
          {(task.status.toUpperCase() === 'COMPLETED' || task.status.toUpperCase() === 'FINISHED') && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-light flex items-center gap-2 animate-fadeIn mb-2 select-none">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>This task has been completed/finished and its status is locked.</span>
            </div>
          )}

          {/* Status selector */}
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Update Status</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'ONGOING', label: 'Ongoing' },
                { key: 'DELAYED', label: 'Delayed' },
                { key: 'COMPLETED', label: 'Finished' },
                { key: 'CANCELLED', label: 'Cancelled' }
              ].map(opt => {
                const isCompletedTask = task.status.toUpperCase() === 'COMPLETED' || task.status.toUpperCase() === 'FINISHED';
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => {
                      setStatus(opt.key);
                      if (opt.key === 'COMPLETED') {
                        setProgress(100);
                      }
                    }}
                    disabled={isCompletedTask}
                    className={`py-2 px-1 text-center text-xs font-semibold rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      status === opt.key
                        ? 'bg-[#be0919]/15 border-[#be0919] text-[#ff4d5a] disabled:opacity-100 disabled:bg-[#be0919]/15 disabled:border-[#be0919] disabled:text-[#ff4d5a]'
                        : 'bg-[#050505] border-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Update Progress</label>
              <span className="text-xs font-bold text-white">{progress}%</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                disabled={task.status.toUpperCase() === 'COMPLETED' || task.status.toUpperCase() === 'FINISHED'}
                className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#be0919] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Completion Section */}
          {status === 'COMPLETED' && (
            <div className="space-y-4 border-t border-neutral-900 pt-4 animate-fadeIn">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Completion Proof (Required - Document or URL Link)
                </span>
                
                {/* URL Input */}
                <div className="mb-3">
                  <label className="text-[11px] text-neutral-500 font-semibold block mb-1.5">COMPLETION URL LINK</label>
                  <input
                    type="url"
                    placeholder="https://example.com/project-link"
                    value={completionUrl}
                    onChange={(e) => setCompletionUrl(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-900 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-750 outline-none focus:border-neutral-750 transition-all font-normal"
                  />
                </div>

                {/* File Upload Dropzone */}
                <div>
                  <label className="text-[11px] text-neutral-500 font-semibold block mb-1.5">UPLOAD DOCUMENTS</label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-neutral-900 hover:border-[#be0919]/50 rounded-xl p-6 text-center cursor-pointer transition-all bg-[#050505]/50 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-neutral-600 group-hover:text-[#be0919] mx-auto mb-2.5 transition-all" />
                    <p className="text-sm text-neutral-300 font-normal">
                      Drag & drop your files here or <span className="text-[#be0919] hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-neutral-550 mt-1.5 font-normal">Max file size 10MB</p>
                  </div>
                </div>

                {/* Selected Attachments List */}
                {completionAttachments.length > 0 && (
                  <div className="mt-3.5 space-y-2">
                    {completionAttachments.map((file, idx) => (
                      <div key={idx} className="bg-[#050505] border border-neutral-900 rounded-lg p-2.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-[#be0919] shrink-0" />
                          <span className="text-xs text-white truncate font-normal">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCompletionAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="text-[10px] text-[#ff4d5a] hover:underline font-normal cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-light flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 px-5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-xs font-bold rounded-lg border border-neutral-850 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-lg transition-all shadow-[0_4px_12px_rgba(190,9,25,0.25)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Update</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
