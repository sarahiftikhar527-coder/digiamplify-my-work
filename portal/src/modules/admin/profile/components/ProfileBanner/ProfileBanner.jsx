
import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import apiClient from '@/services/api/apiClient';
import heroImage from '../../../../../assets/images/profile/hero.webp';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const getAvatarEndpoint = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

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
    pathname = pathname.slice(apiPrefix.length);
  }

  // Support existing protected file URLs.
  if (/^\/files\/profile-documents\//i.test(pathname)) {
    return pathname;
  }

  // Support older upload URLs.
  const uploadMatch = pathname.match(
    /\/uploads\/profile-documents\/([^/?#]+)$/i
  );

  if (uploadMatch?.[1]) {
    return `/files/profile-documents/${encodeURIComponent(
      uploadMatch[1]
    )}`;
  }

  // Support profile document URLs.
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
  const remotePreviewRef = useRef('');

  const [remotePreview, setRemotePreview] = useState('');
  const [localPreview, setLocalPreview] = useState('');

  // Load the protected profile image.
  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    setRemotePreview('');

    // Clear the previous local preview when the saved avatar changes.
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = '';
      setLocalPreview('');
    }

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

        if (cancelled) {
          return;
        }

        if (
          !response.data ||
          response.data.size === 0
        ) {
          return;
        }

        objectUrl = URL.createObjectURL(response.data);

        remotePreviewRef.current = objectUrl;
        setRemotePreview(objectUrl);
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Unable to load profile image:',
            error?.response?.status || error.message
          );
        }
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);

        if (remotePreviewRef.current === objectUrl) {
          remotePreviewRef.current = '';
        }
      }
    };
  }, [avatarUrl]);

  // Clean up remaining object URLs when the component unmounts.
  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = '';
      }

      if (remotePreviewRef.current) {
        URL.revokeObjectURL(remotePreviewRef.current);
        remotePreviewRef.current = '';
      }
    };
  }, []);

  // Handle profile image selection.
  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!canEditAvatar) {
      event.target.value = '';
      return;
    }

    // Validate image format.
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      console.error(
        'Only JPG, JPEG, PNG and WEBP images are allowed.'
      );

      event.target.value = '';
      return;
    }

    // Validate image size.
    if (file.size > MAX_FILE_SIZE) {
      console.error(
        'Profile image must not exceed 2 MB.'
      );

      event.target.value = '';
      return;
    }

    // Create an instant local preview.
    const preview = URL.createObjectURL(file);

    // Revoke the previous local preview.
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }

    localPreviewRef.current = preview;
    setLocalPreview(preview);

    // Send the selected file and preview to the parent.
    if (typeof onAvatarSelect === 'function') {
      onAvatarSelect(file, preview);
    }

    // Allow selecting the same file again.
    event.target.value = '';
  };

  const displayedAvatar = localPreview || remotePreview;

  return (
    <div
      className="pf-banner"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="pf-avatar">
        {displayedAvatar ? (
          <img
            src={displayedAvatar}
            alt="Profile"
            onError={() => {
              if (displayedAvatar === localPreview) {
                if (localPreviewRef.current) {
                  URL.revokeObjectURL(localPreviewRef.current);
                  localPreviewRef.current = '';
                }

                setLocalPreview('');
              } else if (displayedAvatar === remotePreview) {
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
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={handleFile}
            />
          </>
        )}
      </div>
    </div>
  );
}
