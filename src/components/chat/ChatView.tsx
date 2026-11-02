"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  Hash,
  Lock,
  Send,
  Paperclip,
  Smile,
  Code,
  Users,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

const QUICK_EMOJIS = ["👍", "🚀", "🔥", "❤️", "👏", "🎉", "🫡"];

export function ChatView() {
  const {
    channels,
    activeChannelId,
    messages,
    sendMessage,
    addReaction,
    addThreadReply,
    users,
    currentUser,
  } = useStore();

  const [inputContent, setInputContent] = useState("");
  const [activeThreadMsgId, setActiveThreadMsgId] = useState<string | null>(null);
  const [threadReplyInput, setThreadReplyInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages[activeChannel?.id || ""] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    sendMessage(activeChannel.id, inputContent.trim());
    setInputContent("");
  };

  const handleInsertCodeSnippet = () => {
    setInputContent((prev) => prev + "\n```typescript\n// 코드를 입력하세요\nconst example = true;\n```\n");
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Channel Header */}
        <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3">
            {activeChannel?.isPrivate ? (
              <Lock className="w-5 h-5 text-slate-400" />
            ) : (
              <Hash className="w-5 h-5 text-indigo-400" />
            )}
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {activeChannel?.name}
              </h2>
              {activeChannel?.description && (
                <p className="text-[11px] text-slate-400 truncate max-w-md">
                  {activeChannel.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full text-[11px]">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{users.length}명 참여 중</span>
            </span>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {channelMessages.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Hash className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
              <p className="text-sm font-medium text-slate-300">#{activeChannel?.name} 채널의 첫 메시지를 작성해보세요!</p>
              <p className="text-xs text-slate-500 mt-1">팀원들과 실시간 대화 및 파일 공유를 시작할 수 있습니다.</p>
            </div>
          ) : (
            channelMessages.map((msg) => {
              const sender = users.find((u) => u.id === msg.userId) || {
                name: "알 수 없는 사용자",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
                status: "offline",
                role: "member",
              };

              const isCurrentUser = msg.userId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className="group flex items-start gap-3 hover:bg-slate-900/50 p-2.5 -mx-2.5 rounded-xl transition"
                >
                  <img
                    src={sender.avatar}
                    alt={sender.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-200">
                        {sender.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Content rendering */}
                    <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-normal">
                      {msg.content}
                    </div>

                    {/* Reaction Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {(msg.reactions || []).map((r, i) => {
                        const hasReacted = r.userIds.includes(currentUser.id);
                        return (
                          <button
                            key={i}
                            onClick={() => addReaction(activeChannel.id, msg.id, r.emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition border ${
                              hasReacted
                                ? "bg-indigo-950/70 border-indigo-600 text-indigo-300 font-semibold"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span className="text-[11px] font-mono">{r.count}</span>
                          </button>
                        );
                      })}

                      {/* Quick Emoji Reaction trigger on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(activeChannel.id, msg.id, emoji)}
                            className="p-1 rounded hover:bg-slate-800 text-xs transition"
                            title={`리액션: ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                        {msg.threadCount ? (
                          <button
                            onClick={() => setActiveThreadMsgId(msg.id)}
                            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline ml-2"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>답글 {msg.threadCount}개</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveThreadMsgId(msg.id)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 text-[11px]"
                            title="스레드 답글 달기"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={handleSend}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition shadow-lg"
          >
            {/* Input Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 bg-slate-900/60 text-slate-400">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleInsertCodeSnippet}
                  className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 transition"
                  title="코드 블록 삽입"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setInputContent((prev) => prev + " **강조** ")}
                  className="p-1.5 rounded hover:bg-slate-800 hover:text-slate-200 text-xs font-bold font-serif"
                  title="굵게"
                >
                  B
                </button>
              </div>

              <div className="flex items-center gap-1">
                {QUICK_EMOJIS.slice(0, 5).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setInputContent((prev) => prev + emoji)}
                    className="p-1 rounded hover:bg-slate-800 text-xs"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-2 p-2.5">
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                rows={2}
                placeholder={`#${activeChannel?.name || "채널"}에 메시지 전송 (Shift + Enter 줄바꿈)...`}
                className="flex-1 bg-transparent border-0 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
              />

              <button
                type="submit"
                disabled={!inputContent.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive Thread Sidebar */}
      {activeThreadMsgId && (() => {
        const threadMsg = channelMessages.find((m) => m.id === activeThreadMsgId);
        const threadAuthor = users.find((u) => u.id === threadMsg?.userId);

        const handleSendReply = (e: React.FormEvent) => {
          e.preventDefault();
          if (!threadReplyInput.trim() || !activeThreadMsgId) return;
          addThreadReply(activeChannel.id, activeThreadMsgId, threadReplyInput.trim());
          setThreadReplyInput("");
        };

        return (
          <div className="w-80 border-l border-slate-800 bg-slate-900/80 flex flex-col h-full animate-in slide-in-from-right duration-200">
            <div className="h-14 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
                스레드 토론
              </span>
              <button
                onClick={() => setActiveThreadMsgId(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                닫기
              </button>
            </div>

            {/* Original Message Card */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={threadAuthor?.avatar}
                  alt={threadAuthor?.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-slate-200">{threadAuthor?.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {threadMsg && formatTime(threadMsg.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">{threadMsg?.content}</p>
            </div>

            {/* Thread Replies List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {!threadMsg?.threadReplies || threadMsg.threadReplies.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  아직 스레드 답글이 없습니다.<br />첫 답글을 남겨 팀원과 토론을 시작하세요!
                </div>
              ) : (
                threadMsg.threadReplies.map((reply) => {
                  const replyAuthor = users.find((u) => u.id === reply.userId);
                  return (
                    <div
                      key={reply.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-indigo-300">{replyAuthor?.name || "팀원"}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatTime(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input
                type="text"
                value={threadReplyInput}
                onChange={(e) => setThreadReplyInput(e.target.value)}
                placeholder="스레드에 답글 작성..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!threadReplyInput.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                전송
              </button>
            </form>
          </div>
        );
      })()}
    </div>
  );
}
