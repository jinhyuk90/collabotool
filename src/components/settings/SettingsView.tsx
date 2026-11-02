"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  Settings,
  Cloud,
  ShieldCheck,
  Cpu,
  Layers,
  Save,
  CheckCircle,
  Database,
  Lock,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

export function SettingsView() {
  const { workspaces, activeWorkspaceId, updateWorkspace, resetToDefaultData } = useStore();
  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);

  const [wsName, setWsName] = useState(activeWs?.name || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeWs && wsName.trim()) {
      updateWorkspace(activeWs.id, { name: wsName.trim() });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm("모든 메시지, 태스크, 문서를 초기 기본 데모 데이터로 되돌리시겠습니까?")) {
      resetToDefaultData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            워크스페이스 & Firebase 인프라 설정
          </h2>
          <p className="text-[11px] text-slate-400">
            Firebase App Hosting 배포 사양 및 기본 설정을 관리합니다.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Workspace Info Form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            기본 워크스페이스 정보
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                워크스페이스 이름
              </label>
              <input
                type="text"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  고유 슬러그 (URL)
                </label>
                <input
                  type="text"
                  disabled
                  value={activeWs?.slug}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  현재 플랜
                </label>
                <input
                  type="text"
                  disabled
                  value={`${activeWs?.plan.toUpperCase()} (Blaze Billing 활성화됨)`}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs text-indigo-400 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 워크스페이스 정보가 저장되었습니다.
                </span>
              ) : <span />}

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>변경사항 저장</span>
              </button>
            </div>
          </form>
        </div>

        {/* Firebase App Hosting Spec Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              Firebase App Hosting 배포 사양 (`apphosting.yaml`)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
              Cloud Run Connected
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">vCPU 할당</span>
              <span className="text-sm font-bold text-slate-200">1 vCPU</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">메모리 할당</span>
              <span className="text-sm font-bold text-slate-200">512 MiB</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">동시 처리량 (Concurrency)</span>
              <span className="text-sm font-bold text-slate-200">80 req/inst</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">오토스케일링 범위</span>
              <span className="text-sm font-bold text-slate-200">0 ~ 10 인스턴스</span>
            </div>
          </div>
        </div>

        {/* Security & Firestore RBAC */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            Firestore Security Rules & 테넌트 격리
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            모든 채널, 메시지, 태스크, 위키 문서는 <code>firestore.rules</code>의 <code>isWorkspaceMember()</code> 검증 로직에 의해 엄격히 격리 보호됩니다.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span>역할 기반 권한 제어(RBAC) 활성화 완료</span>
          </div>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                데이터 초기화 (Reset Demo Data)
              </h3>
              <p className="text-xs text-slate-400">
                테스트 중 추가/수정된 모든 메시지, 작업, 문서를 최초 기본 상태로 복원합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold border border-rose-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기 상태로 복원</span>
            </button>
          </div>

          {resetSuccess && (
            <p className="text-xs text-rose-400 mt-2 font-medium">
              ✓ 모든 데이터가 성공적으로 초기 상태로 복원되었습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
