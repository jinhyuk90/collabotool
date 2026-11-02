import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "./client";
import {
  Channel,
  Message,
  Task,
  Document,
  CalendarEvent,
  DriveFile,
  User,
  Workspace,
} from "@/types";

// Helper to remove any undefined fields before writing to Firestore
function sanitize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

// Collection references helper
const getWsDoc = (workspaceId: string) => doc(db, "workspaces", workspaceId);
const getChannelsCol = (workspaceId: string) =>
  collection(db, "workspaces", workspaceId, "channels");
const getMessagesCol = (workspaceId: string, channelId: string) =>
  collection(db, "workspaces", workspaceId, "channels", channelId, "messages");
const getTasksCol = (workspaceId: string) =>
  collection(db, "workspaces", workspaceId, "tasks");
const getDocsCol = (workspaceId: string) =>
  collection(db, "workspaces", workspaceId, "documents");
const getEventsCol = (workspaceId: string) =>
  collection(db, "workspaces", workspaceId, "events");
const getFilesCol = (workspaceId: string) =>
  collection(db, "workspaces", workspaceId, "files");
const getMembersCol = (workspaceId: string) =>
  collection(db, "workspaces", workspaceId, "members");

// Seed initial data if workspace in Cloud Firestore is empty
export async function seedInitialFirestoreDataIfEmpty(
  workspaceId: string,
  initialData: {
    workspace: Workspace;
    channels: Channel[];
    messages: Record<string, Message[]>;
    tasks: Task[];
    documents: Document[];
    events: CalendarEvent[];
    files: DriveFile[];
    users: User[];
  }
) {
  try {
    const channelsSnap = await getDocs(getChannelsCol(workspaceId));
    if (!channelsSnap.empty) {
      return; // Already has data in Firestore!
    }

    console.log("Seeding initial collaboration data to Cloud Firestore...");
    const batch = writeBatch(db);

    // Save Workspace
    batch.set(getWsDoc(workspaceId), sanitize(initialData.workspace));

    // Save Channels
    for (const ch of initialData.channels) {
      batch.set(doc(db, "workspaces", workspaceId, "channels", ch.id), sanitize(ch));
    }

    // Save Tasks
    for (const t of initialData.tasks) {
      batch.set(doc(db, "workspaces", workspaceId, "tasks", t.id), sanitize(t));
    }

    // Save Documents
    for (const d of initialData.documents) {
      batch.set(doc(db, "workspaces", workspaceId, "documents", d.id), sanitize(d));
    }

    // Save Events
    for (const ev of initialData.events) {
      batch.set(doc(db, "workspaces", workspaceId, "events", ev.id), sanitize(ev));
    }

    // Save Files
    for (const f of initialData.files) {
      batch.set(doc(db, "workspaces", workspaceId, "files", f.id), sanitize(f));
    }

    // Save Members
    for (const u of initialData.users) {
      batch.set(doc(db, "workspaces", workspaceId, "members", u.id), sanitize(u));
    }

    await batch.commit();

    // Save initial messages for channels
    for (const [channelId, msgs] of Object.entries(initialData.messages)) {
      for (const m of msgs) {
        await setDoc(
          doc(db, "workspaces", workspaceId, "channels", channelId, "messages", m.id),
          sanitize(m)
        );
      }
    }
    console.log("Cloud Firestore seeding complete!");
  } catch (error) {
    console.warn("Firestore seed skipped or failed:", error);
  }
}

// Real-time Subscriptions
export function subscribeToWorkspaceData(
  workspaceId: string,
  callbacks: {
    onChannels: (channels: Channel[]) => void;
    onTasks: (tasks: Task[]) => void;
    onDocs: (docs: Document[]) => void;
    onEvents: (events: CalendarEvent[]) => void;
    onFiles: (files: DriveFile[]) => void;
    onMembers: (members: User[]) => void;
    onError?: (err: any) => void;
  }
) {
  const unsubs: (() => void)[] = [];

  // Channels
  unsubs.push(
    onSnapshot(
      getChannelsCol(workspaceId),
      (snap) => {
        if (!snap.empty) {
          const channels = snap.docs.map((d) => d.data() as Channel);
          callbacks.onChannels(channels);
        }
      },
      (err) => {
        console.warn("Channels sub error:", err);
        callbacks.onError?.(err);
      }
    )
  );

  // Tasks
  unsubs.push(
    onSnapshot(
      getTasksCol(workspaceId),
      (snap) => {
        if (!snap.empty) {
          const tasks = snap.docs.map((d) => d.data() as Task);
          callbacks.onTasks(tasks);
        }
      },
      (err) => {
        console.warn("Tasks sub error:", err);
        callbacks.onError?.(err);
      }
    )
  );

  // Documents
  unsubs.push(
    onSnapshot(
      getDocsCol(workspaceId),
      (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d) => d.data() as Document);
          callbacks.onDocs(docs);
        }
      },
      (err) => {
        console.warn("Docs sub error:", err);
        callbacks.onError?.(err);
      }
    )
  );

  // Events
  unsubs.push(
    onSnapshot(
      getEventsCol(workspaceId),
      (snap) => {
        if (!snap.empty) {
          const events = snap.docs.map((d) => d.data() as CalendarEvent);
          callbacks.onEvents(events);
        }
      },
      (err) => {
        console.warn("Events sub error:", err);
        callbacks.onError?.(err);
      }
    )
  );

  // Files
  unsubs.push(
    onSnapshot(
      getFilesCol(workspaceId),
      (snap) => {
        if (!snap.empty) {
          const files = snap.docs.map((d) => d.data() as DriveFile);
          callbacks.onFiles(files);
        }
      },
      (err) => {
        console.warn("Files sub error:", err);
        callbacks.onError?.(err);
      }
    )
  );

  // Members
  unsubs.push(
    onSnapshot(
      getMembersCol(workspaceId),
      (snap) => {
        if (!snap.empty) {
          const members = snap.docs.map((d) => d.data() as User);
          callbacks.onMembers(members);
        }
      },
      (err) => {
        console.warn("Members sub error:", err);
        callbacks.onError?.(err);
      }
    )
  );

  return () => {
    unsubs.forEach((u) => u());
  };
}

export function subscribeToMessages(
  workspaceId: string,
  channelId: string,
  onMessages: (msgs: Message[]) => void,
  onError?: (err: any) => void
) {
  const q = query(getMessagesCol(workspaceId, channelId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const msgs = snap.docs.map((d) => d.data() as Message);
      onMessages(msgs);
    },
    (err) => {
      console.warn("Messages sub error for channel", channelId, err);
      onError?.(err);
    }
  );
}

// Writers
export async function firestoreSendMessage(
  workspaceId: string,
  channelId: string,
  message: Message
) {
  try {
    await setDoc(
      doc(db, "workspaces", workspaceId, "channels", channelId, "messages", message.id),
      sanitize(message)
    );
  } catch (error) {
    console.error("Failed to send message to Firestore:", error);
  }
}

export async function firestoreUpdateReactions(
  workspaceId: string,
  channelId: string,
  messageId: string,
  reactions: any[]
) {
  try {
    await updateDoc(
      doc(db, "workspaces", workspaceId, "channels", channelId, "messages", messageId),
      sanitize({ reactions })
    );
  } catch (error) {
    console.error("Failed to update reactions in Firestore:", error);
  }
}

export async function firestoreAddThreadReply(
  workspaceId: string,
  channelId: string,
  messageId: string,
  allReplies: any[]
) {
  try {
    await updateDoc(
      doc(db, "workspaces", workspaceId, "channels", channelId, "messages", messageId),
      sanitize({
        threadReplies: allReplies,
        threadCount: allReplies.length,
      })
    );
  } catch (error) {
    console.error("Failed to add thread reply in Firestore:", error);
  }
}

export async function firestoreCreateChannel(workspaceId: string, channel: Channel) {
  try {
    await setDoc(
      doc(db, "workspaces", workspaceId, "channels", channel.id),
      sanitize(channel)
    );
  } catch (error) {
    console.error("Failed to create channel in Firestore:", error);
  }
}

export async function firestoreSaveTask(workspaceId: string, task: Task) {
  try {
    await setDoc(doc(db, "workspaces", workspaceId, "tasks", task.id), sanitize(task));
  } catch (error) {
    console.error("Failed to save task to Firestore:", error);
  }
}

export async function firestoreUpdateTask(
  workspaceId: string,
  taskId: string,
  updates: Partial<Task>
) {
  try {
    await updateDoc(
      doc(db, "workspaces", workspaceId, "tasks", taskId),
      sanitize(updates)
    );
  } catch (error) {
    console.error("Failed to update task in Firestore:", error);
  }
}

export async function firestoreDeleteTask(workspaceId: string, taskId: string) {
  try {
    await deleteDoc(doc(db, "workspaces", workspaceId, "tasks", taskId));
  } catch (error) {
    console.error("Failed to delete task in Firestore:", error);
  }
}

export async function firestoreSaveDoc(workspaceId: string, document: Document) {
  try {
    await setDoc(
      doc(db, "workspaces", workspaceId, "documents", document.id),
      sanitize(document)
    );
  } catch (error) {
    console.error("Failed to save document in Firestore:", error);
  }
}

// Debounce map for wiki document typing
const docDebounceTimers: Record<string, NodeJS.Timeout> = {};

export function firestoreUpdateDocDebounced(
  workspaceId: string,
  docId: string,
  updates: Partial<Document>,
  delayMs = 600
) {
  if (docDebounceTimers[docId]) {
    clearTimeout(docDebounceTimers[docId]);
  }
  docDebounceTimers[docId] = setTimeout(async () => {
    try {
      await updateDoc(
        doc(db, "workspaces", workspaceId, "documents", docId),
        sanitize(updates)
      );
    } catch (error) {
      console.error("Failed to update document in Firestore:", error);
    }
  }, delayMs);
}

export async function firestoreUpdateDoc(
  workspaceId: string,
  docId: string,
  updates: Partial<Document>
) {
  try {
    await updateDoc(
      doc(db, "workspaces", workspaceId, "documents", docId),
      sanitize(updates)
    );
  } catch (error) {
    console.error("Failed to update document in Firestore:", error);
  }
}

export async function firestoreDeleteDoc(workspaceId: string, docId: string) {
  try {
    await deleteDoc(doc(db, "workspaces", workspaceId, "documents", docId));
  } catch (error) {
    console.error("Failed to delete document in Firestore:", error);
  }
}

export async function firestoreSaveEvent(workspaceId: string, event: CalendarEvent) {
  try {
    await setDoc(
      doc(db, "workspaces", workspaceId, "events", event.id),
      sanitize(event)
    );
  } catch (error) {
    console.error("Failed to save event in Firestore:", error);
  }
}

export async function firestoreDeleteEvent(workspaceId: string, eventId: string) {
  try {
    await deleteDoc(doc(db, "workspaces", workspaceId, "events", eventId));
  } catch (error) {
    console.error("Failed to delete event in Firestore:", error);
  }
}

export async function firestoreSaveFile(workspaceId: string, file: DriveFile) {
  try {
    await setDoc(doc(db, "workspaces", workspaceId, "files", file.id), sanitize(file));
  } catch (error) {
    console.error("Failed to save file in Firestore:", error);
  }
}

export async function firestoreDeleteFile(workspaceId: string, fileId: string) {
  try {
    await deleteDoc(doc(db, "workspaces", workspaceId, "files", fileId));
  } catch (error) {
    console.error("Failed to delete file in Firestore:", error);
  }
}

export async function firestoreSaveMember(workspaceId: string, user: User) {
  try {
    await setDoc(
      doc(db, "workspaces", workspaceId, "members", user.id),
      sanitize(user)
    );
  } catch (error) {
    console.error("Failed to save member in Firestore:", error);
  }
}

export async function firestoreUpdateMemberStatus(
  workspaceId: string,
  userId: string,
  status: User["status"]
) {
  try {
    await updateDoc(
      doc(db, "workspaces", workspaceId, "members", userId),
      sanitize({ status })
    );
  } catch (error) {
    console.error("Failed to update member status in Firestore:", error);
  }
}

export async function firestoreUpdateWorkspace(
  workspaceId: string,
  updates: Partial<Workspace>
) {
  try {
    await updateDoc(doc(db, "workspaces", workspaceId), sanitize(updates));
  } catch (error) {
    console.error("Failed to update workspace in Firestore:", error);
  }
}
