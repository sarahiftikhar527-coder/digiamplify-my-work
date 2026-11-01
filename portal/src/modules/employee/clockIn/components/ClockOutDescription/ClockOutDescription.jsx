import { MessageSquareText } from "lucide-react";
import Card from "../Card";

const MAX = 500;

const ClockOutDescription = ({ value, onChange, disabled, readOnly }) => (
  <Card icon={MessageSquareText} title="Description" className="lg:col-span-2">
    <textarea
      value={value}
      maxLength={MAX}
      disabled={disabled}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      placeholder="Describe here what task you have completed today..."
      className="w-full resize-none rounded-lg border border-white/10 bg-[#121212] p-3 text-[12.5px] text-white outline-none placeholder:text-white/40 focus:border-red-600 disabled:opacity-60"
    />
    {!readOnly && <p className="mt-1 text-right text-[10px] text-white/40">{value.length}/{MAX}</p>}
  </Card>
);

export default ClockOutDescription;