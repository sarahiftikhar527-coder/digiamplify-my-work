import { useCallback, useMemo, useState } from "react";
import { helpSupportService } from "../services/helpSupportService";
import { CONTACT_METHODS, PRIORITIES } from "../constants/helpandsupport.js";

const INITIAL = {
  issueType: "",
  subject: "",
  priority: "high",
  description: "",
  contactMethod: "email",
  files: [],
};

const FIELD_ORDER = ["issueType", "subject", "priority", "description", "contactMethod"];

const validate = (v) => {
  const e = {};
  const subject = v.subject.trim();
  const description = v.description.trim();
  if (!v.issueType.trim()) e.issueType = "Issue type is required";
  if (!subject) e.subject = "Subject is required";
  else if (subject.length < 3) e.subject = "Subject must be at least 3 characters";
  if (!description) e.description = "Description is required";
  else if (description.length < 10) e.description = "Please describe the problem in at least 10 characters";
  if (!PRIORITIES.some((p) => p.value === v.priority)) e.priority = "Select a priority";
  if (!CONTACT_METHODS.some((c) => c.value === v.contactMethod)) e.contactMethod = "Select a contact method";
  return e;
};

export default function useReportProblem({ onCreated } = {}) {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [ticket, setTicket] = useState(null);

  const setField = useCallback((key, val) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => (p[key] ? { ...p, [key]: undefined } : p));
  }, []);

  const isDirty = useMemo(
    () =>
      !!(values.issueType.trim() || values.subject.trim() || values.description.trim() || values.files.length),
    [values]
  );

  const submit = useCallback(async () => {
    if (submitting) return;
    const errs = validate(values);
    setErrors(errs);
    const firstBad = FIELD_ORDER.find((k) => errs[k]);
    if (firstBad) {
      requestAnimationFrame(() => document.getElementById(`rp-${firstBad}`)?.focus());
      return;
    }

    setSubmitting(true);
    setServerError("");
    try {
      const fd = new FormData();
      fd.append("issueType", values.issueType.trim());
      fd.append("subject", values.subject.trim());
      fd.append("priority", values.priority);
      fd.append("description", values.description.trim());
      fd.append("contactMethod", values.contactMethod);
      values.files.forEach((f) => fd.append("attachments", f));

      const res = await helpSupportService.createTicket(fd);
      setTicket(res || {});
      onCreated?.(res);
    } catch (e) {
      if (e.data?.errors && typeof e.data.errors === "object") setErrors(e.data.errors);
      setServerError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [values, submitting, onCreated]);

  return { values, errors, setField, submitting, serverError, ticket, isDirty, submit };
}