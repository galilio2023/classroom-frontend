import Dexie, { type Table } from "dexie";

export interface OfflineMutation {
  id?: number;
  resource: string;
  action: "create" | "update" | "delete";
  variables: any;
  meta?: any;
  timestamp: number;
}

/**
 * 📦 Offline Outbox Database
 * Stores mission-critical mutations that failed due to network issues.
 */
export class OfflineDB extends Dexie {
  outbox!: Table<OfflineMutation>;

  constructor() {
    super("ClassroomOfflineDB");
    this.version(1).stores({
      outbox: "++id, resource, action, timestamp",
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
