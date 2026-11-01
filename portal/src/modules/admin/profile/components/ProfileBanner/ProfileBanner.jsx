
import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import heroImage from '../../../../../assets/images/profile/hero.webp';

export default function ProfileBanner({
  avatarUrl,
  onAvatarSelect,
  canEditAvatar = false,
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || '');

  useEffect(() => {
    setPreviewUrl(avatarUrl || '');
  }, [avatarUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = '';
      return;
    }

    const localPreview = URL.createObjectURL(file);

    setPreviewUrl((previousUrl) => {
      if (previousUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl);
      }

      return localPreview;
    });

    if (typeof onAvatarSelect === 'function') {
      onAvatarSelect(file, localPreview);
    }

    event.target.value = '';
  };

  return (
    <div
      className="pf-banner"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="pf-avatar">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            onError={() => setPreviewUrl('')}
          />
        ) : (
          <Icon name="user" size={26} />
        )}

        {canEditAvatar && (
          <>
            <button
              type="button"
              className="pf-avatar__camera"
              aria-label="Change profile photo"
              onClick={() => inputRef.current?.click()}
            >
              <Icon name="camera" size={12} />
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />
          </>
        )}
      </div>
    </div>
  );
}
