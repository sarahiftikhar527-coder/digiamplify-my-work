
import { useCallback, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import chatService from "@/services/chatService";
import useClickOutside from "@/hooks/useClickOutside";

const ChatAiAssist = ({
  conversationId,
  text = "",
  onUse,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [source, setSource] = useState("");
  const [instruction, setInstruction] = useState("");

  const wrapRef = useRef(null);
  const requestRef = useRef(0);

  const draft = String(text || "").trim();
  const hasDraft = draft.length >= 3;

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapRef, close, open);

  const load = useCallback(
    async (wanted = "") => {
      if (!conversationId) return;

      const requestId = ++requestRef.current;

      setLoading(true);
      setError("");

      try {
        const response = await chatService.getAiSuggestions({
          conversationId,
          draft: wanted ? "" : draft,
          instruction: wanted,
        });

        if (requestId !== requestRef.current) return;

        const data = response?.data ?? response;

        setSuggestions(
          Array.isArray(data?.suggestions)
            ? data.suggestions
            : []
        );

        setSource(data?.source || "");
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

  const toggle = () => {
    if (disabled || !conversationId) return;

    const next = !open;
    setOpen(next);

    if (next) load();
  };

  const generate = () => {
    const wanted = instruction.trim();

    if (wanted) {
      load(wanted);
    }
  };

  const pick = (value) => {
    onUse?.(value);
    setOpen(false);
  };

  if (!conversationId) return null;

  return (
    <div
      ref={wrapRef}
      className="absolute left-3 top-1/2 z-30 -translate-y-1/2"
    >
      {/* Blue Dot Button */}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label="AI writing suggestions"
        title="AI suggestions"
        className="flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          className={`block h-3.5 w-3.5 rounded-full transition-all duration-200 ${
            hasDraft
              ? "bg-blue-400 shadow-[0_0_6px_2px_rgba(59,130,246,0.65),0_0_14px_4px_rgba(59,130,246,0.25)]"
              : "bg-blue-500 shadow-[0_0_5px_2px_rgba(59,130,246,0.45),0_0_12px_3px_rgba(59,130,246,0.18)]"
          }`}
        />
      </button>

      {/* AI Suggestions Popup */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[#0d0d0d] p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-[12px] font-semibold text-white">
                AI suggestions
              </p>

              {source && !loading && (
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[9px] font-medium text-blue-300">
                  {source === "ai" ? "AI" : "Smart template"}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              aria-label="Refresh suggestions"
              className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <RefreshCw
                size={12}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>

          <p className="mb-2 text-[10px] text-white/40">
            {hasDraft
              ? "Better ways to write your message. Tap one to use it."
              : "Quick replies to the latest message. Tap one to use it."}
          </p>

          <div className="max-h-56 space-y-1.5 overflow-y-auto">
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

            {!loading &&
              suggestions.map((suggestion, index) => (
                <button
                  key={`${index}-${suggestion.slice(0, 12)}`}
                  type="button"
                  onClick={() => pick(suggestion)}
                  className="block w-full rounded-lg border border-white/10 bg-[#161616] px-3 py-2 text-left text-[12px] leading-snug text-white/90 transition hover:border-blue-500/50 hover:bg-blue-500/10"
                >
                  {suggestion}
                </button>
              ))}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
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
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#161616] px-3 py-1.5 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-blue-500/60"
            />

            <button
              type="button"
              onClick={generate}
              disabled={loading || !instruction.trim()}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Generate
            </button>
          </div>

          <p className="mt-1.5 text-[9px] text-white/30">
            Example: congratulate Ali on his bonus, or approve 2 days of holiday.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatAiAssist;
