import { useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import useClickOutside from "../../../../../hooks/useClickOutside";
import { ISSUE_TYPES, LIMITS } from "../../../../../constants/helpandsupport";

// Combobox: list se select karo ya khud type karo
const IssueTypeSelect = ({ value, onChange, error, disabled }) => {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const list = useMemo(() => {
    const q = value.trim().toLowerCase();
    return typed && q ? ISSUE_TYPES.filter((o) => o.toLowerCase().includes(q)) : ISSUE_TYPES;
  }, [value, typed]);

  const select = (o) => {
    onChange(o);
    setOpen(false);
    setTyped(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
      } else setActive((a) => Math.min(a + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && active >= 0 && list[active]) {
      e.preventDefault();
      select(list[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center rounded-lg border bg-[#101012] transition focus-within:border-red-600 ${
          error ? "border-red-600" : "border-white/10"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <input
          id="rp-issueType"
          role="combobox"
          aria-expanded={open}
          aria-controls="rp-issueType-list"
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `rp-issueType-opt-${active}` : undefined}
          disabled={disabled}
          value={value}
          maxLength={LIMITS.issueType}
          autoComplete="off"
          placeholder="Enter or select issue type"
          onChange={(e) => {
            onChange(e.target.value);
            setTyped(true);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setTyped(false)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-[12.5px] text-white outline-none placeholder:text-white/40"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Toggle issue types"
          onClick={() => {
            setTyped(false);
            setOpen((v) => !v);
          }}
          className="px-3.5 text-white/80"
        >
          <ChevronDown size={15} className={`transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && list.length > 0 && (
        <ul
          id="rp-issueType-list"
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#111113] py-1 shadow-2xl"
        >
          {list.map((o, i) => (
            <li
              key={o}
              id={`rp-issueType-opt-${i}`}
              role="option"
              aria-selected={o === value}
              onMouseDown={(e) => {
                e.preventDefault();
                select(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3.5 py-2 text-[12.5px] ${i === active ? "bg-white/10" : ""} ${
                o === value ? "text-white" : "text-white/80"
              }`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssueTypeSelect;