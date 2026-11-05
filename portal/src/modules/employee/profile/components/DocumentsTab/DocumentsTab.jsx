
import { useRef, useState } from 'react';
import {
  Eye,
  FileText,
  FileUp,
  Trash2,
  AlertCircle,
  Download,
  ExternalLink,
} from 'lucide-react';
import apiClient from '@/services/api/apiClient';
import {
  downloadAuthenticatedFile,
  needsAuthenticatedFetch,
  openAuthenticatedFile,
  resolveProtectedFileFetchUrl,
} from '@/utils/authenticatedFile';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'jpg',
  'jpeg',
  'png',
  'webp',
];

const MIME_BY_EXTENSION = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const API_URL = (
  import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.includes("digiamplify.com") ? "https://api.digiamplify.com/api/v1" : "http://localhost:5000/api/v1")
).replace(/\/+$/, '');

const API_ORIGIN = new URL(API_URL, window.location.origin).origin;

function getExtension(name) {
  return String(name || '').split('.').pop()?.toLowerCase() || '';
}

function mimeFromName(name) {
  return MIME_BY_EXTENSION[getExtension(name)] || '';
}

function resolveDocumentUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return '';

  const cleanUrl = url.trim();

  if (/^(blob:|data:|javascript:)/i.test(cleanUrl)) {
    return '';
  }

  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith('/')) {
    const mapped = resolveProtectedFileFetchUrl(cleanUrl)
    if (mapped) return mapped
    return `${API_ORIGIN}${cleanUrl}`;
  }

  return '';
}

function formatDate(value) {
  if (!value) return 'Date not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatSize(bytes) {
  const size = Number(bytes || 0);

  if (!size) return '';

  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function safeFileName(name) {
  return (
    String(name || 'document')
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
      .trim() || 'document'
  );
}

function normalizeDocuments(documents) {
  const normalize = (item, fallbackId, fallbackName) => {
    const doc =
      item && typeof item === 'object'
        ? item
        : { url: item };

    const name =
      doc.fileName ||
      doc.originalName ||
      doc.filename ||
      doc.name ||
      doc.label ||
      doc.title ||
      fallbackName;

    return {
      ...doc,
      id: String(doc.id || doc._id || fallbackId),
      name,
      label: doc.label || doc.title || name,
      fileName: name,
      url:
        doc.url ||
        doc.secure_url ||
        doc.fileUrl ||
        doc.documentUrl ||
        doc.file?.url ||
        doc.path ||
        '',
      backFileName: doc.backFileName || '',
      backUrl: doc.backUrl || '',
      type:
        doc.type ||
        doc.mimeType ||
        doc.contentType ||
        mimeFromName(name),
      size: Number(doc.size || doc.bytes || 0),
      uploadedAt:
        doc.uploadedOn ||
        doc.uploadedAt ||
        doc.date ||
        doc.createdAt ||
        doc.updatedAt ||
        '',
      status: doc.status || 'Uploaded',
    };
  };

  if (Array.isArray(documents)) {
    return documents.map((doc, index) =>
      normalize(
        doc,
        `document-${index}`,
        `Document ${index + 1}`
      )
    );
  }

  if (documents && typeof documents === 'object') {
    return Object.entries(documents).map(([key, value], index) =>
      normalize(
        value,
        key || `document-${index}`,
        key || `Document ${index + 1}`
      )
    );
  }

  return [];
}

function openUrl(url) {
  const link = document.createElement('a');

  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadUrl(url, fileName) {
  const link = document.createElement('a');

  link.href = url;
  link.download = safeFileName(fileName);
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function DocumentsTab({
  values = {},
  onChange,
  editable = false,
}) {
  const inputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const documents = normalizeDocuments(values.documents);

  const updateDocuments = (nextDocuments) => {
    if (typeof onChange === 'function') {
      onChange('documents', nextDocuments);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);

    event.target.value = '';

    if (!files.length) return;

    setError('');

    const invalidFile = files.find(
      (file) => !ALLOWED_EXTENSIONS.includes(getExtension(file.name))
    );

    if (invalidFile) {
      setError('Use PDF, DOC, DOCX, JPG, PNG, or WEBP files only.');
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFile) {
      setError('Each file must be 2 MB or smaller.');
      return;
    }

    setBusy(true);

    try {
      const addedDocuments = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post(
          '/profile/me/documents/upload',
          formData
        );

        const result = response?.data?.data || response?.data || {};

        const permanentUrl =
          result.url ||
          result.fileUrl ||
          result.documentUrl ||
          '';

        if (!permanentUrl || /^(blob:|data:)/i.test(permanentUrl)) {
          throw new Error(
            'The server did not return a permanent document URL. Check the backend upload endpoint.'
          );
        }

        addedDocuments.push({
          id:
            result.id ||
            result._id ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          label: file.name,
          kind: 'file',
          name: file.name,
          fileName: result.fileName || file.name,
          url: permanentUrl,
          type: result.mimeType || file.type || mimeFromName(file.name),
          size: result.size || file.size,
          uploadedOn: result.uploadedOn || new Date().toISOString(),
          status: 'pending',
        });
      }

      updateDocuments([...documents, ...addedDocuments]);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to upload the document. Please check your backend upload route.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = async (url, name) => {
    setError('');

    if (needsAuthenticatedFetch(url)) {
      try {
        await openAuthenticatedFile(url);
      } catch (err) {
        setError(err?.message || `Unable to open ${name}.`);
      }
      return;
    }

    const permanentUrl = resolveDocumentUrl(url);

    if (!permanentUrl) {
      setError(
        `${name} does not have a valid permanent URL. Upload the file again from the administrator profile.`
      );
      return;
    }

    openUrl(permanentUrl);
  };

  const handleDownload = async (url, name) => {
    setError('');

    if (needsAuthenticatedFetch(url)) {
      try {
        await downloadAuthenticatedFile(url, safeFileName(name));
      } catch (err) {
        setError(err?.message || `Unable to download ${name}.`);
      }
      return;
    }

    const permanentUrl = resolveDocumentUrl(url);

    if (!permanentUrl) {
      setError(
        `${name} does not have a valid permanent URL. Upload the file again from the administrator profile.`
      );
      return;
    }

    downloadUrl(permanentUrl, name);
  };

  const removeDocument = (id) => {
    updateDocuments(documents.filter((doc) => doc.id !== id));
    setError('');
  };

  const renderFileRow = ({
    id,
    name,
    url,
    date,
    size,
    removable = false,
    onRemove,
  }) => {
    const permanentUrl = resolveDocumentUrl(url);

    return (
      <article
        key={id}
        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/70">
            <FileText size={21} />
          </div>

          <div className="min-w-0">
            <p className="break-words text-sm font-medium text-white">
              {name || 'Unnamed document'}
            </p>

            <p className="mt-1 text-xs text-white/50">
              {formatDate(date)}
              {size ? ` · ${formatSize(size)}` : ''}
            </p>

            {!permanentUrl && (
              <p className="mt-1 text-xs text-amber-300">
                Permanent file URL unavailable. Re-upload required.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => handleOpen(url, name)}
            disabled={!permanentUrl}
            title="View document"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Eye size={16} />
            View
            <ExternalLink size={13} />
          </button>

          <button
            type="button"
            onClick={() => handleDownload(url, name)}
            disabled={!permanentUrl}
            title="Download document"
            aria-label={`Download ${name}`}
            className="inline-flex items-center justify-center rounded-lg border border-white/15 p-2 text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Download size={16} />
          </button>

          {removable && (
            <button
              type="button"
              onClick={onRemove}
              title="Remove document"
              aria-label={`Remove ${name}`}
              className="inline-flex items-center justify-center rounded-lg border border-red-500/25 p-2 text-red-300 transition hover:bg-red-500/10"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 text-white sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold">Employee Documents</h2>

          <p className="mt-1 text-sm text-white/60">
            Documents saved to this employee profile.
          </p>
        </div>

        {editable && (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c1121f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a70f1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileUp size={17} />
              {busy ? 'Uploading...' : 'Upload Document'}
            </button>
          </>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center">
          <FileText size={30} className="mx-auto mb-3 text-white/35" />

          <p className="font-medium text-white/80">
            No documents uploaded
          </p>

          <p className="mt-1 text-sm text-white/45">
            {editable
              ? 'Upload the document, then save the employee profile.'
              : 'No documents have been added to this profile yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="space-y-3">
              {renderFileRow({
                id: doc.id,
                name: doc.name,
                url: doc.url,
                date: doc.uploadedAt,
                size: doc.size,
                removable: editable,
                onRemove: () => removeDocument(doc.id),
              })}

              {doc.backFileName && (
                renderFileRow({
                  id: `${doc.id}-back`,
                  name: doc.backFileName,
                  url: doc.backUrl,
                  date: doc.uploadedAt,
                  removable: false,
                })
              )}
            </div>
          ))}
        </div>
      )}

      {editable && (
        <p className="mt-4 text-xs leading-5 text-white/40">
          Files are uploaded to the backend. Save the profile after
          uploading or removing documents so the document details are
          saved to the employee record.
        </p>
      )}
    </section>
  );
}
