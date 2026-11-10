import { useCallback, useState } from "react";
import MeetingDetails from "./components/MeetingDetails";
import MeetingModal from "./components/MeetingModal";

/**
 * Owns the schedule / details modals so any page can just do:
 *   const mt = useMeetingModals({ currentUserId, onChanged, onToast });
 *   <button onClick={() => mt.openCreate()}>...  and render {mt.modals}
 */
export default function useMeetingModals({ currentUserId, onChanged, onToast } = {}) {
  const [form, setForm] = useState(null); // { meeting?, defaultDate? }
  const [details, setDetails] = useState(null);

  const openCreate = useCallback((defaultDate) => setForm({ meeting: null, defaultDate }), []);
  const openDetails = useCallback((meeting) => meeting && setDetails(meeting), []);

  const modals = (
    <>
      {form && (
        <MeetingModal
          meeting={form.meeting}
          defaultDate={form.defaultDate}
          currentUserId={currentUserId}
          onClose={() => setForm(null)}
          onSaved={(saved, mode) => {
            setForm(null);
            setDetails(null);
            onToast?.(mode === "created" ? "Meeting scheduled. Invitations sent." : "Meeting updated.");
            onChanged?.(mode, saved);
          }}
        />
      )}

      {details && !form && (
        <MeetingDetails
          key={`${details.id}-${details.occurrenceKey}`}
          meeting={details}
          currentUserId={currentUserId}
          onClose={() => setDetails(null)}
          onEdit={(meeting) => setForm({ meeting })}
          onChanged={(type, updated) => onChanged?.(type, updated)}
          onToast={onToast}
        />
      )}
    </>
  );

  return { openCreate, openDetails, modals };
}