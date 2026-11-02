"use client";

import React, { useState } from "react";
import { useStore, ViewType } from "@/lib/store/useStore";
import {
  MessageSquare,
  Kanban,
  FileText,
  Calendar,
  FolderArchive,
  Users,
  Settings,
  Plus,
  Hash,
  Lock,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

export function Sidebar() {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    channels,
    activeChannelId,
    setActiveChannelId,
    currentView,
    setCurrentView,
    isSidebarOpen,
    tasks,
    documents,
    events,
    files,
    users,
    createChannel,
  } = useStore();

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [newChanName, setNewChanName] = useState("");
  const [newChanDesc, setNewChanDesc] = useState("");
  const [isChanPrivate, setIsChanPrivate] = useState(false);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;
    createChannel(newChanName, newChanDesc, isChanPrivate);
    setNewChanName("");
    setNewChanDesc("");
    setIsChanPrivate(false);
    setIsNewChannelModalOpen(false);
  };

  const navItems = [
    {
      id: "kanban" as ViewType,
      label: "태스크 보드",
      icon: Kanban,
      badge: tasks.filter((t) => t.columnId !== "done").length,
    },
    {
      id: "docs" as ViewType,
      label: "문서 & 위키",
      icon: FileText,
      badge: documents.length,
    },
    {
      id: "calendar" as ViewType,
      label: "팀 캘린더",
      icon: Calendar,
      badge: events.length,
    },
    {
      id: "drive" as ViewType,
      label: "파일 드라이브",
      icon: FolderArchive,
      badge: files.length,
    },
    {
      id: "members" as ViewType,
      label: "팀원 디렉토리",
      icon: Users,
      badge: users.length,
    },
    {
      id: "settings" as ViewType,
      label: "설정 & 인프라",
      icon: Settings,
    },
  ];

  if (!isSidebarOpen) return null;

  return (
    <>
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-[calc(100vh-3.5rem)] shrink-0 select-none z-20">
        {/* Workspace Selector */}
        <div className="p-3 border-b border-slate-800 relative">
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-2.5 overflow-hidden text-left">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                {activeWs?.name.charAt(0) || "W"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {activeWs?.name || "워크스페이스"}
                </p>
                <p className="text-[10px] text-indigo-400 font-mono capitalize">
                  {activeWs?.plan} Plan
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Workspace Switcher Menu */}
          {isWorkspaceDropdownOpen && (
            <div className="absolute top-16 left-3 right-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
              <span className="text-[10px] font-semibold text-slate-400 px-2 uppercase">
                워크스페이스 전환
              </span>
              <div className="space-y-1 mt-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                      ws.id === activeWorkspaceId
                        ? "bg-indigo-600 text-white font-medium"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] opacity-80 uppercase">{ws.plan}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {/* Section 1: Main Tools */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2">
              핵심 협업 도구
            </span>
            <div className="mt-1.5 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition ${
                      isActive
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-indigo-400" : "text-slate-500"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Channels (Chat) */}
          <div>
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                대화 채널
              </span>
              <button
                onClick={() => setIsNewChannelModalOpen(true)}
                className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-900 transition"
                title="채널 추가"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1.5 space-y-0.5">
              {channels.map((chan) => {
                const isActive = currentView === "chat" && activeChannelId === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannelId(chan.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isActive
                        ? "bg-indigo-600 text-white font-medium shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {chan.isPrivate ? (
                        <Lock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      ) : (
                        <Hash className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      )}
                      <span className="truncate">{chan.name}</span>
                    </div>
                    {chan.unreadCount && chan.unreadCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                        {chan.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Online Team Members */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2">
              접속 중인 팀원 ({users.filter((u) => u.status === "online").length})
            </span>
            <div className="mt-1.5 space-y-1">
              {users.map((usr) => (
                <div
                  key={usr.id}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs text-slate-300 hover:bg-slate-900 transition cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={usr.avatar}
                      alt={usr.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-slate-950 ${
                        usr.status === "online"
                          ? "bg-emerald-500"
                          : usr.status === "busy"
                          ? "bg-rose-500"
                          : usr.status === "away"
                          ? "bg-amber-500"
                          : "bg-slate-500"
                      }`}
                    />
                  </div>
                  <span className="truncate text-[11px]">{usr.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Firebase App Hosting Status Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate font-mono">Firebase App Hosting</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
            Backend: Cloud Run • Concurrency: 80
          </p>
        </div>
      </aside>

      {/* New Channel Modal */}
      {isNewChannelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-400" />
              새로운 채널 생성
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              토론할 주제나 프로젝트 목적에 맞는 채널을 개설하세요.
            </p>

            <form onSubmit={handleCreateChannel} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  채널 이름
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">#</span>
                  <input
                    type="text"
                    required
                    value={newChanName}
                    onChange={(e) => setNewChanName(e.target.value)}
                    placeholder="예: 프론트엔드-개발"
                    className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  설명 (선택)
                </label>
                <input
                  type="text"
                  value={newChanDesc}
                  onChange={(e) => setNewChanDesc(e.target.value)}
                  placeholder="채널의 목적을 적어주세요."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="privateChan"
                  checked={isChanPrivate}
                  onChange={(e) => setIsChanPrivate(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="privateChan" className="text-xs text-slate-300 cursor-pointer">
                  비공개 채널로 만들기 (초대된 멤버만 열람 가능)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  채널 만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
