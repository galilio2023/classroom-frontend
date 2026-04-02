// 🛡️ Tablawy OS - Whiteboard Utilities
// Dynamic import wrapper for Excalidraw helpers to avoid bundling/race conditions.

type ExportToBlobFn = typeof import("@excalidraw/excalidraw").exportToBlob;

let cachedExportToBlob: ExportToBlobFn | null = null;

/**
 * Singleton-like loader for Excalidraw's exportToBlob helper.
 * Ensures the module is only loaded once and returns the cached reference.
 */
export async function getExportToBlob(): Promise<ExportToBlobFn> {
  if (cachedExportToBlob) return cachedExportToBlob;

  try {
    const module = await import("@excalidraw/excalidraw");
    cachedExportToBlob = module.exportToBlob;
    return cachedExportToBlob;
  } catch (err) {
    console.error("❌ Failed to load Excalidraw helpers:", err);
    throw err;
  }
}
