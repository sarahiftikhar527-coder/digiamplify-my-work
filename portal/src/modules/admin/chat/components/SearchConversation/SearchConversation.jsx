
import { Search, X } from "lucide-react";

const SearchConversation = ({ value = "", onChange }) => {
  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  const clearSearch = () => {
    onChange?.("");
  };

  return (
    <label className="flex items-center gap-2 rounded-full border border-white/10 bg-[#161616] px-3 py-2 transition-colors focus-within:border-red-600">
      <Search
        size={14}
        className="shrink-0 text-white/60"
        aria-hidden="true"
      />

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search conversations..."
        aria-label="Search conversations"
        className="w-full min-w-0 bg-transparent text-[12px] text-white outline-none placeholder:text-white/40"
      />

      {value && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear conversation search"
          title="Clear search"
          className="shrink-0 rounded-full p-0.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={13} />
        </button>
      )}
    </label>
  );
};

export default SearchConversation;