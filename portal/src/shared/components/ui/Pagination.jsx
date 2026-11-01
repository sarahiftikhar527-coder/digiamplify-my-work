export default function Pagination({ page, pages, onChange }) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} className="px-2 disabled:opacity-30">‹</button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`h-6 w-6 rounded-full ${page === i + 1 ? "bg-brand text-white" : "hover:bg-white/10"}`}
        >
          {i + 1}
        </button>
      ))}
      <button disabled={page === pages} onClick={() => onChange(page + 1)} className="px-2 disabled:opacity-30">›</button>
    </div>
  );
}