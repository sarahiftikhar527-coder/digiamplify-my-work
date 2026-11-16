
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import useProtectedImage from "@/hooks/useProtectedImage";
import heroImage from "../../../../../assets/images/profile/hero.webp";

export default function ProfileBanner({
  avatarUrl,
  onAvatarSelect,
  canEditAvatar = false,
}) {
  const inputRef = useRef(null);
  const [brokenSrc, setBrokenSrc] = useState("");

  const { src } = useProtectedImage(avatarUrl);

  useEffect(() => {
    setBrokenSrc("");
  }, [avatarUrl, src]);

  const showImage = Boolean(src) && src !== brokenSrc;

  const handleFile = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !canEditAvatar) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    onAvatarSelect?.(file);
  };

  return (
    <div
      className="pf-banner"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="pf-avatar">
        {showImage ? (
          <img
            src={src}
            alt="Profile"
            onError={() => setBrokenSrc(src)}
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
