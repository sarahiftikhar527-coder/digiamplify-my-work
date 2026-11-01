import { Flag } from "lucide-react";
import IssueTypeSelect from "../IssueTypeSelect";
import ListboxSelect from "../ListboxSelect";
import AttachmentUploader from "../AttachmentUploader";
import PreferredContactSelect from "../PreferredContactSelect";
import SubmitReportButton from "../SubmitReportButton";
import { LIMITS, PRIORITIES } from "../../../../../constants/helpandsupport";

const Field = ({ label, required, htmlFor, error, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-medium text-white">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p role="alert" className="mt-1.5 text-[11.5px] text-red-400">
        {error}
      </p>
    )}
  </div>
);

const inputCls = (error) =>
  `w-full rounded-lg border bg-[#101012] px-3.5 py-2.5 text-[12.5px] text-white outline-none transition placeholder:text-white/40 focus:border-red-600 disabled:opacity-60 ${
    error ? "border-red-600" : "border-white/10"
  }`;

const ReportProblemForm = ({ form, onSubmit }) => {
  const { values, errors, setField, submitting, serverError } = form;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      {serverError && (
        <div role="alert" className="rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-2.5 text-[12px] text-red-300">
          {serverError}
        </div>
      )}

      <Field label="Issue Type" required htmlFor="rp-issueType" error={errors.issueType}>
        <IssueTypeSelect
          value={values.issueType}
          onChange={(v) => setField("issueType", v)}
          error={errors.issueType}
          disabled={submitting}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Subject" required htmlFor="rp-subject" error={errors.subject}>
          <input
            id="rp-subject"
            value={values.subject}
            maxLength={LIMITS.subject}
            disabled={submitting}
            onChange={(e) => setField("subject", e.target.value)}
            placeholder="Enter subject"
            className={inputCls(errors.subject)}
          />
        </Field>

        <Field label="Priority Type" required htmlFor="rp-priority" error={errors.priority}>
          <ListboxSelect
            id="rp-priority"
            ariaLabel="Priority type"
            icon={Flag}
            value={values.priority}
            options={PRIORITIES}
            onChange={(v) => setField("priority", v)}
            error={errors.priority}
            disabled={submitting}
          />
        </Field>
      </div>

      <Field label="Description" required htmlFor="rp-description" error={errors.description}>
        <textarea
          id="rp-description"
          rows={4}
          value={values.description}
          maxLength={LIMITS.description}
          disabled={submitting}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Enter description for Problem..."
          className={`${inputCls(errors.description)} resize-none`}
        />
        <p className="mt-1 text-right text-[10px] text-white/40">
          {values.description.length}/{LIMITS.description}
        </p>
      </Field>

      <Field label="Attachment (Optional)">
        <AttachmentUploader files={values.files} onChange={(f) => setField("files", f)} disabled={submitting} />
      </Field>

      <Field label="Preferred Contact Method" htmlFor="rp-contactMethod" error={errors.contactMethod}>
        <PreferredContactSelect
          value={values.contactMethod}
          onChange={(v) => setField("contactMethod", v)}
          error={errors.contactMethod}
          disabled={submitting}
        />
      </Field>

      <div className="flex justify-end pt-1">
        <SubmitReportButton loading={submitting} />
      </div>
    </form>
  );
};

export default ReportProblemForm;