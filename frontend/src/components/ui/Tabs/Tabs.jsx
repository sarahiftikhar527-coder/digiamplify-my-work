import { useState } from 'react'

export default function Tabs({
  tabs = [],
  defaultTab,
  children,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const active = tabs.find((tab) => tab.id === activeTab)

  return (
    <div className={className}>
      <div className="mb-6 flex overflow-x-auto border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
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

      {children ? children(activeTab, active) : active?.content}
    </div>
  )
}