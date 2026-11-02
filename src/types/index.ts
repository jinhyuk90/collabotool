export type Role = 'owner' | 'admin' | 'member' | 'guest';
export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  statusMessage?: string;
  role: Role;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  unreadCount?: number;
  createdAt: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: string;
  reactions: MessageReaction[];
  attachments?: MessageAttachment[];
  threadCount?: number;
  isPinned?: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskColumnId = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  columnId: TaskColumnId;
  priority: TaskPriority;
  assigneeIds: string[];
  dueDate?: string;
  tags: string[];
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
  order: number;
  createdAt: string;
}

export interface Document {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  icon?: string;
  parentId?: string | null;
  createdBy: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface CalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  category: 'meeting' | 'milestone' | 'deadline' | 'review';
  creatorId: string;
  attendees: string[];
}

export interface DriveFile {
  id: string;
  workspaceId: string;
  name: string;
  size: string;
  type: 'image' | 'pdf' | 'document' | 'archive' | 'other';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  channelOrTaskId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'mention' | 'task_assigned' | 'comment' | 'deadline';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  target: string;
  timeAgo: string;
}
