"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Edit3,
  Clock,
  Share2,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function DocsView() {
  const {
    documents,
    activeDocId,
    setActiveDocId,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useStore();

  const [isPreview, setIsPreview] = useState(false);
  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  const handleCreateDoc = () => {
    createDocument("새 문서");
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Docs List Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" />
            문서 & 지식베이스
          </span>
          <button
            onClick={handleCreateDoc}
            className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
            title="새 문서 추가"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition ${
                doc.id === activeDoc?.id
                  ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span>{doc.icon || "📄"}</span>
                <span className="truncate">{doc.title}</span>
              </div>

              {documents.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Main Canvas */}
      {activeDoc ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {/* Top Bar */}
          <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{activeDoc.icon || "📄"}</span>
              <input
                type="text"
                value={activeDoc.title}
                onChange={(e) => updateDocument(activeDoc.id, { title: e.target.value })}
                className="bg-transparent text-sm font-bold text-slate-100 focus:outline-none border-b border-transparent focus:border-indigo-500 transition px-1"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded-full text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>클라우드 동기화 완료</span>
              </span>

              <button
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                {isPreview ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>편집 모드</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>미리보기</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            {isPreview ? (
              <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {activeDoc.content}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fast Format Tool Chips */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-500 mr-1">단축 서식:</span>
                  <button
                    onClick={() => updateDocument(activeDoc.id, { content: activeDoc.content + "\n## 제목 2\n" })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => updateDocument(activeDoc.id, { content: activeDoc.content + "\n* 항목 1\n* 항목 2\n" })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                  >
                    리스트
                  </button>
                  <button
                    onClick={() => updateDocument(activeDoc.id, { content: activeDoc.content + "\n> 중요 메모\n" })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                  >
                    인용구
                  </button>
                  <button
                    onClick={() => updateDocument(activeDoc.id, { content: activeDoc.content + "\n```typescript\n// 코드\n```\n" })}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                  >
                    코드블록
                  </button>
                </div>

                <textarea
                  value={activeDoc.content}
                  onChange={(e) => updateDocument(activeDoc.id, { content: e.target.value })}
                  placeholder="마크다운 형식으로 문서 내용을 작성하세요..."
                  className="w-full h-[calc(100vh-14rem)] bg-transparent border-0 text-xs text-slate-200 leading-relaxed resize-none focus:outline-none font-mono"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          선택된 문서가 없습니다.
        </div>
      )}
    </div>
  );
}
