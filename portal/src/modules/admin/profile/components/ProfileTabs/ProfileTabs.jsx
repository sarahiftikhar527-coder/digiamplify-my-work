export default function ProfileTabs({
  activeTab,
  onTabChange,
}) {
  const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'documents', label: 'Documents' },
    { id: 'job', label: 'Job Details' },
    { id: 'payment', label: 'Payment Details' },
  ];

  return (
    <div className="pf-tabs" role="tablist" aria-label="Profile sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`profile-tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          className={`pf-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}