import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Ban,
  FileText,
  Images,
  LogOut,
  Search,
  Trash2,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";
import Avatar from "../Avatar";
import ChatAttachment from "@/components/ChatAttachment/ChatAttachment";
import apiClient, { unwrap } from "@/services/api/apiClient";
import { scrollbar } from "../../../../../utils/format.js";

const PHOTOS_PREVIEW = 6;
const DOCUMENTS_PREVIEW = 4;

const isImage = (item) => {
  const type = item?.type || item?.mimeType || item?.mimetype || "";

  if (String(type).startsWith("image/")) return true;

  return /\.(png|jpe?g|gif|webp|svg)$/i.test(item?.name || "");
};

const formatBytes = (value) => {
  const bytes = Number(value) || 0;

  if (bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatShortDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getMediaDetails = (item) => {
  const url = item?.url || item?.secureUrl || item?.path || "";
  const name = item?.name || item?.originalName || "Shared file";
  const type = item?.type || item?.mimeType || item?.mimetype || "";

  return {
    id: String(item?.id || item?._id || url || name),
    url,
    name,
    type,
    size: item?.size,
    createdAt: item?.createdAt,
  };
};

const GroupInfoPanel = ({
  className = "",
  conversation,
  onClose,
  onVideoCall,
  onAddMembers,
  onClear,
  onExit,
}) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [searching, setSearching] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [details, setDetails] = useState(null);

  const conversationId = String(
    conversation?.id || conversation?._id || ""
  );

  // The conversation list does not carry the shared files. They are loaded
  // here when the panel opens, and again when a new message arrives.
  const refreshKey = `${conversation?.lastMessageAt || ""}|${
    conversation?.lastMessage?.createdAt || ""
  }`;

  useEffect(() => {
    if (!conversationId) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const result = await unwrap(
          apiClient.get(`/chat/conversations/${conversationId}`)
        );

        const detail = result?.conversation || result?.data?.conversation;

        if (cancelled || !detail) return;

        setDetails({
          id: conversationId,
          media: Array.isArray(detail.media) ? detail.media : [],
          mediaCount: detail.mediaCount,
        });
      } catch {
        // The panel still works without the media list.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, refreshKey]);

  useEffect(() => {
    setShowAllPhotos(false);
    setShowAllDocuments(false);
  }, [conversationId]);

  const loaded = details && details.id === conversationId ? details : null;

  const media = useMemo(() => {
    const source = loaded
      ? loaded.media
      : Array.isArray(conversation?.media)
        ? conversation.media
        : Array.isArray(conversation?.attachments)
          ? conversation.attachments
          : [];

    return source.map(getMediaDetails);
  }, [loaded, conversation]);

  const photos = useMemo(() => media.filter(isImage), [media]);
  const documents = useMemo(
    () => media.filter((item) => !isImage(item)),
    [media]
  );

  if (!conversation) {
    return (
      <aside
        className={`flex min-h-0 flex-col border-l border-white/10 bg-[#0d0d0d] ${className}`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close information panel"
            className="text-white/70 transition-colors hover:text-white"
          >
            <X size={16} />
          </button>

          <h3 className="text-[13px] text-white/90">Conversation Info</h3>
        </div>

        <div className="flex flex-1 items-center justify-center px-5">
          <p className="text-center text-[12px] text-white/40">
            Select a conversation to view its information.
          </p>
        </div>
      </aside>
    );
  }

  const isGroup = conversation.type === "group";

  const members = Array.isArray(conversation.members)
    ? conversation.members
    : [];

  const normalizedSearch = memberSearch.trim().toLowerCase();

  const visibleMembers = members.filter((member) => {
    const name = member?.name || member?.user?.name || "";
    const email = member?.email || member?.user?.email || "";

    return (
      name.toLowerCase().includes(normalizedSearch) ||
      email.toLowerCase().includes(normalizedSearch)
    );
  });

  const conversationName =
    conversation.name || (isGroup ? "Group chat" : "Direct conversation");

  const mediaCount =
    (loaded && loaded.mediaCount) ??
    conversation.mediaCount ??
    media.length;

  const shownPhotos = showAllPhotos
    ? photos
    : photos.slice(0, PHOTOS_PREVIEW);

  const shownDocuments = showAllDocuments
    ? documents
    : documents.slice(0, DOCUMENTS_PREVIEW);

  const roundBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

  const runAction = (callback) => {
    if (typeof callback === "function") {
      callback();
    }
  };

  const getMemberDetails = (member) => {
    const user = member?.user || member || {};

    return {
      id: String(user.id || user._id || member?.id || member?._id || ""),
      name: user.name || member?.name || "Team member",
      avatar:
        user.avatar ||
        user.avatarUrl ||
        member?.avatar ||
        member?.avatarUrl ||
        "",
      about: user.about || member?.about || "",
      role: user.role || member?.role || "",
      online: Boolean(user.online ?? member?.online),
      isAdmin: Boolean(
        member?.isAdmin ||
          member?.isGroupAdmin ||
          member?.role === "admin" ||
          user.role === "admin"
      ),
    };
  };

  const moreToggle = (expanded, onToggle, total, label) => (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] text-white/60 transition-colors hover:bg-white/5 hover:text-white"
    >
      {expanded ? "Show less" : `View all ${total} ${label}`}

      <ArrowRight
        size={14}
        className={`transition-transform ${expanded ? "rotate-90" : ""}`}
      />
    </button>
  );

  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0d0d0d] ${className}`}
      aria-label={isGroup ? "Group information" : "Contact information"}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3.5">
        <button
          type="button"
          onClick={() => runAction(onClose)}
          aria-label="Close information panel"
          className="rounded p-1 text-white/70 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <X size={16} />
        </button>

        <h3 className="text-[13px] text-white/90">
          {isGroup ? "Group Info" : "Contact Info"}
        </h3>
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto px-4 py-5 ${scrollbar}`}
      >
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={conversation.avatar || conversation.avatarUrl}
            name={conversationName}
            group={isGroup}
            size={88}
            online={!isGroup && Boolean(conversation.online)}
          />

          <h4 className="mt-3 max-w-full break-words text-[16px] font-semibold text-white">
            {conversationName}
          </h4>

          {isGroup ? (
            <p className="mt-1 text-[12px] text-white/60">
              Group ·{" "}
              <span className="text-green-500">
                {members.length} members
              </span>
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-white/60">
              {conversation.subtitle ||
                (conversation.online ? "Online" : "Direct conversation")}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => runAction(onVideoCall)}
              aria-label="Video call"
              title="Video call"
              className={roundBtn}
            >
              <Video size={14} />
            </button>

            {isGroup && conversation.canManage && (
              <button
                type="button"
                onClick={() => runAction(onAddMembers)}
                aria-label="Add members"
                title="Add members"
                className={roundBtn}
              >
                <UserPlus size={14} />
              </button>
            )}

            {isGroup && (
              <button
                type="button"
                onClick={() => setSearching((previous) => !previous)}
                aria-label="Search members"
                title="Search members"
                className={roundBtn}
              >
                <Search size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() => runAction(onClear)}
              aria-label="Clear chat"
              title="Clear chat"
              className={roundBtn}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* MEDIA AND DOCUMENTS */}
        <section className="mt-6">
          <div className="flex items-center justify-between text-[12px] text-white/80">
            <span className="flex items-center gap-2">
              <Images size={14} />
              Media and Documents
            </span>

            <span>{mediaCount}</span>
          </div>

          {media.length > 0 ? (
            <div className="mt-3 space-y-4">
              <p className="text-[11px] text-white/45">
                {photos.length} photo{photos.length === 1 ? "" : "s"} ·{" "}
                {documents.length} document
                {documents.length === 1 ? "" : "s"}
                {Number(mediaCount) > media.length &&
                  ` (latest ${media.length} of ${mediaCount})`}
              </p>

              {photos.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium text-white/70">
                    Photos
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {shownPhotos.map((item) => (
                      <div
                        key={item.id}
                        className="aspect-square overflow-hidden rounded bg-white/5"
                      >
                        <ChatAttachment
                          attachment={item}
                          imageClassName="h-full w-full object-cover"
                          fileClassName="flex h-full w-full items-center justify-center text-white/70"
                        />
                      </div>
                    ))}
                  </div>

                  {photos.length > PHOTOS_PREVIEW &&
                    moreToggle(
                      showAllPhotos,
                      () => setShowAllPhotos((previous) => !previous),
                      photos.length,
                      "photos"
                    )}
                </div>
              )}

              {documents.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium text-white/70">
                    Documents
                  </p>

                  <ul className="space-y-2">
                    {shownDocuments.map((item) => {
                      const meta = [
                        formatBytes(item.size),
                        formatShortDate(item.createdAt),
                      ]
                        .filter(Boolean)
                        .join(" · ");

                      return (
                        <li
                          key={item.id}
                          className="rounded-lg border border-white/10 bg-[#121212] px-3 py-2"
                        >
                          <ChatAttachment
                            attachment={item}
                            fileClassName="flex w-full min-w-0 items-center gap-2 text-left text-[12px] text-white/85 transition-colors hover:text-white"
                          />

                          {meta && (
                            <p className="mt-0.5 pl-[22px] text-[10px] text-white/40">
                              {meta}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {documents.length > DOCUMENTS_PREVIEW &&
                    moreToggle(
                      showAllDocuments,
                      () => setShowAllDocuments((previous) => !previous),
                      documents.length,
                      "documents"
                    )}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 flex items-center gap-2 text-[11px] text-white/40">
              <FileText size={12} />
              No media shared yet.
            </p>
          )}
        </section>

        {isGroup && (
          <section className="mt-6">
            <div className="flex items-center justify-between text-[12px] text-white/80">
              <span className="flex items-center gap-2">
                <Users size={14} />
                {members.length} Members
              </span>

              <button
                type="button"
                onClick={() => setSearching((previous) => !previous)}
                aria-label="Search group members"
                aria-expanded={searching}
                className="rounded p-1 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Search size={14} />
              </button>
            </div>

            {searching && (
              <input
                autoFocus
                type="search"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search members..."
                aria-label="Search members by name or email"
                className="mt-2 w-full rounded-full border border-white/10 bg-[#161616] px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/40 focus:border-red-600/60"
              />
            )}

            <div className="mt-3 space-y-3">
              {visibleMembers.length > 0 ? (
                visibleMembers.map((member, index) => {
                  const person = getMemberDetails(member);

                  return (
                    <div
                      key={person.id || index}
                      className="flex items-center gap-3"
                    >
                      <Avatar
                        src={person.avatar}
                        name={person.name}
                        size={32}
                        online={person.online}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] text-white">
                          {person.name}
                        </p>

                        <p className="truncate text-[11px] text-white/40">
                          {person.about || person.role || "Member"}
                        </p>
                      </div>

                      {person.isAdmin && (
                        <span className="shrink-0 text-[10px] text-white/50">
                          Admin
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-center text-[11px] text-white/40">
                  No members found.
                </p>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="shrink-0 space-y-3 border-t border-white/10 px-4 py-4 text-[13px]">
        {isGroup && (
          <button
            type="button"
            onClick={() => runAction(onExit)}
            className="flex items-center gap-2 text-red-500 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
          >
            <LogOut size={14} />
            Exit Group
          </button>
        )}

        <button
          type="button"
          onClick={() => runAction(onClear)}
          className="flex items-center gap-2 text-red-500 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
        >
          <Ban size={14} />
          Clear Chat
        </button>
      </div>
    </aside>
  );
};

export default GroupInfoPanel;