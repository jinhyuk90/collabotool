"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Trash2,
  Users,
  MapPin,
} from "lucide-react";
import { CalendarEvent } from "@/types";

const CATEGORY_COLORS: Record<CalendarEvent["category"], { bg: string; text: string; border: string }> = {
  meeting: { bg: "bg-indigo-950/70", text: "text-indigo-300", border: "border-indigo-800" },
  milestone: { bg: "bg-emerald-950/70", text: "text-emerald-300", border: "border-emerald-800" },
  deadline: { bg: "bg-rose-950/70", text: "text-rose-300", border: "border-rose-800" },
  review: { bg: "bg-amber-950/70", text: "text-amber-300", border: "border-amber-800" },
};

export function CalendarView() {
  const { events, addEvent, deleteEvent, users } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startDate, setStartDate] = useState("2026-11-04T14:00");
  const [endDate, setEndDate] = useState("2026-11-04T15:30");
  const [category, setCategory] = useState<CalendarEvent["category"]>("meeting");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title: title.trim(),
      description: desc.trim(),
      startDate,
      endDate,
      allDay: false,
      category,
      attendees: [users[0]?.id || ""],
    });

    setTitle("");
    setDesc("");
    setIsAddOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
            팀 공유 캘린더 & 스프린트 마일스톤
          </h2>
          <p className="text-[11px] text-slate-400">팀 전체 일정 및 주요 데드라인을 한눈에 조율합니다.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 일정 등록</span>
        </button>
      </div>

      {/* Events List / Timeline */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => {
            const catStyle = CATEGORY_COLORS[ev.category];
            const attendeeUsers = users.filter((u) => ev.attendees.includes(u.id));

            return (
              <div
                key={ev.id}
                className={`p-4 rounded-2xl border ${catStyle.bg} ${catStyle.border} flex flex-col justify-between shadow-sm relative group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${catStyle.text} bg-slate-900/60`}>
                      {ev.category}
                    </span>

                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition"
                      title="일정 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mb-1">{ev.title}</h3>
                  {ev.description && (
                    <p className="text-xs text-slate-300 mb-3">{ev.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ev.startDate.replace("T", " ")}</span>
                  </div>

                  <div className="flex -space-x-1.5">
                    {attendeeUsers.map((u) => (
                      <img
                        key={u.id}
                        src={u.avatar}
                        alt={u.name}
                        title={u.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-900"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              새 일정 추가
            </h3>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  일정 제목
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 클라우드 인프라 점검 회의"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  설명
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="회의 안건 또는 상세 내용"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    카테고리
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CalendarEvent["category"])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="meeting">미팅 (Meeting)</option>
                    <option value="milestone">마일스톤 (Milestone)</option>
                    <option value="deadline">마감일 (Deadline)</option>
                    <option value="review">리뷰 (Review)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    시작 일시
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
