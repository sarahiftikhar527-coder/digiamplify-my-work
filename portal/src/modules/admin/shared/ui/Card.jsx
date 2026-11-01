export default function Card({ title, action, className = "", children }) {
  return (
    <section className={`rounded-xl border border-line bg-surface-card p-4 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h3 className="text-base font-medium text-white sm:text-lg">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}