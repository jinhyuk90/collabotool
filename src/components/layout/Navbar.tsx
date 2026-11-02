"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  Search,
  Bell,
  Check,
  Cloud,
  ChevronDown,
  Menu,
  Shield,
  Sparkles,
} from "lucide-react";
import { UserStatus } from "@/types";

export function Navbar() {
  const {
    currentUser,
    setCurrentUserStatus,
    notifications,
    markAsRead,
    markAllAsRead,
    setCommandPaletteOpen,
    isSidebarOpen,
    setSidebarOpen,
    currentView,
    workspaces,
    activeWorkspaceId,
  } = useStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const viewTitles: Record<string, string> = {
    chat: "대화 채널 (Live Chat)",
    kanban: "태스크 보드 (Kanban Board)",
    docs: "위키 & 문서 (Wiki Docs)",
    calendar: "팀 캘린더 (Schedule)",
    drive: "파일 드라이브 (Storage)",
    members: "팀원 디렉토리 (Team Members)",
    settings: "워크스페이스 설정 (Settings)",
  };

  const statusColors: Record<UserStatus, string> = {
    online: "bg-emerald-500",
    busy: "bg-rose-500",
    away: "bg-amber-500",
    offline: "bg-slate-500",
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          aria-label="사이드바 토글"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-400 font-semibold">{activeWs?.name || "워크스페이스"}</span>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400 font-medium">{viewTitles[currentView] || "개요"}</span>
        </div>
      </div>

      {/* Center: Search Button (Command Palette Trigger) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-slate-200 transition"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <span>메시지, 태스크, 문서, 팀원 검색...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Cloud Run Status Badge, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* App Hosting Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-[11px] text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Hosting (Cloud Run SSR)</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition relative"
            aria-label="알림"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950 animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold text-slate-200">
                  알림 센터 ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> 모두 읽음
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">알림이 없습니다.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition ${
                        notif.isRead
                          ? "bg-slate-900/60 text-slate-400 hover:bg-slate-800/40"
                          : "bg-indigo-950/30 border border-indigo-900/40 text-slate-200 hover:bg-indigo-950/50"
                      }`}
                    >
                      <div className="font-semibold text-slate-200 flex items-center justify-between">
                        <span>{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{notif.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile & Status Selector */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${statusColors[currentUser.status]}`}
              />
            </div>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">
              {currentUser.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-400">
                  <Shield className="w-3 h-3" /> 역할: {currentUser.role.toUpperCase()}
                </div>
              </div>

              <div className="py-2 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 px-2">
                  접속 상태 변경
                </span>
                {(["online", "busy", "away", "offline"] as UserStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setCurrentUserStatus(st);
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition capitalize ${
                      currentUser.status === st
                        ? "bg-slate-800 text-indigo-400 font-medium"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusColors[st]}`} />
                    <span>{st === "online" ? "온라인 (Online)" : st === "busy" ? "바쁨 (Busy)" : st === "away" ? "자리비움 (Away)" : "오프라인 (Offline)"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
