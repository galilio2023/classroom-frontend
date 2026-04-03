/**
 * 🚀 PERFORMANCE: Centralized monitoring utility for Tablawy OS.
 * Uses the User Timing API to track heavy operations.
 */

export const perf = {
  start: (name: string) => {
    performance.mark(`${name}-start`);
  },

  end: (name: string) => {
    performance.mark(`${name}-end`);
    try {
      const measure = performance.measure(name, `${name}-start`, `${name}-end`);

      // 🛡️ PRODUCTION LOGGING: In a real app, send this to Sentry/Datadog
      if (measure.duration > 100) {
        console.warn(`[Perf] 🐢 ${name} took ${measure.duration.toFixed(2)}ms`);
      } else {
        console.log(`[Perf] ⚡ ${name} took ${measure.duration.toFixed(2)}ms`);
      }
    } catch (e) {
      // Ignore if marks are missing
    }
  },

  /**
   * Track React render cycles (Development only or sampled in production)
   */
  trackRender: (componentName: string) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Render] ${componentName} rendered at ${performance.now().toFixed(2)}ms`);
    }
  },
};
