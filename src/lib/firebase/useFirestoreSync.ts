"use client";

import { useEffect, useRef } from "react";
import { useStore, initialWorkspaces, initialChannels, initialMessages, initialTasks, initialDocuments, initialEvents, initialFiles, initialUsers } from "@/lib/store/useStore";
import {
  seedInitialFirestoreDataIfEmpty,
  subscribeToWorkspaceData,
  subscribeToMessages,
} from "./firestoreService";

export function useFirestoreSync() {
  const {
    activeWorkspaceId,
    activeChannelId,
    setChannelsFromCloud,
    setTasksFromCloud,
    setDocumentsFromCloud,
    setEventsFromCloud,
    setFilesFromCloud,
    setMembersFromCloud,
    setMessagesFromCloud,
    setCloudSyncStatus,
  } = useStore();

  const messagesUnsubRef = useRef<(() => void) | null>(null);

  // 1. Subscribe to Workspace collections (Channels, Tasks, Docs, Events, Files, Members)
  useEffect(() => {
    if (!activeWorkspaceId) return;

    setCloudSyncStatus("syncing");

    // Ensure seed data exists
    seedInitialFirestoreDataIfEmpty(activeWorkspaceId, {
      workspace: initialWorkspaces[0],
      channels: initialChannels,
      messages: initialMessages,
      tasks: initialTasks,
      documents: initialDocuments,
      events: initialEvents,
      files: initialFiles,
      users: initialUsers,
    }).catch(console.warn);

    // Subscribe to workspace-level data
    const unsubscribeWorkspace = subscribeToWorkspaceData(activeWorkspaceId, {
      onChannels: (channels) => {
        if (channels.length > 0) setChannelsFromCloud(channels);
      },
      onTasks: (tasks) => {
        if (tasks.length > 0) setTasksFromCloud(tasks);
      },
      onDocs: (docs) => {
        if (docs.length > 0) setDocumentsFromCloud(docs);
      },
      onEvents: (events) => {
        if (events.length > 0) setEventsFromCloud(events);
      },
      onFiles: (files) => {
        if (files.length > 0) setFilesFromCloud(files);
      },
      onMembers: (members) => {
        if (members.length > 0) setMembersFromCloud(members);
      },
      onError: (err) => {
        console.error("Firestore workspace sync error:", err);
        setCloudSyncStatus("offline");
      },
    });

    setCloudSyncStatus("connected");

    return () => {
      unsubscribeWorkspace();
    };
  }, [
    activeWorkspaceId,
    setChannelsFromCloud,
    setTasksFromCloud,
    setDocumentsFromCloud,
    setEventsFromCloud,
    setFilesFromCloud,
    setMembersFromCloud,
    setCloudSyncStatus,
  ]);

  // 2. Subscribe to Active Channel's Messages in real-time
  useEffect(() => {
    if (!activeWorkspaceId || !activeChannelId) return;

    // Clean up previous channel subscription
    if (messagesUnsubRef.current) {
      messagesUnsubRef.current();
      messagesUnsubRef.current = null;
    }

    const unsubMessages = subscribeToMessages(
      activeWorkspaceId,
      activeChannelId,
      (msgs) => {
        setMessagesFromCloud(activeChannelId, msgs);
      },
      (err) => {
        console.warn(`Firestore messages sync error for ${activeChannelId}:`, err);
      }
    );

    messagesUnsubRef.current = unsubMessages;

    return () => {
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
        messagesUnsubRef.current = null;
      }
    };
  }, [activeWorkspaceId, activeChannelId, setMessagesFromCloud]);
}
