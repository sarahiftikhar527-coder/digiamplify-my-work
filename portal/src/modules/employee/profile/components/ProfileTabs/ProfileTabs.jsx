import { useRef } from 'react';
import Icon from '../Icon';

export const TABS = [
  {
    id: 'personal',
    label: 'Personal Details and Contact',
    icon: 'user',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'file',
  },
  {
    id: 'job',
    label: 'Job Details',
    icon: 'briefcase',
  },
  {
    id: 'payment',
    label: 'Payment Details',
    icon: 'card',
  },
];

export default function ProfileTabs({ active, onChange }) {
  const tabRefs = useRef({});

  const handleKeyDown = (event, currentIndex) => {
    let nextIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % TABS.length;
        break;

      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        break;

      case 'Home':
        nextIndex = 0;
        break;

      case 'End':
        nextIndex = TABS.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextTab = TABS[nextIndex];

    onChange?.(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  };

  return (
    <div className="pf-tabs" role="tablist" aria-label="Profile sections">
      {TABS.map((t, index) => {
        const isActive = active === t.id;

        return (
          <button
            key={t.id}
            ref={(element) => {
              tabRefs.current[t.id] = element;
            }}
            id={`profile-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`profile-panel-${t.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`pf-tab${isActive ? ' is-active' : ''}`}
            onClick={() => onChange?.(t.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <Icon name={t.icon} size={13} /> {t.label}
          </button>
        );
      })}
    </div>
  );
}