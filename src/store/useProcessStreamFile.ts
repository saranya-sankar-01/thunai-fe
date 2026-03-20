import { create } from 'zustand';
import { requestStreamApi } from "@/services/authService";

interface ProcessStatusState {
  processingFilesData: any[];
  totalProcessingFiles: number;
  isLoading: boolean;
  fetchStatus: (tenantID: string | null) => Promise<void>;
}

export const useProcessStreamFile = create<ProcessStatusState>((set) => ({
  processingFilesData: [],
  totalProcessingFiles: 0,
  isLoading: false,

  fetchStatus: async (tenantID) => {
    if (!tenantID) return;

    set({ isLoading: true });
    try {
      const payload = {
        filter: [],
        page: {
          size: 10,
          page_number: 1,
        },
        sort: "desc",
        sortby: "updated",
      };

      await requestStreamApi(
        "POST",
        `brain/knowledge-base-alerts/stream/${tenantID}/`,
        payload,
        "brainService",
        (data) => {
          set({
            processingFilesData: data.data || [],
            totalProcessingFiles: data.is_processing || 0,
            isLoading: false
          });
        }
      );
    } catch (error) {
      console.error("Error fetching processing status:", error);
      set({ isLoading: false });
    }
  },
}));
