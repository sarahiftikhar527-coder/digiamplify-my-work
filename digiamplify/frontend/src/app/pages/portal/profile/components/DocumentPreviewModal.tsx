'use client';

import React from 'react';
import { X, Download, FileText, ExternalLink, Eye, Image as ImageIcon } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  fileName: string;
  fileContent: string;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  docTitle,
  fileName,
  fileContent
}: DocumentPreviewModalProps) {
  if (!isOpen || !fileContent) return null;

  const isImage = fileContent.startsWith('data:image/') || 
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName);

  const isPdf = fileContent.startsWith('data:application/pdf') || 
    /\.pdf$/i.test(fileName);

  const handleDownload = () => {
    if (!fileContent) return;
    const a = document.createElement('a');
    a.href = fileContent;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#0c0c0c] border border-neutral-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-900 bg-[#070707]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#be0919]/10 border border-[#be0919]/30 flex items-center justify-center text-[#be0919]">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">{docTitle || 'Document Preview'}</h2>
              <p className="text-xs text-neutral-400 truncate max-w-[300px] sm:max-w-md">{fileName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content Container */}
        <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-[#050505] min-h-[400px]">
          {isImage ? (
            <div className="relative max-w-full max-h-[70vh] flex items-center justify-center">
              <img
                src={fileContent}
                alt={fileName}
                className="max-h-[70vh] max-w-full object-contain rounded-2xl border border-neutral-800 shadow-2xl"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={fileContent}
              title={fileName}
              className="w-full h-[70vh] rounded-2xl border border-neutral-800 bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-[#101010] border border-neutral-800 rounded-2xl max-w-md">
              <FileText className="w-16 h-16 text-[#be0919] mx-auto mb-4 opacity-80" />
              <h3 className="text-sm font-bold text-white mb-2">{fileName}</h3>
              <p className="text-xs text-neutral-400 mb-6">Document preview is ready for download or external viewing.</p>
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-[#be0919] hover:bg-[#990714] text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-900 bg-[#070707] flex items-center justify-between text-xs text-neutral-500">
          <span>Digiamplify Secure Document Previewer</span>
          <span className="font-mono">{fileName}</span>
        </div>

      </div>
    </div>
  );
}
