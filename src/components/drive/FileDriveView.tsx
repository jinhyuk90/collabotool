"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  FolderArchive,
  Upload,
  FileImage,
  FileText,
  FileArchive,
  File,
  Download,
  Trash2,
  HardDrive,
  Check,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DriveFile } from "@/types";

export function FileDriveView() {
  const { files, uploadFile, deleteFile, users } = useStore();
  const [filterType, setFilterType] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);

  const filteredFiles = files.filter((f) => {
    if (filterType === "all") return true;
    return f.type === filterType;
  });

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      uploadFile("product_specification_v2.pdf", "3.8 MB", "pdf");
      setIsUploading(false);
    }, 800);
  };

  const getFileIcon = (type: DriveFile["type"]) => {
    switch (type) {
      case "image":
        return <FileImage className="w-5 h-5 text-indigo-400" />;
      case "pdf":
      case "document":
        return <FileText className="w-5 h-5 text-amber-400" />;
      case "archive":
        return <FileArchive className="w-5 h-5 text-purple-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-indigo-400" />
            중앙 집중식 파일 드라이브 (Cloud Storage)
          </h2>
          <p className="text-[11px] text-slate-400">
            대화 및 작업에서 공유된 파일과 에셋을 안전하게 보관합니다.
          </p>
        </div>

        <button
          onClick={handleSimulateUpload}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? "업로드 중..." : "파일 업로드"}</span>
        </button>
      </div>

      {/* Storage Gauge Card */}
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Firebase Storage 사용 현황</p>
              <p className="text-[11px] text-slate-400">25.8 MB / 5 GB 사용 (무료 기본 제공 용량)</p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[12%]" />
            </div>
            <p className="text-[10px] text-right text-slate-500 mt-1">12% 소진</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4">
          {["all", "image", "pdf", "archive"].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition ${
                filterType === ft
                  ? "bg-indigo-600 text-white font-medium"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {ft === "all" ? "전체 보기" : ft === "image" ? "이미지" : ft === "pdf" ? "문서/PDF" : "압축파일"}
            </button>
          ))}
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredFiles.map((file) => {
            const uploader = users.find((u) => u.id === file.uploadedBy);

            return (
              <div
                key={file.id}
                className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {file.size} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span className="truncate">업로더: {uploader?.name || "팀원"}</span>

                  <div className="flex items-center gap-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                      title="다운로드"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
