import { create } from "zustand";
import { ListItem } from "@/types/ListItem";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { toast } from "sonner";

interface ListStore {
  list: ListItem | null;
  tenantId: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  loadFiles: () => Promise<void>;
}

export const useListStore = create<ListStore>((set, get) => ({
  list: null,
  tenantId: getLocalStorageItem("user_info"),
  loading: false,

  setLoading: (loading: boolean) => set({ loading }),

  loadFiles: async () => {
    const { tenantId } = get();
    try {
      set({ loading: true });
      const response = await requestApi(
        "GET",
        `${tenantId}/mcp/app/list`,
        {},
        "trackService"
      );

      if (response.status === "error") {
        throw new Error(response.message);
      }
      const result: ListItem = response.data.data || null;

      set({ list: result });
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
