export const scrollbar =
  "overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15";

export const isSameDay = (a, b) => a.toDateString() === b.toDateString();

export const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

export const formatListTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  if (isSameDay(d, new Date())) return `${Math.floor(min / 60)}h`;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (isSameDay(d, y)) return "yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatDateLabel = (iso) => {
  const d = new Date(iso);
  const full = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (isSameDay(d, new Date())) return `Today, ${full}`;
  if (isSameDay(d, y)) return `Yesterday, ${full}`;
  return full;
};

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();