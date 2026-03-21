// import axios from "axios";
import { create } from "zustand";
import type { CategoryItem } from "@/types/CategoryItem";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { toast } from "sonner";

interface CategoryStore {
  categories: CategoryItem[];
  tenantId: string;
  loading: boolean;
  loadFiles: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
  loading: false,

  setLoading: (loading: boolean) => set({ loading }),

  loadFiles: async () => {
    const { tenantId } = get();
    try {
      set({ loading: true });
      const response = await requestApi(
        "GET",
        `${tenantId}/oauth2/app/configure/category/`,
        {},
        "authService"
      );

      if (response.status === "error") {
        throw new Error(response.message);
      }
      const result: CategoryItem[] = response.data.data.categories || [];

      set({
        categories: result,
      });
    } catch (error: any) {
      console.error("Load Content Error:", error);
      toast.error(error.message || error || "Failed to Load");
    } finally {
      set({ loading: false });
    }
  },
}));
