
import { useCallback } from "react";
import ProfileBanner from "../ProfileBanner";
import ProfileMeta from "../ProfileMeta";

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
      if (!canEdit || typeof onAvatarSelect !== "function") {
        return;
      }

      return onAvatarSelect(...args);
    },
    [canEdit, onAvatarSelect]
  );

  const currentAvatar =
    avatarUrl ||
    profile?.avatarUrl ||
    profile?.profile?.avatarUrl ||
    "";

  return (
    <header className="pf-header">
      <ProfileBanner
        avatarUrl={currentAvatar}
        onAvatarSelect={handleAvatarSelect}
        canEditAvatar={
          canEdit && typeof onAvatarSelect === "function"
        }
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
