const COLORS = ["#b91c1c", "#7c3aed", "#0369a1", "#047857", "#b45309", "#be185d"];

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function Avatar({ user, size = 24, index = 0 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  return user.avatar ? (
    <img src={user.avatar} alt={user.name} title={user.name} style={style}
      className="rounded-full border border-[#0b0b0b] object-cover" />
  ) : (
    <span title={user.name}
      style={{ ...style, background: COLORS[index % COLORS.length] }}
      className="inline-flex items-center justify-center rounded-full border border-[#0b0b0b] font-semibold text-white">
      {initials(user.name)}
    </span>
  );
}

export default function AvatarStack({ users, max = 3, size = 24 }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  if (!users.length) return <span className="text-[11px] text-neutral-500">Unassigned</span>;
  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <span key={u.id} className={i ? "-ml-2" : ""}><Avatar user={u} size={size} index={i} /></span>
      ))}
      {extra > 0 && <span className="ml-1.5 text-[11px] text-neutral-300">+{extra}</span>}
    </div>
  );
}
