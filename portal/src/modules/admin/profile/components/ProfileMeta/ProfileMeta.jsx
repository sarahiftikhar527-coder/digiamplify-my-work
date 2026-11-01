
import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';

export default function ProfileMeta({
  profile,
  isEditing = false,
  canEdit = true,
  onEdit,
  onRequestEdit,
  onSave,
  onCancel,
  saving = false,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const saveLock = useRef(false);

  useEffect(() => {
    if (!isEditing && !saving) {
      setSaveError('');
      setIsSaving(false);
      saveLock.current = false;
    }
  }, [isEditing, saving]);

  const handleEdit = () => {
    if (isSaving || saving || !canEdit || isEditing) return;

    setSaveError('');
    (onRequestEdit || onEdit)?.();
  };

  const handleCancel = () => {
    if (isSaving || saving) return;

    setSaveError('');
    onCancel?.();
  };

  const handleSave = async () => {
    if (isSaving || saving || saveLock.current || !canEdit) return;

    if (typeof onSave !== 'function') {
      setSaveError('Unable to save changes. Please try again.');
      return;
    }

    saveLock.current = true;
    setIsSaving(true);
    setSaveError('');

    try {
      await onSave();
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveError(
        error?.message || 'Unable to save changes. Please try again.'
      );
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const fullName = profile?.fullName || profile?.name || '';
  const jobTitle = profile?.jobTitle || '';
  const email = profile?.email || '';
  const phone = profile?.phone || '';
  const city = profile?.city || '';
  const country = profile?.country || '';
  const department = profile?.department || '';
  const manager = profile?.manager || '';

  const busy = isSaving || saving;

  return (
    <div className="pf-meta">
      <h2 className="pf-meta__name">{fullName}</h2>

      <p className="pf-meta__role">
        {jobTitle || 'Employee'}
      </p>

      <ul className="pf-meta__contacts">
        <li>
          <Icon name="mail" />
          {email ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            <span>Not provided</span>
          )}
        </li>

        <li>
          <Icon name="phone" />
          {phone ? (
            <a href={`tel:${phone}`}>{phone}</a>
          ) : (
            <span>Not provided</span>
          )}
        </li>

        <li>
          <Icon name="pin" />
          <span>
            {[city, country].filter(Boolean).join(', ') ||
              'Not provided'}
          </span>
        </li>
      </ul>

      <div className="pf-meta__footer">
        <dl className="pf-meta__org">
          <div>
            <dt>Department</dt>
            <dd>{department || 'Not provided'}</dd>
          </div>

          <div>
            <dt>Manager</dt>
            <dd>{manager || 'Not provided'}</dd>
          </div>
        </dl>

        {canEdit && (
          <div className="pf-meta__actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="pf-btn pf-btn--ghost"
                  onClick={handleCancel}
                  disabled={busy}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="pf-btn"
                  onClick={handleSave}
                  disabled={busy}
                  aria-busy={busy}
                >
                  {busy ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="pf-btn"
                onClick={handleEdit}
                disabled={busy}
              >
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      {saveError && (
        <p className="pf-meta__error" role="alert">
          {saveError}
        </p>
      )}
    </div>
  );
}
