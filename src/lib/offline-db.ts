import Dexie, { type Table } from "dexie";
import { Message } from "@/types/ai";

/**
 * 📶 Tablawy Offline DB
 * Powered by Dexie (IndexedDB) for high-performance offline learning.
 * Hardened for Phase 4 scale-up and Law 151 compliance.
 */

export interface CachedLesson {
  id: string;
  classId: string;
  title: string;
  content: string;
  attachments: unknown[];
  cachedAt: number;
}

export interface PendingQuizSubmission {
  id?: number; // Auto-incrementing
  quizId: string;
  userId: string;
  answers: unknown;
  submittedAt: number;
  retryCount?: number;
}

export interface UserNote {
  id: string;
  lessonId: string;
  content: string;
  updatedAt: number;
  isSynced: boolean;
}

export interface PendingMutation {
  id?: number;
  resource: string;
  action: "create" | "update" | "delete" | "custom";
  variables: Record<string, unknown>;
  meta?: Record<string, unknown>;
  createdAt: number;
}

export interface AiHistory {
  id?: number;
  userId: string;
  classId: string;
  messages: Message[];
  timestamp: number;
}

export interface RegistrationDraft {
  id: string; // "current_registration"
  step: number;
  values: Record<string, unknown>;
  updatedAt: number;
}

export interface BackgroundJobRecord {
  id: string; // Primary Key
  type: string;
  status: "processing" | "completed" | "failed";
  title: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
  retryCount?: number;
  correlationId?: string;
}

export interface StudyPlanRecord {
  id: string; // "current"
  plan: unknown[];
  completedBlocks: Record<string, boolean>;
  updatedAt: number;
}

export interface PendingXpGain {
  id?: number;
  amount: number;
  reason: string;
  createdAt: number;
}

export interface ResourceCache {
  key: string; // resource-name:filters:pagination:sort
  data: unknown;
  total?: number;
  updatedAt: number;
}

export interface AttachmentBlob {
  id?: number;
  resourceId: string;
  blob: Blob;
  fileName: string;
  contentType: string;
}

export interface BehavioralSignal {
  id?: number;
  userId: string;
  tenantId: string;
  classId?: string | null;
  signalType: string;
  metadata: Record<string, any>;
  sessionId?: string | null;
  correlationId?: string | null;
  createdAt: number;
}

export interface CachedPattern {
  id: string;
  requiredSignals: string[];
  timeWindowHours: number;
  occurrenceThreshold: number;
  baseConfidence: string;
  description: string;
  updatedAt: number;
}

export class OfflineDB extends Dexie {
  lessons!: Table<CachedLesson>;
  quizzes!: Table<PendingQuizSubmission>;
  notes!: Table<UserNote>;
  mutations!: Table<PendingMutation>;
  ai_history!: Table<AiHistory>;
  registration_drafts!: Table<RegistrationDraft>;
  background_jobs!: Table<BackgroundJobRecord>;
  study_plans!: Table<StudyPlanRecord>;
  pending_xp!: Table<PendingXpGain>;
  resource_cache!: Table<ResourceCache>;
  attachment_blobs!: Table<AttachmentBlob>;
  behavior_signals!: Table<BehavioralSignal>;
  cached_patterns!: Table<CachedPattern>;

  constructor() {
    super("TablawyOfflineDB");
    this.version(9)
      .stores({
        lessons: "id, classId",
        quizzes: "++id, quizId, userId",
        notes: "id, lessonId, isSynced",
        mutations: "++id, resource, action",
        ai_history: "++id, userId, classId, timestamp",
        registration_drafts: "id, step",
        background_jobs: "id, type, status, createdAt",
        study_plans: "id",
        pending_xp: "++id",
        resource_cache: "key",
        attachment_blobs: "++id, resourceId",
        behavior_signals: "++id, userId, signalType, createdAt",
        cached_patterns: "id",
      })
      .upgrade((tx) => {
        // Version 9: Added cached_patterns
        return tx.table("cached_patterns").toCollection().count();
      });
  }

  /**
   * Queues a mutation for background sync.
   */
  async queue(mutation: Omit<PendingMutation, "createdAt">): Promise<number> {
    return await this.mutations.add({
      ...mutation,
      createdAt: Date.now(),
    } as PendingMutation);
  }

  /**
   * Resolves (removes) a mutation after successful sync.
   */
  async resolve(id: number): Promise<void> {
    return await this.mutations.delete(id);
  }

  /**
   * Gets all pending mutations.
   */
  async getPending(): Promise<PendingMutation[]> {
    return await this.mutations.toArray();
  }

  /**
   * Gets pending mutations for a specific resource/ID.
   */
  async getPendingById(
    resource: string,
    id: string | number
  ): Promise<PendingMutation | undefined> {
    const stringId = String(id);
    return await this.mutations
      .where("resource")
      .equals(resource)
      .filter((m) => String(m.variables?.id) === stringId)
      .first();
  }
}

export const offlineDB = new OfflineDB();
