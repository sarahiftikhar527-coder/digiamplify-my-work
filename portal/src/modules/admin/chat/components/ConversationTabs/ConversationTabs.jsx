
const TABS = [
  { key: "all", label: "All" },
  { key: "groups", label: "Groups" },
  { key: "direct", label: "Direct" },
];

const ConversationTabs = ({ value = "all", onChange }) => {
  return (
    <div
      className="mt-3 grid grid-cols-3 border-b border-white/10 px-4"
      role="tablist"
      aria-label="Filter conversations"
    >
      {TABS.map((tab) => {
        const isActive = value === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`conversation-tab-${tab.key}`}
            aria-selected={isActive}
            onClick={() => {
              if (typeof onChange === "function") {
                onChange(tab.key);
              }
            }}
            className={`-mb-px border-b-2 pb-2 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/30 ${
              isActive
                ? "border-red-600 text-red-500"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationTabs;
