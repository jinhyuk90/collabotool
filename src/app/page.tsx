"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store/useStore";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatView } from "@/components/chat/ChatView";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { DocsView } from "@/components/docs/DocsView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { FileDriveView } from "@/components/drive/FileDriveView";
import { MembersView } from "@/components/members/MembersView";
import { SettingsView } from "@/components/settings/SettingsView";
import { CommandPalette } from "@/components/search/CommandPalette";
import { useFirestoreSync } from "@/lib/firebase/useFirestoreSync";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { currentView } = useStore();

  // Activate Real-time Cloud Firestore synchronization across all tabs and devices
  useFirestoreSync();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">CollabSync 실시간 클라우드 연결 중...</span>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "chat":
        return <ChatView />;
      case "kanban":
        return <KanbanBoard />;
      case "docs":
        return <DocsView />;
      case "calendar":
        return <CalendarView />;
      case "drive":
        return <FileDriveView />;
      case "members":
        return <MembersView />;
      case "settings":
        return <SettingsView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 select-none">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Sidebar */}
        <Sidebar />

        {/* Dynamic Content Canvas */}
        <main className="flex-1 flex overflow-hidden relative">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Quick Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
