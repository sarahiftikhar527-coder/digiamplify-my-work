import { Clock } from "lucide-react";
import Card from "@/modules/admin/shared/ui/Card";

export default function PerformanceSummary({ items }) {
  return (
    <Card title="Performance Summary">
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
              <Clock size={14} />
            </span>
            <span className="flex-1 text-xs text-gray-300">{it.label}</span>
            <span className="text-sm font-medium text-white">{it.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}