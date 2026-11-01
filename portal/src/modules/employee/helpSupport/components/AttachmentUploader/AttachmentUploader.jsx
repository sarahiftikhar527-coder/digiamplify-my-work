import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { ALLOWED_EXT, MAX_FILES, MAX_FILE_SIZE } from "../../../../../constants/helpandsupport";

const ext = (name) => name.split(".").pop().toLowerCase();
const fmt = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

const AttachmentUploader = ({ files, onChange, disabled }) => {
  const [drag, setDrag] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef(null);

  const addFiles = (list) => {
    const incoming = Array.from(list || []);
    const problems = [];
    const next = [...files];

    for (const f of incoming) {
      if (!ALLOWED_EXT.includes(ext(f.name))) problems.push(`${f.name}: unsupported file type`);
      else if (f.size === 0) problems.push(`${f.name}: file is empty`);
      else if (f.size > MAX_FILE_SIZE) problems.push(`${f.name}: larger than 5 MB`);
      else if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      else if (next.length >= MAX_FILES) {
        problems.push(`Maximum ${MAX_FILES} files allowed`);
        break;
      } else next.push(f);
    }

    setNotice(problems.join(" · "));
    if (next.length !== files.length) onChange(next);
  };

  const open = () => !disabled && inputRef.current?.click();

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload attachments"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-4 py-8 text-center outline-none transition focus-visible:border-red-600 sm:py-10 ${
          drag ? "border-red-600 bg-red-600/5" : "border-white/50"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c5cae9] text-[#33406b]">
          <UploadCloud size={18} />
        </span>
        <p className="mt-4 text-[12px] font-semibold text-white">Drag &amp; Drop files here</p>
        <p className="mt-1 text-[11.5px] text-white/60">
          or <span className="text-red-500">browse files</span> from computer
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          {[".PDF", ".DOC", ".PNG", ".JPG"].map((t) => (
            <span key={t} className="rounded-lg bg-white px-3.5 py-1.5 text-[10px] text-[#555] shadow">
              {t}
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept={ALLOWED_EXT.map((x) => `.${x}`).join(",")}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {notice && (
        <p role="alert" className="mt-2 text-[11.5px] text-red-400">
          {notice}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => {
            const isImg = ["png", "jpg", "jpeg"].includes(ext(f.name));
            const Icon = isImg ? ImageIcon : FileText;
            return (
              <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#101012] px-3 py-2">
                <Icon size={16} className="shrink-0 text-red-500" />
                <span className="min-w-0 flex-1 truncate text-[12px] text-white">{f.name}</span>
                <span className="shrink-0 text-[11px] text-white/50">{fmt(f.size)}</span>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Remove ${f.name}`}
                  onClick={() => onChange(files.filter((_, x) => x !== i))}
                  className="shrink-0 text-white/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AttachmentUploader;