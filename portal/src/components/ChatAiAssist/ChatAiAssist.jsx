
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, X } from "lucide-react";
import chatService from "@/services/chatService";
import useClickOutside from "@/hooks/useClickOutside";

const TABS = [
  { id: "fix", label: "Fix my text" },
  { id: "reply", label: "Smart reply" },
  { id: "write", label: "Write for me" },
];

const FIX_OPTIONS = [
  { id: "fix", label: "Fix mistakes" },
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "short", label: "Shorter" },
  { id: "detailed", label: "More detail" },
];

const EXAMPLES = [
  "Congratulate Ali on his bonus",
  "Ask for 2 days leave next week",
  "Tell the team the meeting is moved to 4 PM",
];

const shorten = (value, max = 90) => {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const ChatAiAssist = ({
  conversationId,
  text = "",
  onUse,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("fix");
  const [fixOption, setFixOption] = useState("fix");
  const [instruction, setInstruction] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [source, setSource] = useState("");
  const [context, setContext] = useState(null);

  const wrapRef = useRef(null);
  const requestRef = useRef(0);

  const draft = String(text || "").trim();
  const hasDraft = draft.length >= 2;

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapRef, close, open);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const reset = () => {
    requestRef.current += 1;
    setLoading(false);
    setError("");
    setNotice("");
    setSuggestions([]);
    setSource("");
    setContext(null);
  };

  const run = useCallback(
    async ({ mode, tone = "", wanted = "" }) => {
      if (!conversationId) return;

      const requestId = ++requestRef.current;

      setLoading(true);
      setError("");
      setNotice("");

      try {
        const response = await chatService.getAiSuggestions({
          conversationId,
          draft,
          instruction: wanted,
          mode,
          tone,
        });

        if (requestId !== requestRef.current) return;

        const data = response?.data ?? response;

        setSuggestions(
          Array.isArray(data?.suggestions) ? data.suggestions : []
        );
        setSource(data?.source || "");
        setNotice(data?.notice || "");
        setContext(data?.context || null);
      } catch (exception) {
        if (requestId !== requestRef.current) return;

        setSuggestions([]);
        setError(
          exception?.message || "Could not get suggestions."
        );
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
        }
      }
    },
    [conversationId, draft]
  );

  const runFix = (optionId) => {
    setFixOption(optionId);

    if (!hasDraft) {
      reset();
      return;
    }

    if (optionId === "fix") {
      run({ mode: "fix" });
    } else {
      run({ mode: "tone", tone: optionId });
    }
  };

  const runReply = () => run({ mode: "reply" });

  const generate = () => {
    const wanted = instruction.trim();

    if (wanted) run({ mode: "write", wanted });
  };

  const openTab = (nextTab) => {
    setTab(nextTab);
    reset();

    if (nextTab === "fix") {
      if (hasDraft) runFix(fixOption);
    } else if (nextTab === "reply") {
      runReply();
    }
  };

  const toggle = () => {
    if (disabled || !conversationId) return;

    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);

    const startTab = hasDraft ? "fix" : "reply";

    setTab(startTab);
    setFixOption("fix");
    reset();

    if (startTab === "fix") {
      run({ mode: "fix" });
    } else {
      run({ mode: "reply" });
    }
  };

  const refresh = () => {
    if (tab === "fix") {
      runFix(fixOption);
    } else if (tab === "reply") {
      runReply();
    } else {
      generate();
    }
  };

  const pick = (value) => {
    onUse?.(value);
    setOpen(false);
  };

  if (!conversationId) return null;

  const sourceLabel =
    source === "ai" ? "AI" : source === "basic" ? "Basic fix" : "";

  return (
    <div
      ref={wrapRef}
      className="absolute left-3 top-[42%] z-30 -translate-y-1/2"
    >
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label="AI writing assistant"
        aria-expanded={open}
        title="AI writing assistant"
        className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 ${
          open || hasDraft
            ? "border-sky-400/50 bg-sky-400/10"
            : "border-white/15 bg-[#1a1a1a] hover:border-sky-400/50"
        }`}
      >
        <span className="relative flex h-3 w-3 -translate-y-1 items-center justify-center">
          <span className="absolute h-3 w-3 animate-ping rounded-full bg-sky-400/40" />
          <span className="absolute h-2.5 w-2.5 rounded-full border border-sky-300/50 bg-sky-400/20 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_7px_rgba(56,189,248,1)]" />
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[#0d0d0d] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-sky-400/40" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              </span>

              <p className="text-[12px] font-semibold text-white">
                AI assistant
              </p>

              {sourceLabel && !loading && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/70">
                  {sourceLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                aria-label="Refresh suggestions"
                className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <RefreshCw
                  size={12}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-[#161616] p-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openTab(item.id)}
                className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
                  tab === item.id
                    ? "bg-[#F0202F] text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "fix" && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {FIX_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => runFix(option.id)}
                  disabled={loading}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition disabled:opacity-40 ${
                    fixOption === option.id
                      ? "border-[#F0202F]/60 bg-[#F0202F]/15 text-white"
                      : "border-white/10 text-white/60 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {tab === "fix" && !hasDraft && (
            <p className="rounded-lg bg-white/5 px-3 py-2 text-[11px] text-white/60">
              Type your message in the box first. I will fix the
              mistakes or rewrite it in a better way.
            </p>
          )}

          {tab === "reply" && (
            <div className="mb-2 space-y-1">
              {context?.text && (
                <p className="rounded-lg border-l-2 border-[#F0202F] bg-[#161616] px-3 py-1.5 text-[11px] text-white/70">
                  <span className="font-semibold text-white/90">
                    {context.from}:
                  </span>{" "}
                  {shorten(context.text)}
                </p>
              )}

              <p className="text-[10px] text-white/40">
                {hasDraft
                  ? "I will use the text you typed as your idea and write full replies."
                  : "Replies based on the latest message. Tip: type a few words first (like 'congrats' or 'ok') and I will write the full reply."}
              </p>
            </div>
          )}

          {tab === "write" && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <input
                  value={instruction}
                  onChange={(event) =>
                    setInstruction(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      generate();
                    }
                  }}
                  placeholder="Tell AI what to write..."
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#161616] px-3 py-1.5 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-[#F0202F]/60"
                />

                <button
                  type="button"
                  onClick={generate}
                  disabled={loading || !instruction.trim()}
                  className="rounded-lg bg-[#F0202F] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#d41a28] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Write
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setInstruction(example)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/50 transition hover:border-white/25 hover:text-white"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-60 space-y-1.5 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-white/50">
                <Loader2 size={14} className="animate-spin" />
                Thinking...
              </div>
            )}

            {!loading && error && (
              <p className="rounded-lg bg-red-600/10 px-3 py-2 text-[11px] text-red-300">
                {error}
              </p>
            )}

            {!loading && notice && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                {notice}
              </p>
            )}

            {!loading &&
              suggestions.map((suggestion, index) => (
                <button
                  key={`${index}-${suggestion.slice(0, 12)}`}
                  type="button"
                  onClick={() => pick(suggestion)}
                  className="block w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-left text-[12px] leading-snug text-white/90 transition hover:border-[#F0202F]/50 hover:bg-[#F0202F]/10"
                >
                  {suggestion}
                </button>
              ))}
          </div>

          {!loading && suggestions.length > 0 && (
            <p className="mt-2 text-[9px] text-white/30">
              Tap a suggestion to put it in the message box. You can
              still edit it before sending.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatAiAssist;
