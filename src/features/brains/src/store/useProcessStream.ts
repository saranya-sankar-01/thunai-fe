import { create } from 'zustand';
import { requestStreamApi } from "@/services/authService";
import { ExplorerStreamType } from "@/types/ExplorerStreamType";

interface ProcessEventsState {
  processes: ExplorerStreamType[];
  loading: boolean;
  fetchProcesses: (tenantID: string | null) => Promise<void>;
}
interface StreamLiveState {
  streamsData: any;
  isLoading: boolean;
  fetchLiveStream: (tenantID: string | null) => Promise<void>;
}

export const useProcessStream = create<ProcessEventsState>((set) => ({
  processes: [],
  loading: false,

  fetchProcesses: async (tenantID) => {
    if (!tenantID) return;

    set({ loading: true });
    try {
      await requestStreamApi(
        "GET",
        `brain/process-streams/${tenantID}/stream/process-events`,
        null,
        "brainService",
        (res) => {
          if (!res) {
            console.warn("Empty SSE data received");
            return;
          }

          const rawArray: ExplorerStreamType[] = Object.values(res) as ExplorerStreamType[];
          set({ processes: rawArray, loading: false });
        }
      );
    } catch (err) {
      console.error("Error fetching process status:", err);
      set({ loading: false });
    }
  },
}));


export const useStreamLiveStore = create<StreamLiveState>((set) => ({
  streamsData: null,
  isLoading: false,

  fetchLiveStream: async (tenantID) => {
    if (!tenantID) return;

    set({ isLoading: true });

    try {
      await requestStreamApi(
        "GET",
        `brain/streams/${tenantID}/live`,
        null,
        "brainService",
        (response) => {
          const eventData = response?.payload?.event_data || {};
          const removeHtmlTags = (str: string) =>
              str.replace(/<\/?[^>]+(>|$)/g, "");

          if (eventData){
            const cleanedData = Object.fromEntries(
              Object.entries(eventData).map(([key, value]) => [
                key,
                typeof value === "string"
                  ? removeHtmlTags(value)
                  : value,
              ])
            );

            set({
              streamsData: cleanedData,
              isLoading: false,
            });
          } else {
            set({ streamsData: null, isLoading: false });
          }
        }
      );
    } catch (error) {
      console.error("Failed to fetch live stream data:", error);
      set({ isLoading: false });
    }
  },
}));

