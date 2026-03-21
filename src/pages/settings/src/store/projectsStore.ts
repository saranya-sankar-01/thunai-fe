import { create } from "zustand";
import { requestApi } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { TenantItem } from "../types/TenantItem";
import { errorHandler } from "../lib/utils";

interface ProjectStore {
  tenants: TenantItem[];
  loading: boolean;
  filter: object;
  setFilter: (filter: object) => void;
  loadTenants: (filter: object, pageSize?: number) => Promise<void>;
  createTenant: (name: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  tenants: [],
  loading: false,
  filter: {},
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,
  setLoading: (loading: boolean) => set({ loading }),
  setFilter: (filter: object) => set({ filter }),
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    const { filter } = get();
    get().loadTenants(filter);
  },
  loadTenants: async (filter: object, pageSize = 10) => {
    const { currentPage } = get();
    try {
      set({ loading: true });
      const requestBody = {
        filter,
        page: {
          size: pageSize,
          page_number: currentPage,
        },
        sort: "dsc",
      };

      const response = await requestApi(
        "POST",
        "tenant/filter/",
        requestBody,
        "accountService"
      );

      const result = response.data;

      set({
        tenants: result.data,
        totalItems: result.total,
        totalPages: Math.ceil((result.total ?? 0) / pageSize),
        pageSize,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  createTenant: async (name: string) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "POST",
        "tenant/",
        { name },
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "Tenant Created Successfullly",
      });
      await get().loadTenants([
        { key_name: "name", key_value: "", operator: "like" },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      set({ loading: false });
    }
  },
}));
