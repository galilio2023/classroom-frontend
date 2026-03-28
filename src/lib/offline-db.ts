import Dexie, { type Table } from "dexie";

export interface OfflineMutation {
  id?: number;
  resource: string;
  action: "create" | "update" | "delete";
  variables: any;
  meta?: any;
  timestamp: number;
}

export interface AIChatCache {
  id?: number;
  userId: string;
  classId: string; // 'general' or number
  messages: any[];
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
  async queue(mutation: Omit<OfflineMutation, "id" | "timestamp">) {
    return await this.outbox.add({
      ...mutation,
      timestamp: Date.now(),
    });
  }

  /**
   * Retrieves all pending mutations ordered by timestamp.
   */
  async getPending() {
    return await this.outbox.orderBy("timestamp").toArray();
  }

  /**
   * Removes a processed mutation from the outbox.
   */
  async resolve(id: number) {
    return await this.outbox.delete(id);
  }
}

export const offlineDB = new OfflineDB();
