import { create } from "zustand";
import { ConfigureItem } from "@/types/ConfigureItem";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { toast } from "sonner";

interface ConfigureStore {
  configureItem: ConfigureItem | null;
  tenantId: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  loadFiles: (id: string) => Promise<void>;
}

export const useConfigureStore = create<ConfigureStore>((set, get) => ({
  configureItem: null,
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),

  loadFiles: async (id) => {
    const { tenantId } = get();
    try {
      set({ loading: true });

      const response = await requestApi(
        "GET",
        `/${tenantId}/oauth2/app/configure/?id=${id}`,
        {},
        "authService"
      );

      if (response.status === "error") {
        throw new Error(response.message);
      }

      const result = response.data.data || null;
      set({
        configureItem: result,
      });
    } catch (error: any) {
      console.error("Load Content Error:", error);
      toast.error(error.message || error || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
