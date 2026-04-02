import Dexie, { type Table } from "dexie";
import { Message } from "@/types/ai";

export interface OfflineMutation {
  id?: number;
  resource: string;
  action: "create" | "update" | "delete";
  variables: unknown;
  meta?: Record<string, unknown>;
  timestamp: number;
}

export interface AIChatCache {
  id?: number;
  userId: string;
  classId: string; // 'general' or number
  messages: Message[];
  timestamp: number;
}

/**
 * 📦 Offline Outbox & Cache Database
 * Stores mission-critical mutations and performance-sensitive AI cache.
 */
export class OfflineDB extends Dexie {
  outbox!: Table<OfflineMutation>;
  ai_history!: Table<AIChatCache>;

  constructor() {
    super("ClassroomOfflineDB");
    this.version(2).stores({
      outbox: "++id, resource, action, timestamp",
      ai_history: "++id, [userId+classId], timestamp",
    });
  }

  /**
   * Adds a mutation to the outbox for background synchronization.
   */
  async queue(mutation: Omit<OfflineMutation, "id" | "timestamp">): Promise<number> {
    return await this.outbox.add({
      ...mutation,
      timestamp: Date.now(),
    });
  }

  /**
   * Retrieves all pending mutations ordered by timestamp.
   */
  async getPending(): Promise<OfflineMutation[]> {
    return await this.outbox.orderBy("timestamp").toArray();
  }

  /**
   * Checks if a specific ID for a resource has a pending mutation.
   */
  async getPendingById(
    resource: string,
    id: string | number
  ): Promise<OfflineMutation | undefined> {
    const allPending = await this.getPending();
    return allPending.find((m) => {
      const vars = m.variables as { id?: string | number };
      return m.resource === resource && String(vars.id) === String(id);
    });
  }

  /**
   * Removes a processed mutation from the outbox.
   */
  async resolve(id: number): Promise<void> {
    return await this.outbox.delete(id);
  }
}

export const offlineDB = new OfflineDB();
