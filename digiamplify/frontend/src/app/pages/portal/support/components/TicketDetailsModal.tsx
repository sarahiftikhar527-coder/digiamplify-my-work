import React from 'react';
import { HelpCircle, X, Flag, FileText, Download, Mail, Phone, MessageSquare, CheckCircle, Send } from 'lucide-react';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: any;
  isAdmin: boolean;
  adminResponse: string;
  setAdminResponse: (val: string) => void;
  onSubmitResponse: (e: React.FormEvent) => void;
  isSubmittingResponse: boolean;
  downloadAttachment: (fileName: string, fileContent: string) => void;
}

export default function TicketDetailsModal({
  isOpen,
  onClose,
  selectedTicket,
  isAdmin,
  adminResponse,
  setAdminResponse,
  onSubmitResponse,
  isSubmittingResponse,
  downloadAttachment
}: TicketDetailsModalProps) {
  if (!isOpen || !selectedTicket) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scaleIn">
        
        {}
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-[#050505]">
          <div className="flex items-center gap-2 select-none">
            <HelpCircle className="w-5 h-5 text-[#be0919]" />
            <h3 className="text-base font-bold text-white">Ticket Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-red-scrollbar text-base text-neutral-300 font-light">
          
          {}
          <style dangerouslySetInnerHTML={{__html: `
            .custom-red-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-red-scrollbar::-webkit-scrollbar-track {
              background: #050505;
            }
            .custom-red-scrollbar::-webkit-scrollbar-thumb {
              background: #be0919;
              border-radius: 3px;
            }
            .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #990714;
            }
          `}} />

          {}
          <div className="grid grid-cols-2 gap-4 border-b border-neutral-900 pb-4 select-none">
            <div>
              <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Submitted On</span>
              <span className="text-sm text-white font-medium mt-1 block">
                {new Date(selectedTicket.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Status</span>
              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium mt-1 border ${
                selectedTicket.status === 'RESOLVED' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {selectedTicket.status === 'RESOLVED' ? 'Resolved' : 'Pending'}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Issue Category</span>
              <span className="text-sm text-white font-medium mt-1 block">{selectedTicket.issueType}</span>
            </div>
            <div>
              <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block">Priority</span>
              <span className="text-sm text-white font-medium flex items-center gap-1.5 mt-1">
                <Flag className="w-4 h-4 text-[#be0919]" />
                {selectedTicket.priority}
              </span>
            </div>
          </div>

          {}
          {isAdmin && (
            <div className="border-b border-neutral-900 pb-4">
              <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block mb-2 select-none">Submitted By</span>
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium">{selectedTicket.user?.profile?.fullName || '—'}</span>
                <span className="text-xs text-neutral-400 font-medium mt-1">{selectedTicket.user?.email}</span>
              </div>
            </div>
          )}

          {}
          <div>
            <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block select-none">Subject</span>
            <span className="text-sm text-white font-medium mt-1.5 block">{selectedTicket.subject}</span>
          </div>

          <div>
            <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block select-none">Description</span>
            <p className="text-sm text-neutral-200 bg-[#050505] p-4 rounded-lg border border-neutral-900 mt-1.5 font-light leading-relaxed whitespace-pre-line">
              {selectedTicket.description}
            </p>
          </div>

          {}
          {selectedTicket.fileName && selectedTicket.fileContent && (
            <div className="flex items-center justify-between bg-[#be0919]/5 border border-[#be0919]/10 rounded-xl p-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4.5 h-4.5 text-[#be0919] shrink-0" />
                <span className="text-sm font-medium text-white truncate max-w-[220px]">{selectedTicket.fileName}</span>
              </div>
              <button
                onClick={() => downloadAttachment(selectedTicket.fileName, selectedTicket.fileContent)}
                className="flex items-center gap-1.5 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold py-2 px-3.5 rounded-md cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}

          {}
          <div>
            <span className="text-xs uppercase text-neutral-500 font-bold tracking-wider block select-none">Preferred Contact Method</span>
            <div className="flex items-center gap-2 text-sm text-white font-medium mt-1.5">
              {selectedTicket.contactMethod === 'Email' ? (
                <Mail className="w-4 h-4 text-neutral-400" />
              ) : selectedTicket.contactMethod === 'Phone' ? (
                <Phone className="w-4 h-4 text-neutral-400" />
              ) : (
                <MessageSquare className="w-4 h-4 text-neutral-400" />
              )}
              <span>{selectedTicket.contactMethod}</span>
            </div>
          </div>

          {}
          {selectedTicket.status === 'RESOLVED' && selectedTicket.adminResponse && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium select-none">
                <CheckCircle className="w-4.5 h-4.5" />
                <span>Resolution Response</span>
              </div>
              <p className="text-sm text-neutral-200 font-light leading-relaxed whitespace-pre-line">
                {selectedTicket.adminResponse}
              </p>
              {selectedTicket.respondedAt && (
                <span className="text-xs text-neutral-500 font-light block pt-1 select-none">
                  Resolved on {new Date(selectedTicket.respondedAt).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {}
          {isAdmin && selectedTicket.status === 'PENDING' && (
            <form onSubmit={onSubmitResponse} className="space-y-4 pt-4 border-t border-neutral-900">
              <div className="flex flex-col">
                <label className="text-[13px] text-white font-semibold mb-2">
                  Resolve & Respond <span className="text-[#be0919] font-bold">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Write a message explaining the resolution..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-900 rounded-[12px] py-3 px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/50 resize-none font-light leading-relaxed"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className="flex items-center gap-1.5 bg-[#be0919] hover:bg-[#990714] disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg text-xs cursor-pointer shadow-[0_4px_15px_rgba(190,9,25,0.25)] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingResponse ? 'Sending...' : 'Send Resolution'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
