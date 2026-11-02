"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Check,
  Search,
} from "lucide-react";
import { Role, UserStatus } from "@/types";

export function MembersView() {
  const { users, inviteMember } = useStore();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMember(email.trim(), role);
    setEmail("");
    setIsInviteOpen(false);
  };

  const statusColors: Record<UserStatus, string> = {
    online: "bg-emerald-500",
    busy: "bg-rose-500",
    away: "bg-amber-500",
    offline: "bg-slate-500",
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            팀원 디렉토리 및 역할 권한 (RBAC)
          </h2>
          <p className="text-[11px] text-slate-400">워크스페이스 구성원의 권한 및 프로필을 관리합니다.</p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>새 멤버 초대</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일로 팀원 검색..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Member Table / Cards */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/20 transition">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-800"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${statusColors[u.status]}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{u.name}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                    {u.statusMessage && (
                      <p className="text-[10px] text-slate-500 mt-0.5 italic">“{u.statusMessage}”</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 capitalize">
                    {u.status === "online" ? "온라인" : u.status === "busy" ? "바쁨" : u.status === "away" ? "자리비움" : "오프라인"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              팀원 초대하기
            </h3>

            <form onSubmit={handleInvite} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  이메일 주소
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  역할 (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="member">멤버 (Member) - 일반 작업 및 대화</option>
                  <option value="admin">관리자 (Admin) - 채널 및 멤버 관리</option>
                  <option value="guest">게스트 (Guest) - 읽기 전용 참여</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  초대장 발송
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
