import { create } from "zustand";
import { apiBlobRequest } from "@/services/authService";
interface DocumentState {
  loadingId: string | null;
  viewDocument: (tenantID: string, id: string) => Promise<void>;
}

export const useDocumentViewStore = create<DocumentState>((set) => ({
  loadingId: null,

  viewDocument: async (tenantID, id) => {
    set({ loadingId: id });

    try {
      const blob = await apiBlobRequest({
        service: "brainService",
        endpoint: `brain/view/${tenantID}/${id}/`,
        method: "GET",
      });

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing document:", error);
    } finally {
      set({ loadingId: null });
    }
  },
}));
