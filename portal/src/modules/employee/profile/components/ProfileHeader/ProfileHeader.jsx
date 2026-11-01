import { useCallback } from 'react';
import ProfileBanner from '../ProfileBanner';
import ProfileMeta from '../ProfileMeta';

export default function ProfileHeader({
  profile,
  avatarUrl,
  avatarError,
  onAvatarSelect,
  canEdit = false,
  ...metaProps
}) {
  const handleAvatarSelect = useCallback(
    (...args) => {
      if (!canEdit || typeof onAvatarSelect !== 'function') return;
      return onAvatarSelect(...args);
    },
    [canEdit, onAvatarSelect]
  );

  return (
    <header className="pf-header">
      <ProfileBanner
        avatarUrl={avatarUrl || profile?.avatarUrl || ''}
        onAvatarSelect={handleAvatarSelect}
        canEditAvatar={canEdit}
      />

      <ProfileMeta
        profile={profile}
        canEdit={canEdit}
        {...metaProps}
      />

      {avatarError && (
        <p className="pf-error" role="alert">
          {avatarError}
        </p>
      )}
    </header>
  );
}