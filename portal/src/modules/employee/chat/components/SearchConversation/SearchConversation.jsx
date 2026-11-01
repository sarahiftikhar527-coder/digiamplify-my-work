import { Search } from "lucide-react";

const SearchConversation = ({ value, onChange }) => (
  <label className="flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-2">
    <Search size={14} className="text-white/60" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search Conversation..."
      className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-white/40"
    />
  </label>
);

export default SearchConversation;