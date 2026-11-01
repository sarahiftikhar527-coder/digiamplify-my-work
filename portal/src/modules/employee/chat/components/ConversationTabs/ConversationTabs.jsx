const TABS = [
  { key: "all", label: "All" },
  { key: "groups", label: "Groups" },
  { key: "direct", label: "Direct" },
];

const ConversationTabs = ({ value, onChange }) => (
  <div className="mt-3 grid grid-cols-3 border-b border-white/10 px-4">
    {TABS.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`-mb-px border-b-2 pb-2 text-[12px] transition ${
          value === t.key ? "border-red-600 text-red-500" : "border-transparent text-white/50 hover:text-white"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default ConversationTabs;