
export default function Avatar({
  name = '',
  size = 'h-8 w-8',
  online = false,
}) {
  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-300 text-[10px] font-semibold text-neutral-800 ${size}`}
      aria-label={name ? `Avatar for ${name}` : 'User avatar'}
      role="img"
    >
      {initials || '?'}

      {online && (
        <span
          className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-black bg-emerald-500"
          aria-label="Online"
          title="Online"
        />
      )}
    </span>
  );
}
