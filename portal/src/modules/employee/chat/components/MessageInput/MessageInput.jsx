import { useMemo, useRef, useState } from "react";
import { AtSign, FileText, Paperclip, Smile, X } from "lucide-react";
import Avatar from "../Avatar";
import useClickOutside from "../../../../../hooks/useClickOutside";
import { scrollbar } from "../../../../../utils/format";

const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "❤️", "😢", "😮", "👏", "✅"];
const MAX_FILE = 10 * 1024 * 1024;

const MessageInput = ({ me, myId, members = [], isGroup, replyTo, onCancelReply, onSend, disabled }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const taRef = useRef(null);
  const fileRef = useRef(null);
  const emojiRef = useRef(null);
  useClickOutside(emojiRef, () => setEmojiOpen(false), emojiOpen);

  const candidates = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return [{ id: "all", name: "All", hint: "Mention all members in this chat" }, ...members.filter((m) => m.id !== myId)].filter(
      (m) => m.name.toLowerCase().includes(q)
    );
  }, [mentionQuery, members, myId]);

  const autosize = (el) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setText(v);
    autosize(e.target);
    if (isGroup) {
      const before = v.slice(0, e.target.selectionStart);
      const m = before.match(/(?:^|\s)@([^\s@]*)$/);
      setMentionQuery(m ? m[1] : null);
    }
  };

  const pickMention = (m) => {
    const el = taRef.current;
    const pos = el.selectionStart;
    const before = text.slice(0, pos).replace(/@([^\s@]*)$/, `@${m.name} `);
    setText(before + text.slice(pos));
    setMentions((p) => (p.some((x) => x.id === m.id) ? p : [...p, { id: m.id, name: m.name }]));
    setMentionQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(before.length, before.length);
    });
  };

  const startMention = () => {
    setText((t) => t + (t && !t.endsWith(" ") ? " @" : "@"));
    setMentionQuery("");
    taRef.current?.focus();
  };

  const onFiles = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.size <= MAX_FILE);
    setFiles((p) => [...p, ...picked].slice(0, 5));
    e.target.value = "";
  };

  const submit = () => {
    const clean = text.trim();
    if ((!clean && !files.length) || disabled) return;
    const used = mentions.filter((m) => clean.includes(`@${m.name}`));
    onSend({ text: clean, mentions: used, files, replyTo });
    setText("");
    setFiles([]);
    setMentions([]);
    setMentionQuery(null);
    setEmojiOpen(false);
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") setMentionQuery(null);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative border-t border-white/10 bg-[#101010] px-3 py-3 sm:px-4">
      {replyTo && (
        <div className="mb-2 flex items-start justify-between gap-3 rounded-lg border-l-2 border-red-600 bg-[#1a1a1a] px-3 py-2">
          <div className="min-w-0 text-[11px]">
            <p className="font-semibold text-red-400">Replying to {replyTo.sender?.name}</p>
            <p className="truncate text-white/60">{replyTo.text || "Attachment"}</p>
          </div>
          <button onClick={onCancelReply} aria-label="Cancel reply" className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-2 rounded-full bg-[#1c1c1c] px-3 py-1 text-[11px] text-white/80">
              <FileText size={12} />
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button onClick={() => setFiles((p) => p.filter((_, x) => x !== i))} aria-label="Remove file">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {mentionQuery !== null && candidates.length > 0 && (
        <div className={`absolute bottom-full left-3 right-3 z-30 mb-2 max-h-56 rounded-xl border border-white/10 bg-[#0d0d0d] p-1 shadow-2xl sm:right-auto sm:w-72 ${scrollbar}`}>
          {candidates.map((m) => (
            <button key={m.id} onClick={() => pickMention(m)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/5">
              <Avatar src={m.avatar} name={m.name} group={m.id === "all"} size={26} />
              <div className="min-w-0">
                <p className="truncate text-[13px] text-white">{m.name}</p>
                {m.hint && <p className="text-[10px] text-white/40">{m.hint}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#161616] px-3 py-2">
        <div className="pb-0.5">
          <Avatar src={me?.avatar} name={me?.name} size={26} />
        </div>
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder="Type your message..."
          className="max-h-28 min-w-0 flex-1 resize-none bg-transparent py-1 text-[12.5px] text-white outline-none placeholder:text-white/40"
        />

        <div className="flex items-center gap-1 pb-0.5 text-white/60">
          <button onClick={() => fileRef.current?.click()} aria-label="Attach" className="rounded-full p-1.5 hover:bg-white/10 hover:text-white">
            <Paperclip size={14} />
          </button>
          <input ref={fileRef} type="file" multiple hidden onChange={onFiles} />
          <button
            onClick={startMention}
            disabled={!isGroup}
            aria-label="Mention"
            className="rounded-full p-1.5 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <AtSign size={14} />
          </button>
          <div ref={emojiRef} className="relative">
            <button onClick={() => setEmojiOpen((v) => !v)} aria-label="Emoji" className="rounded-full p-1.5 hover:bg-white/10 hover:text-white">
              <Smile size={14} />
            </button>
            {emojiOpen && (
              <div className="absolute bottom-full right-0 mb-2 grid w-48 grid-cols-6 gap-1 rounded-xl border border-white/10 bg-[#0d0d0d] p-2 shadow-2xl">
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => { setText((t) => t + e); taRef.current?.focus(); }} className="text-[18px] hover:scale-125">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={submit}
            disabled={disabled || (!text.trim() && !files.length)}
            className="ml-1 rounded-full bg-red-600 px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;