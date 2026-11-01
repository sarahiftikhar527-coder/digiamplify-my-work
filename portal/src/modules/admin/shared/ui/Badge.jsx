const tones = {
  success: "border-green-500 text-green-400 bg-green-500/10",
  warning: "border-amber-500 text-amber-400 bg-amber-500/10",
  danger: "border-red-500 text-red-400 bg-red-500/10",
  info: "border-blue-500 text-blue-400 bg-blue-500/10",
  neutral: "border-gray-500 text-gray-300 bg-gray-500/10",
};

export default function Badge({ tone = "neutral", children }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-[10px] ${tones[tone]}`}>
      {children}
    </span>
  );
}