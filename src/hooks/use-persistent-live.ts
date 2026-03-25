import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Global State for Persistent Live Sessions.
 * This allows the teacher's video to survive navigation across ANY page in the app.
 * PERSISTED: State survives page refresh (F5).
 */
interface PersistentLiveState {
  activeClassId: string | null;
  isJoined: boolean;
  isAiDelegated: boolean;
  isSpeaking: boolean;
  promotionTrailer: {
      url: string | null;
      teacherName: string | null;
      headline: string | null;
  };
  activeVideo: {
      url: string | null;
      title: string | null;
  };
  setActiveClassId: (id: string | null) => void;
  setIsJoined: (val: boolean) => void;
  setIsAiDelegated: (val: boolean) => void;
  setIsSpeaking: (val: boolean) => void;
  setPromotionTrailer: (url: string | null, teacherName?: string | null, headline?: string | null) => void;
  setActiveVideo: (url: string | null, title?: string | null) => void;
  stopSpeaking: () => void;
  reset: () => void;
}

export const usePersistentLive = create<PersistentLiveState>()(
  persist(
    (set) => ({
      activeClassId: null,
      isJoined: false,
      isAiDelegated: false,
      isSpeaking: false,
      promotionTrailer: {
          url: null,
          teacherName: null,
          headline: null
      },
      activeVideo: {
          url: null,
          title: null
      },
      setActiveClassId: (id: string | null) => {
          // If switching classes, reset joined state to prevent leakage
          set((state) => ({ 
              activeClassId: id,
              isJoined: id === state.activeClassId ? state.isJoined : false,
              isAiDelegated: id === state.activeClassId ? state.isAiDelegated : false
          }));
      },
      setIsJoined: (val: boolean) => set({ isJoined: val }),
      setIsAiDelegated: (val: boolean) => set({ isAiDelegated: val }),
      setIsSpeaking: (val: boolean) => set({ isSpeaking: val }),
      setPromotionTrailer: (url: string | null, teacherName: string | null = null, headline: string | null = null) => set({ 
          promotionTrailer: { url, teacherName, headline } 
      }),
      setActiveVideo: (url: string | null, title: string | null = null) => set({ 
          activeVideo: { url, title } 
      }),
      stopSpeaking: () => {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              set({ isSpeaking: false });
          }
      },
      reset: () => {
          if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
          }
          set({ 
              activeClassId: null, 
              isJoined: false, 
              isAiDelegated: false,
              isSpeaking: false,
              promotionTrailer: { url: null, teacherName: null, headline: null },
              activeVideo: { url: null, title: null }
          });
      },
    }),
    {
      name: 'tablawy-live-session', // Key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);


