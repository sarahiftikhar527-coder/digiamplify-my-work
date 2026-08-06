'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  Share2,
  Pin,
  Download,
  Trash2,
  Paperclip
} from 'lucide-react';
import { Message, Participant } from './types';
import { formatMessageTime } from './utils';

interface MessageBubbleProps {
  msg: Message;
  currentUser: { id: string; email: string; role: string; fullName?: string } | null;
  pinnedMessageIds: string[];
  activeMessageMenuId: string | null;
  setActiveMessageMenuId: (id: string | null) => void;
  dayMessages: Message[];
  handleCopyMessage: (content: string) => void;
  handleReplyMessage: (msg: Message, senderName: string) => void;
  handleStartForward: (content: string) => void;
  handlePinMessage: (msgId: string) => void;
  handleDownloadFile: (fileName: string, fileContent: string) => void;
  handleDeleteForMe: (msgId: string) => void;
  handleDeleteForEveryone: (msgId: string) => void;
  setLightboxImage: (url: string | null) => void;
  messageMenuRef: React.RefObject<HTMLDivElement | null>;
  participants: Participant[];
}

const MessageTicks = ({ isRead, isDelivered }: { isRead: boolean; isDelivered: boolean }) => {
  if (!isDelivered) {
    return (
      <svg
        viewBox="0 0 16 15"
        width="14"
        height="14"
        className="text-neutral-500 shrink-0 select-none fill-current"
      >
        <path d="M10.91 3.31a.5.5 0 0 0-.74-.03l-4.72 4.72-2.12-2.12a.5.5 0 0 0-.7-.07.5.5 0 0 0-.07.7l2.5 2.5a.5.5 0 0 0 .7 0l5.07-5.07a.5.5 0 0 0-.07-.66z" />
      </svg>
    );
  }

  const tickColor = isRead ? 'text-[#53bdeb]' : 'text-neutral-500';

  return (
    <div className={`relative flex items-center w-[17px] h-[14px] shrink-0 select-none ${tickColor}`}>
      {/* Left tick */}
      <svg
        viewBox="0 0 16 15"
        width="14"
        height="14"
        className="absolute left-0 top-[0.5px] fill-current"
      >
        <path d="M10.91 3.31a.5.5 0 0 0-.74-.03l-4.72 4.72-2.12-2.12a.5.5 0 0 0-.7-.07.5.5 0 0 0-.07.7l2.5 2.5a.5.5 0 0 0 .7 0l5.07-5.07a.5.5 0 0 0-.07-.66z" />
      </svg>
      {/* Right tick shifted to the right */}
      <svg
        viewBox="0 0 16 15"
        width="14"
        height="14"
        className="absolute left-[4px] top-[0.5px] fill-current"
      >
        <path d="M10.91 3.31a.5.5 0 0 0-.74-.03l-4.72 4.72-2.12-2.12a.5.5 0 0 0-.7-.07.5.5 0 0 0-.07.7l2.5 2.5a.5.5 0 0 0 .7 0l5.07-5.07a.5.5 0 0 0-.07-.66z" />
      </svg>
    </div>
  );
};

export default function MessageBubble({
  msg,
  currentUser,
  pinnedMessageIds,
  activeMessageMenuId,
  setActiveMessageMenuId,
  dayMessages,
  handleCopyMessage,
  handleReplyMessage,
  handleStartForward,
  handlePinMessage,
  handleDownloadFile,
  handleDeleteForMe,
  handleDeleteForEveryone,
  setLightboxImage,
  messageMenuRef,
  participants
}: MessageBubbleProps) {
  const [openAbove, setOpenAbove] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeMessageMenuId === msg.id && bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenAbove(spaceBelow < 220);
    }
  }, [activeMessageMenuId, msg.id]);

  if (msg.isSystem) {
    return (
      <div className="flex items-center justify-center my-3.5 select-none">
        <div className="bg-neutral-900/65 border border-neutral-950/80 px-4 py-1.5 rounded-full shadow-sm max-w-[85%] text-center">
          <p className="text-[10.5px] text-neutral-400 font-light tracking-wide leading-relaxed">
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  const isOwn = msg.senderId === currentUser?.id;
  const senderProfile = msg.sender?.profile;
  const isSenderAdmin = msg.sender?.role?.toLowerCase() === 'admin';
  const senderName = senderProfile?.fullName || (isSenderAdmin ? 'Admin' : msg.sender?.email || 'Employee');
  const senderRole = senderProfile?.jobTitle || (isSenderAdmin ? 'Administrator' : msg.sender?.role || 'Employee');
  const senderPic = senderProfile?.pictureUrl;

  const isForwarded = msg.content && msg.content.startsWith('[Forwarded] ');

  // Get clean text without the [Forwarded] token
  const getCleanContent = (text: string) => {
    if (!text) return '';
    return text.startsWith('[Forwarded] ') ? text.slice('[Forwarded] '.length) : text;
  };

  const cleanContent = getCleanContent(msg.content);

  // Helper to parse reply info if present
  const getReplyInfo = (text: string) => {
    if (!text) return null;
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.replyTo && typeof parsed.text === 'string') {
          return parsed as {
            replyTo: { id: string; senderName: string; content: string };
            text: string;
          };
        }
      } catch (e) {
        // Not structured reply
      }
    }
    return null;
  };

  const replyInfo = getReplyInfo(cleanContent);

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`message-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-neutral-800/30');
      setTimeout(() => el.classList.remove('bg-neutral-800/30'), 1500);
    }
  };

  const renderMessageContentWithMentions = (displayText: string) => {
    if (!displayText) return null;

    // Check if the message is only emojis (with spaces)
    const isOnlyEmojis = (text: string) => {
      const cleaned = text.replace(/\s/g, '');
      if (!cleaned) return false;
      const emojiRegex = /^(?:[\u2700-\u27bf]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\uD83F[\uD000-\uDFFF]|[\u2b50\u2b55\u00a9\u00ae\u2122])+$/;
      return emojiRegex.test(cleaned);
    };

    if (isOnlyEmojis(displayText)) {
      return (
        <span className="text-[28px] leading-relaxed select-text inline-block">
          {displayText}
        </span>
      );
    }

    // Match @ followed by word characters, optionally matching a space and second word (such as @John Doe)
    const mentionRegex = /(@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)/g;
    const parts = displayText.split(mentionRegex);

    // Emoji match regex to highlight emojis inside text
    const emojiRegexInside = /([\u2700-\u27bf]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\uD83F[\uD000-\uDFFF]|[\u2b50\u2b55\u00a9\u00ae\u2122])/g;

    return parts.map((part, index) => {
      if (mentionRegex.test(part)) {
        return (
          <span
            key={`mention-${index}`}
            className="bg-[#be0919]/15 text-[#ff4d5a] px-1.5 py-0.5 rounded font-medium mx-0.5 select-all"
          >
            {part}
          </span>
        );
      }

      const textParts = part.split(emojiRegexInside);
      return textParts.map((tPart, tIndex) => {
        if (emojiRegexInside.test(tPart)) {
          return (
            <span key={`emoji-${index}-${tIndex}`} className="text-[16px] inline-block align-middle mx-0.5 leading-none">
              {tPart}
            </span>
          );
        }
        return tPart;
      });
    });
  };

  const displayText = replyInfo ? replyInfo.text : cleanContent;

  const getIsDelivered = () => {
    if (!currentUser || !participants || participants.length <= 1) return false;

    // Find all OTHER participants in the room
    const otherParticipants = participants.filter(p => p.userId !== currentUser.id);
    if (otherParticipants.length === 0) return false;

    // Convert ISO string to Unix timestamp in seconds
    const msgTimeSeconds = Math.floor(new Date(msg.createdAt).getTime() / 1000);

    // Message is delivered if all other participants have been active since the message was created
    return otherParticipants.every(p => {
      const lastActive = p.user?.chatLastActive;
      if (!lastActive) return false;
      return lastActive >= msgTimeSeconds;
    });
  };

  const getIsRead = () => {
    if (!currentUser || !participants || participants.length <= 1) return false;

    // Find all OTHER participants in the room
    const otherParticipants = participants.filter(p => p.userId !== currentUser.id);
    if (otherParticipants.length === 0) return false;

    const msgTime = new Date(msg.createdAt).getTime();

    // Read if EVERY other participant has read it (lastRead) since the message was created
    return otherParticipants.every(p => {
      if (!p.lastRead) return false;
      return new Date(p.lastRead).getTime() >= msgTime;
    });
  };

  const isRead = getIsRead();
  const isDelivered = isRead || getIsDelivered();

  return (
    <div
      id={`message-${msg.id}`}
      className={`flex items-start gap-3.5 max-w-[85%] rounded-2xl p-1 transition-colors duration-550 ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
        }`}
    >

      {/* Avatar bubble */}
      <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center overflow-hidden font-bold text-xs text-neutral-400 shrink-0 select-none">
        {senderPic ? (
          <img src={senderPic} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span>{senderName.charAt(0)}</span>
        )}
      </div>

      {/* Message block */}
      <div className="flex flex-col gap-1.5 min-w-0">

        {/* Sender detail headers */}
        <div className={`flex items-center gap-1.5 text-[10.5px] font-light ${isOwn ? 'justify-end text-neutral-450' : 'text-neutral-400'
          }`}>
          {isOwn ? (
            <>
              <span className="text-neutral-400 font-normal text-[10px]">{senderRole}</span>
              <span className="font-semibold text-white text-[12.5px]">{senderName}</span>
            </>
          ) : (
            <>
              <span className="font-semibold text-white text-[12.5px]">{senderName}</span>
              <span className="text-neutral-400 font-normal text-[10px]">{senderRole}</span>
            </>
          )}
        </div>

        {/* Text bubble bubble */}
        <div
          ref={bubbleRef}
          className={`px-4 py-2.5 rounded-2xl border text-xs font-normal leading-relaxed text-white relative group select-text ${isOwn
              ? 'bg-[#be0919]/10 border-[#be0919]/20 rounded-tr-none'
              : 'bg-[#121212] border-neutral-900 rounded-tl-none'
            }`}
        >

          {/* Pinned note badge */}
          {pinnedMessageIds.includes(msg.id) && (
            <div className="flex items-center gap-1.5 mb-1 text-amber-500/80 font-medium text-[9px] select-none uppercase tracking-wider pl-4 pr-4">
              <span>📌 Pinned</span>
            </div>
          )}

          {/* Forwarded note badge */}
          {isForwarded && (
            <div className="flex items-center gap-1 mb-1 text-neutral-400/85 font-light text-[10px] select-none italic pl-4 pr-4">
              <CornerUpRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>Forwarded</span>
            </div>
          )}

          {/* WhatsApp-style Quoted Reply Preview inside bubble */}
          {replyInfo && (
            <div
              onClick={() => scrollToMessage(replyInfo.replyTo.id)}
              className="mb-2 bg-black/40 hover:bg-black/60 border-l-[3.5px] border-[#be0919] rounded-lg overflow-hidden flex flex-col px-3 py-2 text-left cursor-pointer transition-colors max-w-full select-none"
            >
              <span className="text-[10px] font-semibold text-[#be0919] truncate leading-tight">
                {replyInfo.replyTo.senderName}
              </span>
              <p className="text-[9.5px] text-neutral-450 truncate mt-1 font-light leading-snug">
                {replyInfo.replyTo.content.startsWith('[Forwarded] ')
                  ? replyInfo.replyTo.content.slice('[Forwarded] '.length)
                  : replyInfo.replyTo.content}
              </p>
            </div>
          )}

          {/* Action chevron */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveMessageMenuId(activeMessageMenuId === msg.id ? null : msg.id);
            }}
            className={`absolute top-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-neutral-500 hover:text-white z-20 ${isOwn ? 'left-3' : 'right-3'
              }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          {/* Message actions popover menu */}
          {activeMessageMenuId === msg.id && (() => {
            return (
              <div
                ref={messageMenuRef as React.RefObject<HTMLDivElement>}
                className={`absolute z-[9999] bg-[#0c0c0c] border border-neutral-900 rounded-xl shadow-2xl p-1.5 w-44 flex flex-col gap-0.5 animate-fadeIn select-none ${openAbove ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                  } ${isOwn ? 'left-3' : 'right-3'
                  }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleCopyMessage(displayText)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-450" />
                  Copy Text
                </button>
                <button
                  type="button"
                  onClick={() => handleReplyMessage({ ...msg, content: displayText }, senderName)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <CornerUpLeft className="w-3.5 h-3.5 text-neutral-450" />
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => handleStartForward(displayText)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-neutral-450" />
                  Forward
                </button>
                <button
                  type="button"
                  onClick={() => handlePinMessage(msg.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5 text-neutral-450" />
                  {pinnedMessageIds.includes(msg.id) ? 'Unpin' : 'Pin'}
                </button>
                {msg.fileName && msg.fileContent && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDownloadFile(msg.fileName!, msg.fileContent!);
                      setActiveMessageMenuId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-900/50 text-left text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer border-t border-neutral-950/60 mt-0.5 pt-2"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-450" />
                    Download
                  </button>
                )}
                {isOwn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDeleteForMe(msg.id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-950/15 hover:text-red-400 text-left text-[11px] text-red-500/80 transition-colors cursor-pointer border-t border-neutral-950/60 mt-0.5 pt-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500/60" />
                      Delete for Me
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteForEveryone(msg.id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-950/25 hover:text-red-400 text-left text-[11px] text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      Delete for Everyone
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDeleteForMe(msg.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-950/15 hover:text-red-400 text-left text-[11px] text-red-500/80 transition-colors cursor-pointer border-t border-neutral-950/60 mt-0.5 pt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500/60" />
                    Delete for Me
                  </button>
                )}
              </div>
            );
          })()}

          <div className={isOwn ? 'pl-4' : 'pr-4'}>
            {displayText && <p>{renderMessageContentWithMentions(displayText)}</p>}
            {msg.fileName && msg.fileContent && (
              <div className="mt-2">
                {msg.fileContent.startsWith('data:image/') || msg.fileName.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                  <img
                    src={msg.fileContent}
                    alt={msg.fileName}
                    className="max-w-full sm:max-w-[280px] max-h-[200px] rounded-lg cursor-pointer border border-neutral-800 hover:opacity-90 object-cover mt-1 transition-opacity"
                    onClick={() => setLightboxImage(msg.fileContent || null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(msg.fileName!, msg.fileContent!)}
                    className="flex items-center gap-2 bg-[#050505] hover:bg-[#111] border border-neutral-900 px-3 py-2 rounded-lg text-[11px] font-medium text-[#be0919] hover:text-white transition-all cursor-pointer mt-1"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#be0919]" />
                    <span className="truncate max-w-[150px]">{msg.fileName}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <span className={`text-[9.5px] text-neutral-500 font-light mt-1 select-none flex items-center justify-end gap-1.5 ${isOwn ? 'self-end mr-1.5' : 'self-start ml-1.5'
          }`}>
          {formatMessageTime(msg.createdAt)}
          {isOwn && (
            <span className="inline-flex shrink-0">
              <MessageTicks isRead={isRead} isDelivered={isDelivered} />
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
