"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  Tag,
  ChevronRight,
  Trash2,
  X,
  User as UserIcon,
} from "lucide-react";
import { Task, TaskColumnId, TaskPriority } from "@/types";
import { formatDate } from "@/lib/utils";

const COLUMNS: { id: TaskColumnId; label: string; color: string }[] = [
  { id: "backlog", label: "아이디어 & 백로그", color: "bg-slate-500" },
  { id: "todo", label: "할 일 (To Do)", color: "bg-amber-500" },
  { id: "in_progress", label: "진행 중 (In Progress)", color: "bg-indigo-500" },
  { id: "review", label: "코드 리뷰 (Review)", color: "bg-purple-500" },
  { id: "done", label: "완료됨 (Done)", color: "bg-emerald-500" },
];

const PRIORITY_BADGES: Record<TaskPriority, { label: string; style: string }> = {
  urgent: { label: "긴급", style: "bg-rose-950 text-rose-400 border-rose-800" },
  high: { label: "높음", style: "bg-amber-950 text-amber-400 border-amber-800" },
  medium: { label: "보통", style: "bg-blue-950 text-blue-400 border-blue-800" },
  low: { label: "낮음", style: "bg-slate-800 text-slate-400 border-slate-700" },
};

export function KanbanBoard() {
  const {
    tasks,
    users,
    addTask,
    moveTask,
    deleteTask,
    toggleChecklistItem,
    addTaskComment,
  } = useStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCol, setNewCol] = useState<TaskColumnId>("todo");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newAssignee, setNewAssignee] = useState<string>(users[0]?.id || "");
  const [newTags, setNewTags] = useState("Frontend");
  const [newCommentInput, setNewCommentInput] = useState("");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      columnId: newCol,
      priority: newPriority,
      assigneeIds: newAssignee ? [newAssignee] : [],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split("T")[0],
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    setNewTitle("");
    setNewDesc("");
    setIsAddModalOpen(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentInput.trim()) return;
    addTaskComment(selectedTask.id, newCommentInput.trim());
    setNewCommentInput("");
    // refresh selected task
    const updated = tasks.find((t) => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-100">프로젝트 스프린트 보드</h2>
          <p className="text-[11px] text-slate-400">
            총 {tasks.length}개의 작업 항목 • 진행 중 {tasks.filter((t) => t.columnId === "in_progress").length}개
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 태스크 추가</span>
        </button>
      </div>

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-4">
        {COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => t.columnId === column.id);

          return (
            <div
              key={column.id}
              className="w-72 shrink-0 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 max-h-full"
            >
              {/* Column Title */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <span className="text-xs font-bold text-slate-200">{column.label}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colTasks.map((task) => {
                  const assignees = users.filter((u) => task.assigneeIds.includes(u.id));
                  const completedChecklist = task.checklist?.filter((c) => c.completed).length || 0;
                  const totalChecklist = task.checklist?.length || 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-slate-900 border border-slate-800/80 hover:border-indigo-500/60 rounded-xl p-3.5 shadow-sm hover:shadow-md transition cursor-pointer group"
                    >
                      {/* Priority & Tags */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                            PRIORITY_BADGES[task.priority].style
                          }`}
                        >
                          {PRIORITY_BADGES[task.priority].label}
                        </span>

                        <div className="flex items-center gap-1">
                          {task.tags.map((tg) => (
                            <span
                              key={tg}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                            >
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Description Preview */}
                      {task.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Card Footer: Checklist, Due Date, Assignees */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                        <div className="flex items-center gap-2">
                          {totalChecklist > 0 && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <CheckSquare className="w-3 h-3 text-indigo-400" />
                              {completedChecklist}/{totalChecklist}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {task.dueDate.slice(5)}
                            </span>
                          )}
                        </div>

                        {/* Assignee Avatar Stack */}
                        <div className="flex -space-x-1.5">
                          {assignees.map((u) => (
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

                      {/* Quick Move Column Select on hover */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500"
                      >
                        <span>위치 이동:</span>
                        <select
                          value={task.columnId}
                          onChange={(e) => moveTask(task.id, e.target.value as TaskColumnId)}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 text-[10px] focus:outline-none"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                    PRIORITY_BADGES[selectedTask.priority].style
                  }`}
                >
                  {PRIORITY_BADGES[selectedTask.priority].label}
                </span>
                <span className="text-xs text-slate-400">
                  {COLUMNS.find((c) => c.id === selectedTask.columnId)?.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    deleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="태스크 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-100">{selectedTask.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedTask.description || "상세 설명이 없습니다."}
              </p>

              {/* Checklist */}
              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    체크리스트
                  </h4>
                  <div className="space-y-1.5">
                    {selectedTask.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(selectedTask.id, item.id)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer hover:bg-slate-800/40 transition"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          readOnly
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600"
                        />
                        <span
                          className={`text-xs ${
                            item.completed ? "line-through text-slate-500" : "text-slate-200"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  댓글 ({selectedTask.comments?.length || 0})
                </h4>
                <div className="space-y-2 mb-3">
                  {selectedTask.comments?.map((cm) => {
                    const commenter = users.find((u) => u.id === cm.userId);
                    return (
                      <div key={cm.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-indigo-300">{commenter?.name || "팀원"}</span>
                          <span className="text-[10px] text-slate-500">{formatDate(cm.createdAt)}</span>
                        </div>
                        <p className="text-slate-300">{cm.content}</p>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentInput}
                    onChange={(e) => setNewCommentInput(e.target.value)}
                    placeholder="댓글을 작성해 피드백을 남겨주세요..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    등록
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              새로운 작업(Task) 생성
            </h3>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  작업명 (Title)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: Firestore 실시간 쿼리 인덱싱"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  상세 설명
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="작업에 대한 세부 내용을 입력하세요."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    컬럼 선택
                  </label>
                  <select
                    value={newCol}
                    onChange={(e) => setNewCol(e.target.value as TaskColumnId)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    우선순위
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">낮음 (Low)</option>
                    <option value="medium">보통 (Medium)</option>
                    <option value="high">높음 (High)</option>
                    <option value="urgent">긴급 (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    담당자
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    태그 (쉼표 구분)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Frontend, API"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  태스크 만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
