import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  Workspace,
  Channel,
  Message,
  Task,
  TaskColumnId,
  Document,
  CalendarEvent,
  DriveFile,
  Notification,
  ActivityItem,
  TaskPriority,
} from "@/types";
import { generateId } from "@/lib/utils";

export type ViewType = "chat" | "kanban" | "docs" | "calendar" | "drive" | "members" | "settings";

interface AppState {
  // Navigation & UI
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Active Context
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  activeDocId: string;
  setActiveDocId: (id: string) => void;

  // Current User
  currentUser: User;
  setCurrentUserStatus: (status: User["status"]) => void;

  // Data
  users: User[];
  workspaces: Workspace[];
  channels: Channel[];
  messages: Record<string, Message[]>; // channelId -> messages
  tasks: Task[];
  documents: Document[];
  events: CalendarEvent[];
  files: DriveFile[];
  notifications: Notification[];
  activities: ActivityItem[];

  // Actions: Workspace
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  resetToDefaultData: () => void;

  // Actions: Chat
  sendMessage: (channelId: string, content: string, attachments?: any[]) => void;
  addReaction: (channelId: string, messageId: string, emoji: string) => void;
  createChannel: (name: string, description: string, isPrivate: boolean) => void;

  // Actions: Kanban
  addTask: (task: Omit<Task, "id" | "workspaceId" | "createdAt" | "order">) => void;
  moveTask: (taskId: string, targetColumn: TaskColumnId) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addTaskComment: (taskId: string, content: string) => void;

  // Actions: Docs
  createDocument: (title?: string, parentId?: string | null) => string;
  updateDocument: (docId: string, updates: Partial<Document>) => void;
  deleteDocument: (docId: string) => void;

  // Actions: Calendar
  addEvent: (event: Omit<CalendarEvent, "id" | "workspaceId" | "creatorId">) => void;
  deleteEvent: (eventId: string) => void;

  // Actions: Drive
  uploadFile: (name: string, size: string, type: DriveFile["type"]) => void;
  deleteFile: (fileId: string) => void;

  // Actions: Notifications
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  // Actions: Members
  inviteMember: (email: string, role: User["role"]) => void;
}

const initialUsers: User[] = [
  {
    id: "usr_1",
    name: "김민우 (Minwoo)",
    email: "minwoo@collab.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    status: "online",
    statusMessage: "🚀 Firebase App Hosting 런칭 준비 중",
    role: "owner",
  },
  {
    id: "usr_2",
    name: "이지은 (Jieun)",
    email: "jieun@collab.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    status: "online",
    statusMessage: "Next.js 14 클라이언트 컴포넌트 최적화",
    role: "admin",
  },
  {
    id: "usr_3",
    name: "박서준 (Seojun)",
    email: "seojun@collab.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    status: "busy",
    statusMessage: "Firestore Security Rules 감사 진행",
    role: "member",
  },
  {
    id: "usr_4",
    name: "최수아 (Sua)",
    email: "sua@collab.io",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    status: "away",
    statusMessage: "UI/UX 디자인 시스템 V2 작업",
    role: "member",
  },
];

const initialWorkspaces: Workspace[] = [
  {
    id: "ws_main",
    name: "넥스트 테크 엔지니어링",
    slug: "next-tech-eng",
    ownerId: "usr_1",
    plan: "pro",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ws_design",
    name: "글로벌 디자인 스튜디오",
    slug: "global-design",
    ownerId: "usr_1",
    plan: "enterprise",
    createdAt: new Date().toISOString(),
  },
];

const initialChannels: Channel[] = [
  {
    id: "ch_general",
    workspaceId: "ws_main",
    name: "일반-공지사항",
    description: "회사 및 프로젝트 전사 주요 공지 채널입니다.",
    isPrivate: false,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ch_engineering",
    workspaceId: "ws_main",
    name: "개발팀-엔지니어링",
    description: "Firebase App Hosting 인프라, Next.js, API 아키텍처 토론",
    isPrivate: false,
    unreadCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ch_design",
    workspaceId: "ws_main",
    name: "프로덕트-디자인",
    description: "Figma 시안 리뷰 및 디자인 피드백 공유",
    isPrivate: false,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ch_releases",
    workspaceId: "ws_main",
    name: "릴리즈-배포알림",
    description: "Cloud Run 배포 자동화 및 버전 업데이트 로그",
    isPrivate: true,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
  },
];

const initialMessages: Record<string, Message[]> = {
  ch_engineering: [
    {
      id: "msg_1",
      channelId: "ch_engineering",
      userId: "usr_3",
      content: "오늘 Firebase App Hosting 환경에 `apphosting.yaml` 설정 적용 완료했습니다! Cloud Run 기반 자동 오토스케일링 및 컨테이너 최적화가 잘 동작하네요.",
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      reactions: [
        { emoji: "🚀", count: 3, userIds: ["usr_1", "usr_2", "usr_4"] },
        { emoji: "🔥", count: 2, userIds: ["usr_1", "usr_2"] },
      ],
      threadCount: 3,
    },
    {
      id: "msg_2",
      channelId: "ch_engineering",
      userId: "usr_2",
      content: "좋습니다! Next.js App Router의 SSR 스트리밍과 Firestore 실시간 스냅샷 구독 성능 테스트도 99ms 이내로 매우 쾌적합니다. 💯",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      reactions: [
        { emoji: "👍", count: 2, userIds: ["usr_1", "usr_3"] },
      ],
    },
    {
      id: "msg_3",
      channelId: "ch_engineering",
      userId: "usr_1",
      content: "수고하셨습니다. 칸반 보드에서 백로그 태스크 확인하고 이번 주 스프린트 배포 일정 확정해 주세요!",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      reactions: [
        { emoji: "🫡", count: 2, userIds: ["usr_2", "usr_3"] },
      ],
    },
  ],
  ch_general: [
    {
      id: "msg_gen_1",
      channelId: "ch_general",
      userId: "usr_1",
      content: "👋 팀 여러분 환영합니다! 신규 협업 플랫폼(Web Collaboration Suite)에 오신 것을 환영합니다. 모든 채널과 태스크, 위키 문서, 드라이브를 자유롭게 테스트해 보세요.",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      reactions: [
        { emoji: "🎉", count: 4, userIds: ["usr_1", "usr_2", "usr_3", "usr_4"] },
        { emoji: "🙌", count: 3, userIds: ["usr_2", "usr_3", "usr_4"] },
      ],
    },
  ],
};

const initialTasks: Task[] = [
  {
    id: "tsk_1",
    workspaceId: "ws_main",
    title: "Firebase App Hosting Cloud Run 리소스 튜닝",
    description: "apphosting.yaml 파일에서 concurrency 80 및 minInstances 설정 최적화하여 콜드 스타트 제거",
    columnId: "in_progress",
    priority: "urgent",
    assigneeIds: ["usr_3"],
    dueDate: "2026-11-05",
    tags: ["DevOps", "Firebase"],
    checklist: [
      { id: "c1", title: "Cloud Run vCPU 1 & 512MB RAM 검증", completed: true },
      { id: "c2", title: "Cloud Secret Manager API 연동", completed: true },
      { id: "c3", title: "콜드 스타트 레이턴시 측정", completed: false },
    ],
    comments: [
      { id: "cm1", userId: "usr_1", content: "프로덕션 배포 전에 부하 테스트 결과 공유 바랍니다.", createdAt: new Date().toISOString() },
    ],
    order: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "tsk_2",
    workspaceId: "ws_main",
    title: "실시간 메시지 리액션 및 스레드 UI 개선",
    description: "사용자가 이모지를 클릭했을 때 낙관적 UI 업데이트(Optimistic Update) 적용",
    columnId: "in_progress",
    priority: "high",
    assigneeIds: ["usr_2"],
    dueDate: "2026-11-06",
    tags: ["Frontend", "UX"],
    checklist: [
      { id: "c4", title: "이모지 피커 팝오버 연동", completed: true },
      { id: "c5", title: "스레드 모달 레이아웃 구현", completed: false },
    ],
    order: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "tsk_3",
    workspaceId: "ws_main",
    title: "Notion 스타일 마크다운 블록 에디터 실시간 저장",
    description: "문서 작성 중 500ms 디바운스로 로컬/클라우드 자동 저장 및 상태 배지 표시",
    columnId: "review",
    priority: "medium",
    assigneeIds: ["usr_2", "usr_4"],
    dueDate: "2026-11-04",
    tags: ["Docs", "Frontend"],
    checklist: [
      { id: "c6", title: "타이틀 & 이모지 아이콘 선택기", completed: true },
      { id: "c7", title: "마크다운 실시간 렌더링", completed: true },
    ],
    order: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "tsk_4",
    workspaceId: "ws_main",
    title: "Firestore Security Rules 멀티테넌트 격리 감사",
    description: "워크스페이스 멤버가 아닌 사용자의 문서 읽기/쓰기 차단 규칙 검증",
    columnId: "done",
    priority: "urgent",
    assigneeIds: ["usr_3"],
    dueDate: "2026-11-02",
    tags: ["Security", "Database"],
    order: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "tsk_5",
    workspaceId: "ws_main",
    title: "팀 드라이브 파일 용량 제한 및 S3/GCS 서명 URL 검증",
    description: "Cloud Storage에 첨부된 대용량 파일 다운로드 속도 및 만료 토큰 테스트",
    columnId: "todo",
    priority: "medium",
    assigneeIds: ["usr_1"],
    dueDate: "2026-11-10",
    tags: ["Storage"],
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tsk_6",
    workspaceId: "ws_main",
    title: "모바일 반응형 드로어 네비게이션 적용",
    description: "스마트폰 및 태블릿 뷰포트에서 사이드바가 슬라이드 형태로 열리도록 처리",
    columnId: "backlog",
    priority: "low",
    assigneeIds: ["usr_4"],
    tags: ["UI", "Responsive"],
    order: 0,
    createdAt: new Date().toISOString(),
  },
];

const initialDocuments: Document[] = [
  {
    id: "doc_1",
    workspaceId: "ws_main",
    title: "2026 Q4 프로덕트 로드맵 및 핵심 목표",
    icon: "🗺️",
    content: `# 2026 Q4 프로덕트 전략 로드맵

## 1. 개요
본 문서는 차세대 통합 협업 플랫폼의 핵심 마일스톤 및 런칭 일정을 정의합니다.

### 핵심 목표 (OKRs)
1. **Firebase App Hosting 전환 완결**: Cloud Run 완전 관리형 SSR 인프라 안정화
2. **실시간성 극대화**: Firestore 기반 실시간 채팅/칸반/문서 지연시간 100ms 미만 유지
3. **올인원 사용자 경험**: 슬랙(대화) + 노션(문서) + 트렐로(작업)를 단일 워크스페이스에서 해결

## 2. 주요 일정
* **11월 1주차**: 핵심 기능 알파 테스트 (채팅, 칸반 보드, 위키 에디터)
* **11월 3주차**: 보안 감사 및 다중 워크스페이스 RBAC 권한 적용
* **12월 1주차**: 프로덕션 V1.0 정식 런칭
`,
    createdBy: "usr_1",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isFavorite: true,
  },
  {
    id: "doc_2",
    workspaceId: "ws_main",
    title: "Firebase App Hosting 배포 및 아키텍처 가이드",
    icon: "🔥",
    content: `# Firebase App Hosting 아키텍처 가이드

## 구조 개요
Next.js 14 App Router 애플리케이션은 Firebase App Hosting을 통해 다음과 같이 구동됩니다:

\`\`\`
[GitHub Push] ➔ [Cloud Build] ➔ [Cloud Run (SSR + Edge Cache)] ➔ [Client Browser]
                                         │
                                   [Cloud Firestore]
                                   [Firebase Auth]
                                   [Cloud Storage]
\`\`\`

### 주요 설정 파일
* \`apphosting.yaml\`: CPU, Memory, 동시성(Concurrency), 환경 변수 정의
* \`firebase.json\`: backendId 및 배포 무시 파일 패턴 설정
* \`firestore.rules\`: 워크스페이스 테넌트별 데이터 접근 보안 규칙
`,
    createdBy: "usr_3",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isFavorite: true,
  },
  {
    id: "doc_3",
    workspaceId: "ws_main",
    title: "UI 디자인 시스템 & 컴포넌트 가이드",
    icon: "🎨",
    content: `# 디자인 시스템 가이드라인

## 컬러 팔레트
* Brand Primary: Indigo (#6366F1, #4F46E5)
* Slate Grays: #0F172A, #1E293B, #334155, #64748B
* Accent Colors: Emerald(성공), Amber(경고), Rose(긴급)

## 폰트 & 가독성
* 기본 본문: Pretendard / Inter (14px - 16px)
* 코드 블록: JetBrains Mono / Fira Code
`,
    createdBy: "usr_4",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];

const initialEvents: CalendarEvent[] = [
  {
    id: "ev_1",
    workspaceId: "ws_main",
    title: "주간 엔지니어링 올핸즈 미팅",
    description: "전체 스프린트 리뷰 및 아키텍처 공유",
    startDate: "2026-11-03T10:00:00",
    endDate: "2026-11-03T11:30:00",
    allDay: false,
    category: "meeting",
    creatorId: "usr_1",
    attendees: ["usr_1", "usr_2", "usr_3", "usr_4"],
  },
  {
    id: "ev_2",
    workspaceId: "ws_main",
    title: "Firebase Cloud Run 마이그레이션 점검",
    description: "트래픽 오토스케일링 및 지연시간 벤치마크",
    startDate: "2026-11-05T14:00:00",
    endDate: "2026-11-05T16:00:00",
    allDay: false,
    category: "milestone",
    creatorId: "usr_3",
    attendees: ["usr_1", "usr_3"],
  },
  {
    id: "ev_3",
    workspaceId: "ws_main",
    title: "디자인 시스템 V2 피그마 시안 리뷰",
    description: "신규 컴포넌트 라이브러리 검토",
    startDate: "2026-11-06T15:00:00",
    endDate: "2026-11-06T16:00:00",
    allDay: false,
    category: "review",
    creatorId: "usr_4",
    attendees: ["usr_2", "usr_4"],
  },
];

const initialFiles: DriveFile[] = [
  {
    id: "f_1",
    workspaceId: "ws_main",
    name: "firebase_architecture_diagram.png",
    size: "2.4 MB",
    type: "image",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    uploadedBy: "usr_3",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "f_2",
    workspaceId: "ws_main",
    name: "2026_Q4_Product_Specification.pdf",
    size: "5.1 MB",
    type: "pdf",
    url: "#",
    uploadedBy: "usr_1",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "f_3",
    workspaceId: "ws_main",
    name: "brand_design_assets_v2.zip",
    size: "18.3 MB",
    type: "archive",
    url: "#",
    uploadedBy: "usr_4",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
  },
];

const initialNotifications: Notification[] = [
  {
    id: "notif_1",
    userId: "usr_1",
    title: "새로운 태스크 배정",
    body: "박서준님이 'Firebase App Hosting Cloud Run 리소스 튜닝' 태스크를 배정했습니다.",
    type: "task_assigned",
    link: "/boards",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "notif_2",
    userId: "usr_1",
    title: "새 멘션 알림",
    body: "이지은님이 '#개발팀-엔지니어링' 채널에서 회원님을 멘션했습니다.",
    type: "mention",
    link: "/channels/ch_engineering",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

const initialActivities: ActivityItem[] = [
  {
    id: "act_1",
    workspaceId: "ws_main",
    userId: "usr_3",
    action: "태스크 완료 처리",
    target: "Firestore Security Rules 멀티테넌트 격리 감사",
    timeAgo: "15분 전",
  },
  {
    id: "act_2",
    workspaceId: "ws_main",
    userId: "usr_2",
    action: "새 문서 작성",
    target: "UI 디자인 시스템 & 컴포넌트 가이드",
    timeAgo: "1시간 전",
  },
  {
    id: "act_3",
    workspaceId: "ws_main",
    userId: "usr_1",
    action: "새 채널 개설",
    target: "#릴리즈-배포알림",
    timeAgo: "3시간 전",
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: "chat",
      setCurrentView: (view) => set({ currentView: view }),
      isSidebarOpen: true,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      activeWorkspaceId: "ws_main",
      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
      activeChannelId: "ch_engineering",
      setActiveChannelId: (id) => set({ activeChannelId: id, currentView: "chat" }),
      activeDocId: "doc_1",
      setActiveDocId: (id) => set({ activeDocId: id, currentView: "docs" }),

      currentUser: initialUsers[0],
      setCurrentUserStatus: (status) =>
        set((state) => ({
          currentUser: { ...state.currentUser, status },
          users: state.users.map((u) =>
            u.id === state.currentUser.id ? { ...u, status } : u
          ),
        })),

      users: initialUsers,
      workspaces: initialWorkspaces,
      channels: initialChannels,
      messages: initialMessages,
      tasks: initialTasks,
      documents: initialDocuments,
      events: initialEvents,
      files: initialFiles,
      notifications: initialNotifications,
      activities: initialActivities,

      // Workspace Actions
      updateWorkspace: (id, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      resetToDefaultData: () => {
        set({
          users: initialUsers,
          workspaces: initialWorkspaces,
          channels: initialChannels,
          messages: initialMessages,
          tasks: initialTasks,
          documents: initialDocuments,
          events: initialEvents,
          files: initialFiles,
          notifications: initialNotifications,
          activities: initialActivities,
          activeWorkspaceId: "ws_main",
          activeChannelId: "ch_engineering",
          activeDocId: "doc_1",
          currentView: "chat",
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("collab_tool_storage_v1");
        }
      },

      // Chat Actions
      sendMessage: (channelId, content, attachments = []) => {
        const { currentUser, messages } = get();
        if (!content.trim() && attachments.length === 0) return;

        const newMessage: Message = {
          id: generateId("msg"),
          channelId,
          userId: currentUser.id,
          content,
          createdAt: new Date().toISOString(),
          reactions: [],
          attachments,
        };

        set({
          messages: {
            ...messages,
            [channelId]: [...(messages[channelId] || []), newMessage],
          },
        });
      },

      addReaction: (channelId, messageId, emoji) => {
        const { currentUser, messages } = get();
        const channelMsgs = messages[channelId] || [];

        const updatedMsgs = channelMsgs.map((msg) => {
          if (msg.id !== messageId) return msg;

          const existingReactionIndex = msg.reactions.findIndex(
            (r) => r.emoji === emoji
          );

          let newReactions = [...msg.reactions];
          if (existingReactionIndex >= 0) {
            const reaction = newReactions[existingReactionIndex];
            const userHasReacted = reaction.userIds.includes(currentUser.id);

            if (userHasReacted) {
              const updatedUserIds = reaction.userIds.filter(
                (id) => id !== currentUser.id
              );
              if (updatedUserIds.length === 0) {
                newReactions.splice(existingReactionIndex, 1);
              } else {
                newReactions[existingReactionIndex] = {
                  ...reaction,
                  count: reaction.count - 1,
                  userIds: updatedUserIds,
                };
              }
            } else {
              newReactions[existingReactionIndex] = {
                ...reaction,
                count: reaction.count + 1,
                userIds: [...reaction.userIds, currentUser.id],
              };
            }
          } else {
            newReactions.push({
              emoji,
              count: 1,
              userIds: [currentUser.id],
            });
          }

          return { ...msg, reactions: newReactions };
        });

        set({
          messages: {
            ...messages,
            [channelId]: updatedMsgs,
          },
        });
      },

      createChannel: (name, description, isPrivate) => {
        const cleanName = name.toLowerCase().replace(/\s+/g, "-");
        const newChan: Channel = {
          id: generateId("ch"),
          workspaceId: get().activeWorkspaceId,
          name: cleanName,
          description,
          isPrivate,
          unreadCount: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          channels: [...state.channels, newChan],
          activeChannelId: newChan.id,
          currentView: "chat",
        }));
      },

      // Task Actions
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId("tsk"),
          workspaceId: get().activeWorkspaceId,
          order: get().tasks.length,
          createdAt: new Date().toISOString(),
          checklist: taskData.checklist || [],
          comments: taskData.comments || [],
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      moveTask: (taskId, targetColumn) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, columnId: targetColumn } : t
          ),
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },

      toggleChecklistItem: (taskId, itemId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId || !t.checklist) return t;
            return {
              ...t,
              checklist: t.checklist.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            };
          }),
        }));
      },

      addTaskComment: (taskId, content) => {
        const { currentUser } = get();
        if (!content.trim()) return;

        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const newComment = {
              id: generateId("cm"),
              userId: currentUser.id,
              content,
              createdAt: new Date().toISOString(),
            };
            return {
              ...t,
              comments: [...(t.comments || []), newComment],
            };
          }),
        }));
      },

      // Document Actions
      createDocument: (title = "제목 없는 문서", parentId = null) => {
        const newDoc: Document = {
          id: generateId("doc"),
          workspaceId: get().activeWorkspaceId,
          title,
          icon: "📄",
          content: `# ${title}\n\n여기에 실시간 협업 내용을 입력하세요...`,
          parentId,
          createdBy: get().currentUser.id,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          documents: [newDoc, ...state.documents],
          activeDocId: newDoc.id,
          currentView: "docs",
        }));

        return newDoc.id;
      },

      updateDocument: (docId, updates) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === docId
              ? { ...d, ...updates, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      deleteDocument: (docId) => {
        set((state) => {
          const remaining = state.documents.filter((d) => d.id !== docId);
          return {
            documents: remaining,
            activeDocId: remaining[0]?.id || "",
          };
        });
      },

      // Calendar Actions
      addEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: generateId("ev"),
          workspaceId: get().activeWorkspaceId,
          creatorId: get().currentUser.id,
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      deleteEvent: (eventId) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== eventId),
        }));
      },

      // Drive Actions
      uploadFile: (name, size, type) => {
        const newFile: DriveFile = {
          id: generateId("f"),
          workspaceId: get().activeWorkspaceId,
          name,
          size,
          type,
          url: "#",
          uploadedBy: get().currentUser.id,
          uploadedAt: new Date().toISOString(),
        };
        set((state) => ({
          files: [newFile, ...state.files],
        }));
      },

      deleteFile: (fileId) => {
        set((state) => ({
          files: state.files.filter((f) => f.id !== fileId),
        }));
      },

      // Notification Actions
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      // Member Actions
      inviteMember: (email, role) => {
        const newUser: User = {
          id: generateId("usr"),
          name: email.split("@")[0],
          email,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
          status: "offline",
          role,
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
      },
    }),
    {
      name: "collab_tool_storage_v1",
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
        activeChannelId: state.activeChannelId,
        activeDocId: state.activeDocId,
        currentView: state.currentView,
        currentUser: state.currentUser,
        users: state.users,
        workspaces: state.workspaces,
        channels: state.channels,
        messages: state.messages,
        tasks: state.tasks,
        documents: state.documents,
        events: state.events,
        files: state.files,
        notifications: state.notifications,
        activities: state.activities,
      }),
    }
  )
);
