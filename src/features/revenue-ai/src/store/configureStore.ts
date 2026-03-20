import { create } from "zustand";
import { ConfigureItem } from "../types/ConfigureItem";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { errorHandler } from "../lib/utils";

interface ConfigureStore {
  configureItem: ConfigureItem | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  tenantId: string;
  loadFiles: (id: string) => Promise<void>;
}

export const useConfigureStore = create<ConfigureStore>((set, get) => ({
  configureItem: null,
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",

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
        throw new Error(response.message)
      }

      const result = response.data.data || null;
      set({
        configureItem: result,
      });
    } catch (error: any) {
      errorHandler(error.message || error || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
