import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import useClickOutside from "../../../../../hooks/useClickOutside";

// options: [{ value, label, color? }]
const ListboxSelect = ({
  id, value, options, onChange, icon: Icon, error, disabled, ariaLabel, dropUp = false,
}) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const selected = options.find((o) => o.value === value);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const choose = (o) => {
    onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open ? setActive((a) => Math.min(a + 1, options.length - 1)) : openList();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      open ? setActive((a) => Math.max(a - 1, 0)) : openList();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open ? choose(options[active]) : openList();
    } else if (e.key === "Escape" && open) {
      e.preventDefault(); // modal ko close hone se roko
      setOpen(false);
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border bg-[#101012] px-3.5 py-2.5 text-[12.5px] text-white outline-none transition ${
          error || open ? "border-red-600" : "border-white/10 focus:border-red-600"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={14} className={selected?.color || "text-red-500"} />}
          <span className="truncate">{selected?.label}</span>
        </span>
        <ChevronDown size={15} className={`shrink-0 text-white/80 transition ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className={`absolute z-20 w-full overflow-hidden rounded-lg border border-white/10 bg-[#111113] py-1 shadow-2xl ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-2 px-3.5 py-2 text-[12.5px] ${
                i === active ? "bg-white/10" : ""
              } ${o.value === value ? "text-white" : "text-white/80"}`}
            >
              {Icon && <Icon size={14} className={o.color || "text-red-500"} />}
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListboxSelect;