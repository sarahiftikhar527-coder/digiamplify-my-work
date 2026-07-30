import React from 'react';
import { HelpCircle, ChevronDown, UploadCloud, FileText, X, CheckCircle } from 'lucide-react';

interface EmployeeSupportViewProps {
  subject: string;
  setSubject: (val: string) => void;
  issueType: string;
  setIssueType: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  contactMethod: string;
  setContactMethod: (val: string) => void;
  fileName: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearFile: (e: React.MouseEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  tickets: any[];
  onTicketClick: (ticket: any) => void;
}

export default function EmployeeSupportView({
  subject,
  setSubject,
  issueType,
  setIssueType,
  priority,
  setPriority,
  description,
  setDescription,
  contactMethod,
  setContactMethod,
  fileName,
  handleFileUpload,
  handleClearFile,
  handleDragOver,
  handleDrop,
  onSubmit,
  isLoading,
  tickets,
  onTicketClick
}: EmployeeSupportViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">

      <div className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-lg">

        <form onSubmit={onSubmit} className="space-y-5">

          <div className="flex flex-col">
            <label className="text-sm text-white/90 mb-2.5 font-medium poppins select-none">
              Subject <span className="text-[#be0919] font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="Summary of your issue..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3.5 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 font-light"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col">
              <label className="text-sm text-white/90 mb-2.5 font-medium poppins select-none">
                Issue Category <span className="text-[#be0919] font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3.5 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer font-light"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="HR / Salary Queries">HR / Salary Queries</option>
                  <option value="Attendance / Shift Correction">Attendance / Shift Correction</option>
                  <option value="Hardware / Device Request">Hardware / Device Request</option>
                  <option value="Other Support Issues">Other Support Issues</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-white/90 mb-2.5 font-medium poppins select-none">
                Priority <span className="text-[#be0919] font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3.5 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer font-light"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col">
            <label className="text-sm text-white/90 mb-2.5 font-medium poppins select-none">
              Description <span className="text-[#be0919] font-bold">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Enter description for Problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 resize-none font-light"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-base text-white/90 mb-2.5 font-medium poppins select-none">
              Attachment (Optional)
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full border-2 border-dashed border-neutral-800 rounded-xl bg-[#0c0c0c] hover:border-neutral-700 transition-colors p-7 flex flex-col items-center justify-center cursor-pointer text-center relative"
            >
              <input
                type="file"
                id="support-file"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />

              <div className="w-12 h-12 rounded-full bg-[#be0919]/10 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-[#be0919]" />
              </div>

              {fileName ? (
                <div className="z-10 flex items-center gap-2 max-w-full px-4">
                  <FileText className="w-5 h-5 text-neutral-400 shrink-0" />
                  <span className="text-sm text-white font-medium truncate max-w-[200px]">{fileName}</span>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1 rounded bg-[#0c0c0c] hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-white font-medium tracking-wide">Drag & Drop files here</span>
                  <span className="text-xs text-neutral-500 font-light mt-1.5">
                    or <span className="text-[#be0919] hover:underline font-normal">browse files</span> from computer
                  </span>
                </>
              )}

              <div className="flex gap-2.5 mt-5">
                <span className="text-xs font-bold py-1.5 px-3.5 bg-white text-black/50 rounded-md">.PDF</span>
                <span className="text-xs font-bold py-1.5 px-3.5 bg-white text-black/50 rounded-md">.DOC</span>
                <span className="text-xs font-bold py-1.5 px-3.5 bg-white text-black/50 rounded-md">.PNG</span>
                <span className="text-xs font-bold py-1.5 px-3.5 bg-white text-black/50 rounded-md">.JPG</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-white/90 mb-2.5 font-medium poppins select-none">
              Preferred Contact Method
            </label>
            <div className="relative">
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full bg-[#0c0c0c] border border-white/20 rounded-[12px] py-3.5 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer font-light"
              >
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Portal Chat">Portal Chat</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#be0919] hover:bg-[#990714] disabled:opacity-50 text-white font-bold py-3 px-10 rounded-lg text-sm cursor-pointer shadow-[0_4px_15px_rgba(190,9,25,0.25)] transition-all"
            >
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full bg-black border border-neutral-900 rounded-xl p-6 lg:p-8 shadow-lg">
        <h2 className="text-lg font-bold text-white tracking-wide border-b border-neutral-900 pb-3 mb-6 select-none">
          My Support Tickets
        </h2>

        {isLoading && tickets.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 font-light text-xs select-none">Loading history...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 font-light text-xs select-none">
            No issues reported yet. Your ticket history will display here.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => onTicketClick(t)}
                className="p-4 bg-[#0c0c0c] border border-white/20 hover:border-[#be0919]/50 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-neutral-400 font-light select-none">
                    {new Date(t.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border select-none ${
                    t.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {t.status === 'RESOLVED' ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{t.subject}</h4>
                <p className="text-xs text-neutral-400 truncate mt-1.5">{t.description}</p>

                {t.adminResponse && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-900 flex items-start gap-1.5 text-xs text-neutral-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">Response: {t.adminResponse}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
