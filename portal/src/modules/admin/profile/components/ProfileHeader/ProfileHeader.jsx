
import { useCallback } from 'react';
import ProfileBanner from '../ProfileBanner';
import ProfileMeta from '../ProfileMeta';

export default function ProfileHeader({
  profile,
  avatarUrl,
  avatarError,
  onAvatarSelect,
  canEdit,
  isEditing = false,
  onEdit,
  onCancel,
  onSave,
  saving = false,
  metaProps = {},
}) {
  const handleAvatarSelect = useCallback(
    (...args) => {
      if (!isEditing || saving) return;
      if (typeof onAvatarSelect !== 'function') return;

      return onAvatarSelect(...args);
    },
    [isEditing, saving, onAvatarSelect]
  );

  const hasAvatarError =
    typeof avatarError === 'string'
      ? avatarError.trim().length > 0
      : Boolean(avatarError);

  const canEditProfile = canEdit !== false;

  return (
    <header className="pf-header">
      <ProfileBanner
        avatarUrl={avatarUrl || profile?.avatarUrl || ''}
        onAvatarSelect={handleAvatarSelect}
        canEditAvatar={canEditProfile && isEditing && !saving}
      />

      <ProfileMeta
        profile={profile}
        canEdit={canEditProfile}
        isEditing={isEditing}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        saving={saving}
        {...metaProps}
      />

      {hasAvatarError && (
        <p className="pf-error" role="alert">
          {avatarError}
        </p>
      )}
    </header>
  );
}
