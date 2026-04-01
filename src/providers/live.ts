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

    return {
      unsubscribe: () => {
        socketInstance.off(listenerName, onEvent);
      },
    };
  },
  unsubscribe: (subscription) => {
    if (subscription && typeof subscription.unsubscribe === "function") {
      subscription.unsubscribe();
    }
  },
  publish: (event) => {
    const listenerName = `live-event:${event.channel}`;
    socketInstance.emit("publish-live-event", event);
  },
});
