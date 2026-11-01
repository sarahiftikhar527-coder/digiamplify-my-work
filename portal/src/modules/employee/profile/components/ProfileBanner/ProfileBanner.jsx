import { useRef } from 'react';
import Icon from '../Icon';
// Path assumes the file lives at src/assets/images/profile/hero.webp
import heroImage from '../../../../../assets/images/profile/hero.webp';

export default function ProfileBanner({ avatarUrl, onAvatarSelect }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onAvatarSelect(file);
    e.target.value = ''; // allow picking the same file again
  };

  return (
    <div className="pf-banner" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="pf-avatar">
        {avatarUrl ? <img src={avatarUrl} alt="Profile" /> : <Icon name="user" size={26} />}
        <button
          type="button"
          className="pf-avatar__camera"
          aria-label="Change profile photo"
          onClick={() => inputRef.current?.click()}
        >
          <Icon name="camera" size={12} />
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
    </div>
  );
}
