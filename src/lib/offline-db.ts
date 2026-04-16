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
  action: "create" | "update" | "delete";
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

export class OfflineDB extends Dexie {
  lessons!: Table<CachedLesson>;
  quizzes!: Table<PendingQuizSubmission>;
  notes!: Table<UserNote>;
  mutations!: Table<PendingMutation>;
  ai_history!: Table<AiHistory>;

  constructor() {
    super("TablawyOfflineDB");
    this.version(1).stores({
      lessons: "id, classId",
      quizzes: "++id, quizId, userId",
      notes: "id, lessonId, isSynced",
      mutations: "++id, resource, action",
      ai_history: "++id, userId, classId, timestamp",
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
