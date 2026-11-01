import { useRef, useState } from 'react';
import Icon from '../Icon';

const DOCUMENT_TYPES = [
  'Employment Contract',
  'CNIC (Front & Back)',
  'Resume',
  'Passport Size Photo',
  'Portfolio',
];

const STATUS_LABEL = {
  verified: 'Verified',
  pending: 'Pending',
  missing: 'Not Uploaded',
};

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const formatDate = (iso) => {
  if (!iso) return '–';

  const date = new Date(`${iso}T00:00:00`);

  if (Number.isNaN(date.getTime())) return '–';

  return `${date.getDate()} ${date.toLocaleString('en-GB', {
    month: 'long',
  })}, ${date.getFullYear()}`;
};

const normalizeUrl = (value = '') => {
  const trimmed = value.trim();

  if (!trimmed) return '';

  return /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
};

function DocFileIcon() {
  return (
    <svg
      className="pf-doc__icon"
      width="36"
      height="44"
      viewBox="0 0 36 44"
      aria-hidden="true"
    >
      <path
        d="M4 0h18l10 10v30a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
        fill="#e0243a"
      />
      <path d="M22 0v8a2 2 0 0 0 2 2h8z" fill="#ff8a96" />
      <rect x="7" y="19" width="18" height="3" rx="1.5" fill="#fff" />
      <rect x="7" y="25" width="18" height="3" rx="1.5" fill="#fff" />
      <rect x="7" y="31" width="18" height="3" rx="1.5" fill="#fff" />
    </svg>
  );
}

function DocumentCard({ doc, editable, onUpdate, onRemove }) {
  const inputRef = useRef(null);
  const backInputRef = useRef(null);
  const [error, setError] = useState('');

  const isCnic = doc.label === 'CNIC (Front & Back)';
  const isLink = doc.kind === 'link';

  const openUrl = (url, link = false) => {
    if (!url) return;

    const target = link ? normalizeUrl(url) : url;

    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFile = (event, side = 'main') => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError('Each file must be 5 MB or smaller.');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF, PNG, JPG and WEBP files are allowed.');
      return;
    }

    setError('');

    const localUrl = URL.createObjectURL(file);

    if (isCnic && side !== 'main') {
      onUpdate({
        ...doc,
        backFileName: file.name,
        backUrl: localUrl,
        backFile: file,
        backLocalPreview: true,
        uploadedOn: today(),
        status: 'pending',
      });
      return;
    }

    onUpdate({
      ...doc,
      fileName: file.name,
      url: localUrl,
      file,
      localPreview: true,
      uploadedOn: today(),
      status: 'pending',
    });
  };

  const handleLink = (event) => {
    const value = event.target.value;

    onUpdate({
      ...doc,
      fileName: value,
      url: value,
      uploadedOn: value.trim() ? today() : '',
      status: value.trim() ? 'pending' : 'missing',
    });
  };

  const hasFile = Boolean(doc.url);
  const hasBackFile = Boolean(doc.backUrl);
  const isComplete = isCnic ? hasFile && hasBackFile : hasFile;

  return (
    <div className="pf-doc">
      <DocFileIcon />

      <div className="pf-doc__body">
        <span className={`pf-badge pf-badge--${doc.status}`}>
          {STATUS_LABEL[doc.status] || 'Pending'}
        </span>

        {isLink && editable ? (
          <input
            className="pf-doc__input"
            type="url"
            placeholder="https://your-portfolio.com"
            aria-label={doc.label}
            value={doc.fileName || ''}
            onChange={handleLink}
          />
        ) : (
          <p className="pf-doc__name">{doc.fileName || '–'}</p>
        )}

        {isCnic && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-300">
                Front: {doc.fileName || 'Not uploaded'}
              </span>

              {doc.url && (
                <button
                  type="button"
                  className="pf-doc__upload"
                  onClick={() => openUrl(doc.url)}
                >
                  <Icon name="eye" size={12} /> View front
                </button>
              )}

              {editable && (
                <>
                  <button
                    type="button"
                    className="pf-doc__upload"
                    onClick={() => inputRef.current?.click()}
                  >
                    {doc.url ? 'Replace front' : 'Upload front'}
                  </button>

                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    hidden
                    onChange={(event) => handleFile(event, 'main')}
                  />
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-300">
                Back: {doc.backFileName || 'Not uploaded'}
              </span>

              {doc.backUrl && (
                <button
                  type="button"
                  className="pf-doc__upload"
                  onClick={() => openUrl(doc.backUrl)}
                >
                  <Icon name="eye" size={12} /> View back
                </button>
              )}

              {editable && (
                <>
                  <button
                    type="button"
                    className="pf-doc__upload"
                    onClick={() => backInputRef.current?.click()}
                  >
                    {doc.backUrl ? 'Replace back' : 'Upload back'}
                  </button>

                  <input
                    ref={backInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    hidden
                    onChange={(event) => handleFile(event, 'back')}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {!isCnic && (
          <>
            <p className="pf-doc__date">
              Uploaded on <span>{formatDate(doc.uploadedOn)}</span>
            </p>

            {editable && !isLink && (
              <>
                <button
                  type="button"
                  className="pf-doc__upload"
                  onClick={() => inputRef.current?.click()}
                >
                  <Icon name="upload" size={11} />
                  {doc.url ? 'Replace file' : 'Upload file'}
                </button>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  hidden
                  onChange={handleFile}
                />
              </>
            )}
          </>
        )}

        {isCnic && (
          <p className="pf-doc__date">
            Uploaded on <span>{formatDate(doc.uploadedOn)}</span>
          </p>
        )}

        {error && (
          <p className="pf-doc__error" role="alert">
            {error}
          </p>
        )}

        {editable && (
          <button
            type="button"
            className="pf-doc__upload"
            onClick={() => onRemove(doc.id)}
          >
            Remove document
          </button>
        )}

        {isCnic && !isComplete && (hasFile || hasBackFile) && (
          <p className="pf-doc__error">
            Upload both front and back sides of the CNIC.
          </p>
        )}
      </div>

      {!isCnic && (
        <button
          type="button"
          className="pf-doc__eye"
          aria-label={`View ${doc.label}`}
          title={doc.url ? `View ${doc.label}` : 'No document available'}
          disabled={!doc.url}
          onClick={() => openUrl(doc.url, isLink)}
        >
          <Icon name="eye" size={16} />
        </button>
      )}
    </div>
  );
}

export default function DocumentsTab({
  values,
  onChange,
  editable = false,
}) {
  const docs = values?.documents || [];
  const [selectedType, setSelectedType] = useState('');
  const [addError, setAddError] = useState('');

  const updateDoc = (next) => {
    onChange(
      'documents',
      docs.map((doc) => (doc.id === next.id ? next : doc))
    );
  };

  const addDocument = (event) => {
    event.preventDefault();

    if (!selectedType) {
      setAddError('Please select a document type.');
      return;
    }

    const existing = docs.some((doc) => doc.label === selectedType);

    if (existing) {
      setAddError('This document type has already been added.');
      return;
    }

    const isPortfolio = selectedType === 'Portfolio';

    const newDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: selectedType,
      kind: isPortfolio ? 'link' : 'file',
      fileName: '',
      url: '',
      uploadedOn: '',
      status: 'missing',
      ...(selectedType === 'CNIC (Front & Back)'
        ? {
            backFileName: '',
            backUrl: '',
          }
        : {}),
    };

    onChange('documents', [...docs, newDocument]);
    setSelectedType('');
    setAddError('');
  };

  const removeDocument = (id) => {
    const doc = docs.find((item) => item.id === id);

    if (doc?.localPreview && doc.url) {
      URL.revokeObjectURL(doc.url);
    }

    if (doc?.backLocalPreview && doc.backUrl) {
      URL.revokeObjectURL(doc.backUrl);
    }

    onChange(
      'documents',
      docs.filter((item) => item.id !== id)
    );
  };

  const isSubmitted = (doc) => {
    if (doc.label === 'CNIC (Front & Back)') {
      return Boolean(doc.url && doc.backUrl);
    }

    return doc.status !== 'missing' && Boolean(doc.url);
  };

  const submitted = docs.filter(isSubmitted).length;

  const pct = docs.length
    ? Math.round((submitted / docs.length) * 100)
    : 0;

  return (
    <div className="pf-layout pf-layout--docs">
      <div className="pf-card">
        <h3 className="pf-card__title">
          <Icon name="file" /> Documents
        </h3>

        {editable && (
          <form
            onSubmit={addDocument}
            className="mb-5 mt-4 flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[220px] flex-1">
              <label
                htmlFor="document-type"
                className="mb-1 block text-sm text-white"
              >
                Document Type
              </label>

              <select
                id="document-type"
                className="pf-doc__input"
                value={selectedType}
                onChange={(event) => {
                  setSelectedType(event.target.value);
                  setAddError('');
                }}
              >
                <option value="">Select document type</option>

                {DOCUMENT_TYPES.filter(
                  (type) => !docs.some((doc) => doc.label === type)
                ).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="pf-btn">
              + Add Document
            </button>

            {addError && (
              <p className="w-full text-sm text-red-400" role="alert">
                {addError}
              </p>
            )}
          </form>
        )}

        {docs.length === 0 ? (
          <p className="py-6 text-sm text-neutral-400">
            No documents added yet.
          </p>
        ) : (
          <div className="pf-docs-grid">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className={`pf-doc-cell${
                  doc.kind === 'link' ? ' pf-doc-cell--wide' : ''
                }`}
              >
                <p className="pf-doc-cell__label">{doc.label}</p>

                <DocumentCard
                  doc={doc}
                  editable={editable}
                  onUpdate={updateDoc}
                  onRemove={removeDocument}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="pf-card">
        <h3 className="pf-card__title">
          <Icon name="file" /> Document Status
        </h3>

        {docs.length === 0 ? (
          <p className="py-4 text-sm text-neutral-400">
            Add documents to track their status.
          </p>
        ) : (
          <ul className="pf-status-list">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className={isSubmitted(doc) ? 'is-done' : 'is-missing'}
              >
                <Icon
                  name={isSubmitted(doc) ? 'checkCircle' : 'xCircle'}
                  size={16}
                />
                {doc.label}
                {!isSubmitted(doc) && (
                  <span className="ml-auto text-xs text-neutral-400">
                    Pending
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="pf-stat">
          <p className="pf-stat__label">Documents Submitted</p>
          <p className="pf-stat__value">
            {submitted}/{docs.length}
          </p>
        </div>

        <div className="pf-stat">
          <p className="pf-stat__label">Documents Completion</p>
          <p className="pf-stat__value pf-stat__value--red">
            {pct}%
          </p>

          <div
            className="pf-progress"
            role="progressbar"
            aria-label="Documents completion"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      </aside>
    </div>
  );
}