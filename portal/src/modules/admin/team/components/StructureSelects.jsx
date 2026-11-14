import { POSITION_OPTIONS } from "@/constants/positions";

const selectClass =
  "w-full min-w-[150px] rounded-md border border-[#333] bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none transition focus:border-red-700 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Role (position) dropdown used on the approvals screen and the
 * Roles & Hierarchy screen.
 */
export function PositionSelect({ value, onChange, disabled = false, id }) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={selectClass}
      aria-label="Role"
    >
      {POSITION_OPTIONS.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#0b0b0b]">
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * "Reports to" dropdown. `leaders` is a list of { id, name, positionLabel }.
 * The person being edited can be passed as `excludeId` so nobody can report
 * to themselves.
 */
export function LeaderSelect({
  value,
  onChange,
  leaders = [],
  excludeId = null,
  disabled = false,
  id,
}) {
  return (
    <select
      id={id}
      value={value || ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={selectClass}
      aria-label="Reports to"
    >
      <option value="" className="bg-[#0b0b0b]">
        No leader (reports to admin)
      </option>

      {leaders
        .filter((leader) => leader.id !== excludeId)
        .map((leader) => (
          <option key={leader.id} value={leader.id} className="bg-[#0b0b0b]">
            {leader.name} ({leader.positionLabel})
          </option>
        ))}
    </select>
  );
}