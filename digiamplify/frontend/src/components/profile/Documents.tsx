import React, { useState } from 'react';
import { Upload, FileText, ChevronDown, Trash2, MoreVertical, ExternalLink, Download } from 'lucide-react';

interface DocumentsProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isAdmin?: boolean;
}

const formatDocDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return { date: '—', time: '' };
  try {
    const d = new Date(dateStr);
    const standardMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = `${d.getDate()} ${standardMonths[d.getMonth()]}, ${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const time = `${hours}:${minutes} ${ampm}`;
    return { date, time };
  } catch {
    return { date: '13 July, 2026', time: '10:30 AM' };
  }
};

const getBase64Size = (base64Str: string | null | undefined): string => {
  if (!base64Str) return '';
  const base64Data = base64Str.split(',')[1] || base64Str;
  const bytes = Math.round((base64Data.length * 3) / 4);
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

const getFormattedUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function Documents({ data, onChange, isAdmin = false }: DocumentsProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  const renderDocBadge = (docType: 'cnic' | 'cv' | 'contract' | 'picture' | 'portfolio', hasFile: boolean, currentStatus: string) => {
    if (!hasFile) {
      return (
        <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] px-3 py-1.5 rounded-lg text-[11px] font-semibold w-fit">
          Pending
        </div>
      );
    }

    const isVerified = currentStatus === 'Verified';
    
    if (!isAdmin) {
      // Employee side: static badge, no dropdown icon
      return (
        <div className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border w-fit ${
          isVerified
            ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
            : 'bg-red-500/10 border-red-500/30 text-[#ff4d5a]'
        }`}>
          {isVerified ? 'Verified' : 'Not Verified'}
        </div>
      );
    }

    // Admin side: has ChevronDown dropdown menu to Verify/Unverify
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setStatusDropdown(statusDropdown === docType ? null : docType)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 w-fit cursor-pointer transition-all hover:bg-neutral-900 ${
            isVerified
              ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
              : 'bg-red-500/10 border-red-500/30 text-[#ff4d5a]'
          }`}
        >
          <span>{isVerified ? 'Verified' : 'Not Verified'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
        </button>

        {statusDropdown === docType && (
          <div className="absolute left-0 top-10 z-50 bg-[#0f0f0f] border border-neutral-800 rounded-lg py-1 shadow-xl min-w-[120px]">
            {isVerified ? (
              <button
                type="button"
                onClick={() => {
                  onChange(`${docType}Status`, 'Not Verified');
                  setStatusDropdown(null);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Unverify</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onChange(`${docType}Status`, 'Verified');
                  setStatusDropdown(null);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Verify</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileFieldPrefix: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Save filename
    onChange(`${fileFieldPrefix}FileName`, file.name);

    // Read file as Base64 string
    const reader = new FileReader();
    reader.onload = () => {
      onChange(`${fileFieldPrefix}Content`, reader.result as string);
    };
    reader.onerror = (error) => {
      console.error('File reading error: ', error);
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange('pictureUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (fileFieldPrefix: string) => {
    onChange(`${fileFieldPrefix}FileName`, '');
    onChange(`${fileFieldPrefix}Content`, '');
  };

  const handleRemovePicture = () => {
    onChange('pictureUrl', '');
  };

  const handleDownloadFile = (fileName: string, base64Content: string) => {
    if (!base64Content) return;
    const link = document.createElement('a');
    link.href = base64Content;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPortfolio = (url: string) => {
    if (!url) return;
    const element = document.createElement("a");
    const file = new Blob([url], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "portfolio_link.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleDropdown = (row: string) => {
    setActiveDropdown(activeDropdown === row ? null : row);
  };

  return (
    <div className="bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 shadow-md overflow-visible max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-3">
        <FileText className="w-5 h-5 text-[#be0919]" />
        <h3 className="text-[17px] font-semibold text-white">Documents</h3>
      </div>

      <div className="overflow-visible">
        <table className="w-full text-left text-xs font-light min-w-[650px] table-fixed">
          <thead>
            <tr className="border-b border-neutral-900 text-neutral-500">
              <th className="pb-3.5 font-medium w-[22%]">Document Type</th>
              <th className="pb-3.5 font-medium w-[30%]">File Name / Input</th>
              <th className="pb-3.5 font-medium w-[18%]">Updated Date</th>
              <th className="pb-3.5 font-medium w-[18%]">Status</th>
              <th className="pb-3.5 font-medium w-[12%] pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/50">
            
            {/* CNIC Row */}
            <tr>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">CNIC</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Identity Proof</div>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white max-w-[220px] truncate">{data.cnicFileName || '—'}</div>
                  {data.cnicFileName && <div className="text-[11px] text-neutral-500 mt-0.5">{getBase64Size(data.cnicContent)}</div>}
                </div>
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white">
                    {data.cnicFileName ? formatDocDate(data.updatedAt).date : '—'}
                  </div>
                  {data.cnicFileName && (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {formatDocDate(data.updatedAt).time}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4">
                {renderDocBadge('cnic', !!data.cnicFileName, data.cnicStatus)}
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2 pr-4">
                  {data.cnicFileName ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(data.cnicFileName, data.cnicContent)}
                      className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none shrink-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <label className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center justify-center w-[36px] h-[36px] focus-within:ring-1 focus-within:ring-red-500 shrink-0">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(e, 'cnic')}
                        className="hidden"
                      />
                    </label>
                  )}
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => data.cnicFileName && toggleDropdown('cnic')}
                      disabled={!data.cnicFileName}
                      className={`p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none ${
                        !data.cnicFileName ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === 'cnic' && (
                      <div className="absolute right-0 top-11 z-50 bg-[#0f0f0f] border border-neutral-800 rounded-lg py-1 shadow-xl min-w-[100px]">
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveFile('cnic');
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* CV Row */}
            <tr>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">CV</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Resume</div>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white max-w-[220px] truncate">{data.cvFileName || '—'}</div>
                  {data.cvFileName && <div className="text-[11px] text-neutral-500 mt-0.5">{getBase64Size(data.cvContent)}</div>}
                </div>
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white">
                    {data.cvFileName ? formatDocDate(data.updatedAt).date : '—'}
                  </div>
                  {data.cvFileName && (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {formatDocDate(data.updatedAt).time}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4">
                {renderDocBadge('cv', !!data.cvFileName, data.cvStatus)}
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2 pr-4">
                  {data.cvFileName ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(data.cvFileName, data.cvContent)}
                      className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none shrink-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <label className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center justify-center w-[36px] h-[36px] focus-within:ring-1 focus-within:ring-red-500 shrink-0">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => handleFileChange(e, 'cv')}
                        className="hidden"
                      />
                    </label>
                  )}
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => data.cvFileName && toggleDropdown('cv')}
                      disabled={!data.cvFileName}
                      className={`p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none ${
                        !data.cvFileName ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === 'cv' && (
                      <div className="absolute right-0 top-11 z-50 bg-[#0f0f0f] border border-neutral-800 rounded-lg py-1 shadow-xl min-w-[100px]">
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveFile('cv');
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* Employment Contract Row */}
            <tr>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Employment Contract</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Identity Proof</div>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white max-w-[220px] truncate">{data.contractFileName || '—'}</div>
                  {data.contractFileName && <div className="text-[11px] text-neutral-500 mt-0.5">{getBase64Size(data.contractContent)}</div>}
                </div>
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white">
                    {data.contractFileName ? formatDocDate(data.updatedAt).date : '—'}
                  </div>
                  {data.contractFileName && (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {formatDocDate(data.updatedAt).time}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4">
                {renderDocBadge('contract', !!data.contractFileName, data.contractStatus)}
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2 pr-4">
                  {data.contractFileName ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(data.contractFileName, data.contractContent)}
                      className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none shrink-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <label className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center justify-center w-[36px] h-[36px] focus-within:ring-1 focus-within:ring-red-500 shrink-0">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'contract')}
                        className="hidden"
                      />
                    </label>
                  )}
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => data.contractFileName && toggleDropdown('contract')}
                      disabled={!data.contractFileName}
                      className={`p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none ${
                        !data.contractFileName ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === 'contract' && (
                      <div className="absolute right-0 top-11 z-50 bg-[#0f0f0f] border border-neutral-800 rounded-lg py-1 shadow-xl min-w-[100px]">
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveFile('contract');
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* Picture Row */}
            <tr>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Picture</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Identity Proof</div>
                  </div>
                </div>
              </td>
              <td className="py-4">
                {data.pictureUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-neutral-700 bg-neutral-900 shrink-0">
                      <img src={data.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm text-white max-w-[150px] truncate">Profile_Picture.png</span>
                  </div>
                ) : (
                  <span className="text-sm text-white">—</span>
                )}
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white">
                    {data.pictureUrl ? formatDocDate(data.updatedAt).date : '—'}
                  </div>
                  {data.pictureUrl && (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {formatDocDate(data.updatedAt).time}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4">
                {renderDocBadge('picture', !!data.pictureUrl, data.pictureStatus)}
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2 pr-4">
                  {data.pictureUrl ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile('Profile_Picture.png', data.pictureUrl)}
                      className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none shrink-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <label className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center justify-center w-[36px] h-[36px] focus-within:ring-1 focus-within:ring-red-500 shrink-0">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => data.pictureUrl && toggleDropdown('picture')}
                      disabled={!data.pictureUrl}
                      className={`p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none ${
                        !data.pictureUrl ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === 'picture' && (
                      <div className="absolute right-0 top-11 z-50 bg-[#0f0f0f] border border-neutral-800 rounded-lg py-1 shadow-xl min-w-[100px]">
                        <button
                          type="button"
                          onClick={() => {
                            handleRemovePicture();
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* Portfolio Row */}
            <tr>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Portfolio</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">project</div>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <input
                  type="url"
                  value={data.portfolioUrl || ''}
                  onChange={(e) => onChange('portfolioUrl', e.target.value)}
                  placeholder="https://myportfolio.com"
                  className="w-full max-w-[320px] bg-[#141414] border border-neutral-800 rounded-lg py-2 px-3 text-[15px] text-white placeholder-neutral-600 focus:outline-none focus:border-[#be0919]"
                />
              </td>
              <td className="py-4">
                <div>
                  <div className="text-sm text-white">
                    {data.portfolioUrl ? formatDocDate(data.updatedAt).date : '—'}
                  </div>
                  {data.portfolioUrl && (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {formatDocDate(data.updatedAt).time}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4">
                {renderDocBadge('portfolio', !!data.portfolioUrl, data.portfolioStatus)}
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2 pr-4">
                  {data.portfolioUrl ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadPortfolio(data.portfolioUrl)}
                      className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none shrink-0"
                      title="Download Link File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="p-2 border border-neutral-800 rounded-lg text-neutral-400 bg-[#0f0f0f] opacity-40 cursor-not-allowed shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => data.portfolioUrl && toggleDropdown('portfolio')}
                      disabled={!data.portfolioUrl}
                      className={`p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all cursor-pointer focus:outline-none ${
                        !data.portfolioUrl ? 'opacity-40 cursor-not-allowed shrink-0' : ''
                      }`}
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeDropdown === 'portfolio' && (
                      <div className="absolute right-0 top-11 z-50 bg-[#0f0f0f] border border-neutral-800 rounded-lg py-1 shadow-xl min-w-[120px]">
                        <button
                          type="button"
                          onClick={() => {
                            window.open(getFormattedUrl(data.portfolioUrl), '_blank');
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onChange('portfolioUrl', '');
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-neutral-900 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
