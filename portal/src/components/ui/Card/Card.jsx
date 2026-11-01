export default function Card({ title, action, className = "", children }) {
  return (
    <section className={`rounded-xl border border-line bg-surface-card p-4 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h3 className="text-sm font-medium text-white">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}