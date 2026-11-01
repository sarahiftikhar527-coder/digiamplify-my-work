import { Star } from "lucide-react";

export default function Stars({ value = 0, size = 13, onChange }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          onClick={onChange ? () => onChange(i + 1) : undefined}
          className={`${i < value ? "fill-amber-400 text-amber-400" : "text-gray-600"} ${onChange ? "cursor-pointer" : ""}`}
        />
      ))}
    </span>
  );
}