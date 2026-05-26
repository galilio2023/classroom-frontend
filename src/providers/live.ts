import { LiveProvider, LiveEvent } from "@refinedev/core";
import { socket } from "../lib/socket";

export const liveProvider = (socketInstance: typeof socket): LiveProvider => ({
  subscribe: ({ channel, types, params, callback }) => {
    const onEvent = (event: LiveEvent) => {
      if (types.includes("*") || types.includes(event.type)) {
        if (params?.ids) {
          const eventId = String(event.payload?.id);
          if (params.ids.map(String).includes(eventId)) {
            callback(event);
          }
        } else {
          callback(event);
        }
      }
    };

    const listenerName = `live-event:${channel}`;
    socketInstance.on(listenerName, onEvent);

    // 🚀 UNIFIED SYNC: Inform backend we want to listen to this channel (joined room)
    socketInstance.emit("subscribe", { channel });

    return {
      unsubscribe: () => {
        socketInstance.off(listenerName, onEvent);
        socketInstance.emit("unsubscribe", { channel });
      },
    };
  },
  unsubscribe: (subscription) => {
    if (subscription && typeof subscription.unsubscribe === "function") {
      subscription.unsubscribe();
    }
  },
  publish: (event) => {
    socketInstance.emit("publish-live-event", event);
  },
});
