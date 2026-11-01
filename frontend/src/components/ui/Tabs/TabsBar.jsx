export default function TabsBar({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`flex overflow-x-auto border-b border-white/10 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange?.(tab.id)}
          className={`relative whitespace-nowrap px-5 py-3 text-xs font-medium transition-colors ${
            activeTab === tab.id ? 'text-white' : 'text-white/40'
          }`}
        >
          {tab.label}

          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-digi-red" />
          )}
        </button>
      ))}
    </div>
  )
}