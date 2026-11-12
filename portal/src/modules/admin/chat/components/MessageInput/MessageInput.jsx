
import { useMemo, useRef, useState } from "react";
import {
  AtSign,
  FileText,
  Paperclip,
  Smile,
  X,
} from "lucide-react";
import Avatar from "../Avatar";
import ChatAiAssist from "@/components/ChatAiAssist/ChatAiAssist";
import useClickOutside from "../../../../../hooks/useClickOutside";
import { scrollbar } from "../../../../../utils/format";

const EMOJIS = [
  "😀", "😂", "😍", "👍", "🙏", "🔥",
  "🎉", "❤️", "😢", "😮", "👏", "✅",
];

const MAX_FILE = 10 * 1024 * 1024;
const MAX_FILES = 5;

const MessageInput = ({
  me,
  myId,
  conversationId,
  members = [],
  isGroup = false,
  replyTo,
  onCancelReply,
  onSend,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const [sending, setSending] = useState(false);

  const taRef = useRef(null);
  const fileRef = useRef(null);
  const emojiRef = useRef(null);

  useClickOutside(
    emojiRef,
    () => setEmojiOpen(false),
    emojiOpen
  );

  const memberList = Array.isArray(members) ? members : [];

  const candidates = useMemo(() => {
    if (mentionQuery === null) {
      return [];
    }

    const query = mentionQuery.toLowerCase();

    const normalizedMembers = memberList
      .map((member) => {
        const user = member?.user || member || {};

        return {
          id: String(
            user.id ||
            user._id ||
            member?.id ||
            member?._id ||
            ""
          ),
          name: user.name || member?.name || "",
          avatar:
            user.avatar ||
            user.avatarUrl ||
            member?.avatar ||
            "",
        };
      })
      .filter((member) => member.id && member.name);

    const filteredMembers = normalizedMembers.filter(
      (member) =>
        member.id !== String(myId || "") &&
        member.name.toLowerCase().includes(query)
    );

    const allOption = {
      id: "all",
      name: "All",
      avatar: "",
      hint: "Mention all members in this chat",
    };

    return [
      ...(allOption.name.toLowerCase().includes(query)
        ? [allOption]
        : []),
      ...filteredMembers,
    ];
  }, [mentionQuery, memberList, myId]);

  const autosize = (element) => {
    if (!element) return;

    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 112)}px`;
  };

  const handleChange = (event) => {
    const value = event.target.value;
    const cursorPosition = event.target.selectionStart;

    setText(value);
    autosize(event.target);
    setFileError("");

    if (isGroup) {
      const beforeCursor = value.slice(0, cursorPosition);
      const match = beforeCursor.match(/(?:^|\s)@([^\s@]*)$/);

      setMentionQuery(match ? match[1] : null);
    } else {
      setMentionQuery(null);
    }
  };

  const pickMention = (member) => {
    const element = taRef.current;

    if (!element) return;

    const position = element.selectionStart;
    const beforeCursor = text.slice(0, position);
    const afterCursor = text.slice(position);

    const updatedBefore = beforeCursor.replace(
      /@([^\s@]*)$/,
      `@${member.name.replace(/\s+/g, " ")} `
    );

    const updatedText = updatedBefore + afterCursor;

    setText(updatedText);

    setMentions((previous) => {
      if (previous.some((item) => item.id === member.id)) {
        return previous;
      }

      return [
        ...previous,
        {
          id: member.id,
          name: member.name,
        },
      ];
    });

    setMentionQuery(null);

    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(
        updatedBefore.length,
        updatedBefore.length
      );
      autosize(element);
    });
  };

  const startMention = () => {
    if (!isGroup || disabled || sending) return;

    const element = taRef.current;

    if (!element) return;

    const position = element.selectionStart;
    const beforeCursor = text.slice(0, position);
    const afterCursor = text.slice(position);

    const prefix =
      beforeCursor && !/\s$/.test(beforeCursor) ? " @" : "@";

    const updatedText = beforeCursor + prefix + afterCursor;
    const newPosition = beforeCursor.length + prefix.length;

    setText(updatedText);
    setMentionQuery("");

    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(newPosition, newPosition);
      autosize(element);
    });
  };

  const onFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";

    if (!picked.length) return;

    setFileError("");

    const validFiles = picked.filter(
      (file) => file.size <= MAX_FILE
    );

    const oversizedFiles = picked.filter(
      (file) => file.size > MAX_FILE
    );

    setFiles((previous) => {
      const combined = [...previous, ...validFiles];

      if (combined.length > MAX_FILES) {
        setFileError(
          `You can attach a maximum of ${MAX_FILES} files.`
        );
      }

      return combined.slice(0, MAX_FILES);
    });

    if (oversizedFiles.length > 0) {
      setFileError("Each file must be 10 MB or smaller.");
    }
  };

  const removeFile = (index) => {
    setFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );

    setFileError("");
  };

  const insertEmoji = (emoji) => {
    const element = taRef.current;

    if (!element) {
      setText((previous) => previous + emoji);
      setEmojiOpen(false);
      return;
    }

    const start = element.selectionStart;
    const end = element.selectionEnd;

    const updatedText =
      text.slice(0, start) + emoji + text.slice(end);

    const newPosition = start + emoji.length;

    setText(updatedText);
    setEmojiOpen(false);

    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(newPosition, newPosition);
      autosize(element);
    });
  };

  const submit = async () => {
    const cleanText = text.trim();

    if (
      (!cleanText && files.length === 0) ||
      disabled ||
      sending
    ) {
      return;
    }

    if (typeof onSend !== "function") {
      setFileError("Message sending is not available right now.");
      return;
    }

    const usedMentions = mentions.filter((mention) =>
      cleanText.includes(`@${mention.name}`)
    );

    setSending(true);
    setFileError("");

    try {
      await onSend({
        text: cleanText,
        mentions: usedMentions,
        files: [...files],
        replyTo,
      });

      setText("");
      setFiles([]);
      setMentions([]);
      setMentionQuery(null);
      setEmojiOpen(false);

      if (taRef.current) {
        taRef.current.style.height = "auto";
      }
    } catch (error) {
      setFileError(
        error?.message ||
        "Message could not be sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setMentionQuery(null);
      setEmojiOpen(false);
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }

    if (
      event.key === "ArrowDown" &&
      mentionQuery !== null &&
      candidates.length > 0
    ) {
      event.preventDefault();
    }
  };

  const isDisabled = disabled || sending;

  return (
    <div className="relative border-t border-white/10 bg-[#101010] px-3 pb-3 pt-9 sm:px-4">

      <ChatAiAssist
        conversationId={conversationId}
        text={text}
        disabled={isDisabled}
        onUse={(value) => {
          setText(value);

          requestAnimationFrame(() => {
            const el = taRef.current;

            if (!el) return;

            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
            el.focus();
            el.setSelectionRange(value.length, value.length);
          });
        }}
      />

      {replyTo && (
        <div className="mb-2 flex items-start justify-between gap-3 rounded-lg border-l-2 border-red-600 bg-[#1a1a1a] px-3 py-2">
          <div className="min-w-0 text-[11px]">
            <p className="font-semibold text-red-400">
              Replying to{" "}
              {replyTo.sender?.name ||
                replyTo.senderName ||
                "message"}
            </p>

            <p className="truncate text-white/60">
              {replyTo.text || "Attachment"}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancelReply}
            disabled={isDisabled}
            aria-label="Cancel reply"
            className="shrink-0 text-white/60 transition-colors hover:text-white disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${file.size}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-full bg-[#1c1c1c] px-3 py-1 text-[11px] text-white/80"
            >
              <FileText size={12} className="shrink-0" />

              <span className="max-w-[140px] truncate">
                {file.name}
              </span>

              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={isDisabled}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 text-white/50 hover:text-white disabled:opacity-40"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {fileError && (
        <p role="alert" className="mb-2 text-[11px] text-red-400">
          {fileError}
        </p>
      )}

      {mentionQuery !== null &&
        isGroup &&
        candidates.length > 0 && (
          <div
            className={`absolute bottom-full left-3 right-3 z-30 mb-2 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0d0d0d] p-1 shadow-2xl sm:right-auto sm:w-72 ${scrollbar}`}
          >
            {candidates.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => pickMention(member)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
              >
                <Avatar
                  src={member.avatar}
                  name={member.name}
                  group={member.id === "all"}
                  size={26}
                />

                <div className="min-w-0">
                  <p className="truncate text-[13px] text-white">
                    {member.name}
                  </p>

                  {member.hint && (
                    <p className="text-[10px] text-white/40">
                      {member.hint}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

      {mentionQuery !== null &&
        isGroup &&
        candidates.length === 0 && (
          <div className="absolute bottom-full left-3 z-30 mb-2 rounded-lg border border-white/10 bg-[#0d0d0d] px-3 py-2 text-[11px] text-white/50 shadow-xl">
            No members found.
          </div>
        )}

      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#161616] px-3 py-2">
        <div className="shrink-0 pb-0.5">
          <Avatar
            src={me?.avatar || me?.avatarUrl}
            name={me?.name || "You"}
            size={26}
          />
        </div>

        <textarea
          ref={taRef}
          rows={1}
          value={text}
          disabled={isDisabled}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          placeholder="Type your message..."
          aria-label="Type your message"
          className="max-h-28 min-w-0 flex-1 resize-none bg-transparent py-1 text-[12.5px] text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="flex shrink-0 items-center gap-1 pb-0.5 text-white/60">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isDisabled || files.length >= MAX_FILES}
            aria-label="Attach files"
            title="Attach files"
            className="rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Paperclip size={14} />
          </button>

          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={onFiles}
            disabled={isDisabled || files.length >= MAX_FILES}
          />

          <button
            type="button"
            onClick={startMention}
            disabled={!isGroup || isDisabled}
            aria-label="Mention a member"
            title="Mention a member"
            className="rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <AtSign size={14} />
          </button>

          <div ref={emojiRef} className="relative">
            <button
              type="button"
              onClick={() => setEmojiOpen((previous) => !previous)}
              disabled={isDisabled}
              aria-label="Choose emoji"
              aria-expanded={emojiOpen}
              title="Emoji"
              className="rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
            >
              <Smile size={14} />
            </button>

            {emojiOpen && (
              <div className="absolute bottom-full right-0 z-30 mb-2 grid w-48 grid-cols-6 gap-1 rounded-xl border border-white/10 bg-[#0d0d0d] p-2 shadow-2xl">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    aria-label={`Insert ${emoji}`}
                    className="rounded p-1 text-[18px] transition-transform hover:scale-125 hover:bg-white/5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={
              isDisabled ||
              (!text.trim() && files.length === 0)
            }
            className="ml-1 rounded-full bg-red-600 px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
