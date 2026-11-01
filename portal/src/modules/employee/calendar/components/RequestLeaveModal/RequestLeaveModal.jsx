import { useEffect, useId, useRef, useState } from 'react';
import Modal from '../Modal';
import Icon from '../Icons';

const LEAVE_TYPES = ['Sick', 'Casual', 'Annual', 'Unpaid'];
const ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
const ALLOWED = ACCEPT.split(',');
const EXT_CHIPS = ['.PDF', '.DOC', '.PNG', '.JPG'];
const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

const extOf = (name) => `.${name.split('.').pop().toLowerCase()}`;
const sizeLabel = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const INITIAL = { approvers: [], start: '', end: '', subject: '', type: 'Sick', description: '', files: [] };

function validate(f) {
  const e = {};
  if (f.approvers.length === 0) e.approvers = 'Select at least one approver.';
  if (!f.start) e.start = 'Select a start date.';
  if (!f.end) e.end = 'Select an end date.';
  else if (f.start && f.end < f.start) e.end = 'End date must be on or after the start date.';
  if (!f.subject.trim()) e.subject = 'Enter a subject.';
  if (!f.description.trim()) e.description = 'Enter a description.';
  return e;
}

function ApproverSelect({ id, selected, onAdd, onRemove, search, invalid }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [active, setActive] = useState(0);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    const timer = setTimeout(() => {
      search(query)
        .then((list) => {
          if (alive) {
            setOptions(list);
            setActive(0);
          }
        })
        .catch(() => alive && setOptions([]));
    }, 150);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query, open, search]);

  useEffect(() => {
    const onDown = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const available = options.filter((o) => !selected.some((s) => s.id === o.id));
  const choose = (o) => {
    onAdd(o);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, available.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && available[active]) choose(available[active]);
    } else if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <>
      <div className="cal-combo" ref={wrap}>
        <input
          id={id}
          className="cal-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open && available[active] ? `${id}-opt-${available[active].id}` : undefined}
          aria-invalid={invalid}
          autoComplete="off"
          placeholder="Search and select approver"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <span className="cal-combo__chev"><Icon name="chevronDown" size={13} /></span>
        {open && (
          <ul id={`${id}-list`} className="cal-combo__list" role="listbox">
            {available.length === 0 && <li className="cal-combo__empty">No approvers found.</li>}
            {available.map((o, i) => (
              <li
                key={o.id}
                id={`${id}-opt-${o.id}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? 'is-active' : ''}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); choose(o); }}
              >
                <span className="cal-avatar">{initials(o.name)}</span>
                <span><strong>{o.name}</strong><small>{o.role}</small></span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.map((a) => (
        <div key={a.id} className="cal-approver">
          <span className="cal-avatar">{initials(a.name)}</span>
          <span className="cal-approver__text"><strong>{a.name}</strong><small>{a.role}</small></span>
          <button type="button" className="cal-iconbtn" aria-label={`Remove ${a.name}`} onClick={() => onRemove(a.id)}>
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </>
  );
}

export default function RequestLeaveModal({ onClose, onSubmit, onSearchApprovers }) {
  const uid = useId();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef(null);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const addFiles = (list) => {
    const files = [...form.files];
    let problem = '';
    Array.from(list).forEach((file) => {
      if (!ALLOWED.includes(extOf(file.name))) { problem = 'Only PDF, DOC, PNG and JPG files are allowed.'; return; }
      if (file.size > MAX_SIZE) { problem = `${file.name} is larger than 5 MB.`; return; }
      if (files.some((x) => x.name === file.name && x.size === file.size)) return;
      if (files.length >= MAX_FILES) { problem = `You can attach up to ${MAX_FILES} files.`; return; }
      files.push(file);
    });
    setForm((f) => ({ ...f, files }));
    setFileError(problem);
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit({
        approverIds: form.approvers.map((a) => a.id),
        startDate: form.start,
        endDate: form.end,
        subject: form.subject.trim(),
        leaveType: form.type,
        description: form.description.trim(),
        attachments: form.files,
      });
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your request. Try again.');
      setSaving(false);
    }
  };

  const err = (key) => errors[key] && <p className="cal-error" role="alert">{errors[key]}</p>;

  return (
    <Modal title="Request Leave" subtitle="Fill the details below to request a leave" icon="edit" onClose={onClose} width={540}>
      <form className="cal-form" onSubmit={submit} noValidate>
        <div>
          <label className="cal-flabel" htmlFor={`${uid}-approver`}>Assign To (Approver)<span className="cal-req">*</span></label>
          <ApproverSelect
            id={`${uid}-approver`}
            selected={form.approvers}
            search={onSearchApprovers}
            invalid={!!errors.approvers}
            onAdd={(a) => set('approvers', [...form.approvers, a])}
            onRemove={(id) => set('approvers', form.approvers.filter((x) => x.id !== id))}
          />
          {err('approvers')}
        </div>

        <div className="cal-fgrid">
          <div>
            <label className="cal-flabel" htmlFor={`${uid}-start`}>Start Date<span className="cal-req">*</span></label>
            <div className="cal-iwrap">
              <Icon name="calendar" size={13} />
              <input id={`${uid}-start`} type="date" className="cal-input" aria-invalid={!!errors.start}
                value={form.start} onChange={(e) => set('start', e.target.value)} />
            </div>
            {err('start')}
          </div>
          <div>
            <label className="cal-flabel" htmlFor={`${uid}-end`}>End Date<span className="cal-req">*</span></label>
            <div className="cal-iwrap">
              <Icon name="calendar" size={13} />
              <input id={`${uid}-end`} type="date" className="cal-input" aria-invalid={!!errors.end}
                min={form.start || undefined} value={form.end} onChange={(e) => set('end', e.target.value)} />
            </div>
            {err('end')}
          </div>
          <div>
            <label className="cal-flabel" htmlFor={`${uid}-subject`}>Subject<span className="cal-req">*</span></label>
            <input id={`${uid}-subject`} className="cal-input" placeholder="Enter leave subject" aria-invalid={!!errors.subject}
              value={form.subject} onChange={(e) => set('subject', e.target.value)} />
            {err('subject')}
          </div>
          <div>
            <label className="cal-flabel" htmlFor={`${uid}-type`}>Leave Type<span className="cal-req">*</span></label>
            <div className="cal-iwrap">
              <Icon name="flag" size={13} />
              <select id={`${uid}-type`} className="cal-input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="cal-flabel" htmlFor={`${uid}-desc`}>Description<span className="cal-req">*</span></label>
          <textarea id={`${uid}-desc`} className="cal-input" placeholder="Enter description for leave..." aria-invalid={!!errors.description}
            value={form.description} onChange={(e) => set('description', e.target.value)} />
          {err('description')}
        </div>

        <div>
          <span className="cal-flabel">Attachment</span>
          <div
            className={`cal-drop${dragging ? ' is-drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          >
            <span className="cal-drop__icon"><Icon name="upload" size={16} /></span>
            <p className="cal-drop__title">Drag &amp; Drop files here</p>
            <p className="cal-drop__sub">
              or <button type="button" className="cal-link" onClick={() => fileRef.current?.click()}>browse files</button> from computer
            </p>
            <div className="cal-drop__chips">
              {EXT_CHIPS.map((c) => <span key={c} className="cal-ext">{c}</span>)}
            </div>
            <input ref={fileRef} type="file" hidden multiple accept={ACCEPT}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          </div>
          {fileError && <p className="cal-error" role="alert">{fileError}</p>}
          {form.files.length > 0 && (
            <ul className="cal-files">
              {form.files.map((f) => (
                <li key={`${f.name}-${f.size}`}>
                  <Icon name="file" size={13} />
                  <span className="cal-files__name">{f.name}</span>
                  <small>{sizeLabel(f.size)}</small>
                  <button type="button" className="cal-iconbtn" aria-label={`Remove ${f.name}`}
                    onClick={() => set('files', form.files.filter((x) => x !== f))}>
                    <Icon name="x" size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {submitError && <p className="cal-error" role="alert">{submitError}</p>}
        <div className="cal-form__actions">
          <button type="submit" className="cal-btn cal-btn--lg" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}