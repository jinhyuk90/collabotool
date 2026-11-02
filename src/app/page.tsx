"use client";

import React from "react";
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

export default function Home() {
  const { currentView } = useStore();

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
