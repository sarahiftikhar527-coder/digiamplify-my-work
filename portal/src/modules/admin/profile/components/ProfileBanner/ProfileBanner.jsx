
import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import apiClient from '@/services/api/apiClient';
import heroImage from '../../../../../assets/images/profile/hero.webp';

const getAvatarEndpoint = (url) => {
  if (!url || typeof url !== 'string') return '';

  const value = url.trim();

  if (
    value.startsWith('blob:') ||
    value.startsWith('data:')
  ) {
    return '';
  }

  let pathname = value;

  try {
    if (/^https?:\/\//i.test(value)) {
      pathname = new URL(value).pathname;
    }
  } catch {
    return '';
  }

  const apiPrefix = '/api/v1';

  if (pathname.startsWith(`${apiPrefix}/files/`)) {
    return pathname.slice(apiPrefix.length);
  }

  if (pathname.startsWith('/files/')) {
    return pathname;
  }

  const uploadMatch = pathname.match(
    /\/uploads\/profile-documents\/([^/?#]+)$/i
  );

  if (uploadMatch?.[1]) {
    return `/files/profile-documents/${encodeURIComponent(
      uploadMatch[1]
    )}`;
  }

  const documentMatch = pathname.match(
    /\/profile-documents\/([^/?#]+)$/i
  );

  if (documentMatch?.[1]) {
    return `/files/profile-documents/${encodeURIComponent(
      documentMatch[1]
    )}`;
  }

  return '';
};

export default function ProfileBanner({
  avatarUrl,
  onAvatarSelect,
  canEditAvatar = false,
}) {
  const inputRef = useRef(null);
  const localPreviewRef = useRef('');

  const [remotePreview, setRemotePreview] = useState('');
  const [localPreview, setLocalPreview] = useState('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    setRemotePreview('');
    setLocalPreview('');

    if (
      typeof avatarUrl === 'string' &&
      (avatarUrl.startsWith('blob:') ||
        avatarUrl.startsWith('data:'))
    ) {
      setRemotePreview(avatarUrl);
      return;
    }

    const endpoint = getAvatarEndpoint(avatarUrl);

    if (!endpoint) {
      return;
    }

    const loadAvatar = async () => {
      try {
        const response = await apiClient.get(endpoint, {
          responseType: 'blob',
        });

        if (!response.data || response.data.size === 0) {
          return;
        }

        objectUrl = URL.createObjectURL(response.data);

        if (!cancelled) {
          setRemotePreview(objectUrl);
        }
      } catch (error) {
        console.error(
          'Unable to load profile image:',
          error?.response?.status || error.message
        );
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [avatarUrl]);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      event.target.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);

    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }

    localPreviewRef.current = preview;
    setLocalPreview(preview);

    if (typeof onAvatarSelect === 'function') {
      onAvatarSelect(file, preview);
    }

    event.target.value = '';
  };

  const displayedAvatar = localPreview || remotePreview;

  return (
    <div
      className="pf-banner"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="pf-avatar">
        {displayedAvatar ? (
          <img
            src={displayedAvatar}
            alt="Profile"
            onError={() => {
              if (displayedAvatar === remotePreview) {
                setRemotePreview('');
              }
            }}
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
