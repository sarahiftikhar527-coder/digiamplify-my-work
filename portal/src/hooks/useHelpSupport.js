import { useCallback, useEffect, useState } from "react";
import { helpSupportService } from "../services/helpSupportService";

export default function useHelpSupport() {
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [faqsError, setFaqsError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [t, f] = await Promise.allSettled([helpSupportService.getTickets(), helpSupportService.getFaqs()]);
    if (t.status === "fulfilled") {
      setTickets(t.value || []);
      setTicketsError("");
    } else setTicketsError(t.reason?.message || "Failed to load tickets");
    if (f.status === "fulfilled") {
      setFaqs(f.value || []);
      setFaqsError("");
    } else setFaqsError(f.reason?.message || "Failed to load FAQs");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTicket = useCallback((t) => {
    if (!t?.id) return;
    setTickets((p) => [t, ...p.filter((x) => x.id !== t.id)]);
  }, []);

  return { tickets, faqs, loading, ticketsError, faqsError, reload: load, addTicket };
}