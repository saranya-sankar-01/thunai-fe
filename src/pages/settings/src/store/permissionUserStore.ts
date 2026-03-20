import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { PermissionUser } from "../types/PermissionUser";
import { create } from "zustand";

interface PermissionUserStore {
  permissionUsers: PermissionUser[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  filter: Record<string, string>[];
  setFilter: (filter: Record<string, string>[]) => void;
  loadPermissionUsers: (filter: object) => Promise<void>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  openRequest: (payload: PermissionUser) => Promise<void>;
  approveRejectUser: (
    payload: Record<string, string>,
    operation: string
  ) => Promise<boolean>;
}

export const usePermissionUserStore = create<PermissionUserStore>(
  (set, get) => ({
    permissionUsers: [],
    loading: false,
    filter: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,

    setLoading: (loading: boolean) => set({ loading }),
    setFilter: (filter: []) => set({ filter }),
    setCurrentPage: (currentPage: number) => {
      set({ currentPage });
      const { filter } = get();
      get().loadPermissionUsers(filter);
    },
    loadPermissionUsers: async (filter: []) => {
      const { currentPage } = get();
      set({ filter });
      try {
        set({ loading: true });
        const requestBody = {
          filter,
          page: {
            size: 10,
            page_number: currentPage,
          },
          sort: "asc",
          sortby: "created",
        };
        const response = await requestApi(
          "POST",
          "user/requested/permissions/",
          requestBody,
          "authService"
        );
        const result = response.data.data;
        set({
          permissionUsers: result.data,
          totalItems: result.overall_total,
          totalPages: Math.ceil((result.overall_total ?? 0) / 10),
          pageSize: 10,
        });
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ loading: false });
      }
    },

    openRequest: async (payload: PermissionUser) => {
      console.log(payload);
      try {
        set({ loading: true });
        const requestBody = {
          query: {
            email: payload.email,
            source: payload.source,
          },
        };
        const response = await requestApi(
          "POST",
          "directory/sync/user/list/",
          requestBody,
          "accountService"
        );
        if (response.data.status !== "success") {
          throw new Error(response.data.message);
        }
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ loading: false });
      }
    },

    approveRejectUser: async (
      payload: Record<string, string>,
      operator: string
    ) => {
      try {
        set({ loading: true });
        if (operator === "approve") {
          const response = await requestApi(
            "POST",
            "approve/request/permission/",
            payload,
            "authService"
          );
          if (response.data.status !== "success") {
            throw new Error(response.data.message);
          }
        } else {
          const response = await requestApi(
            "POST",
            "reject/request/permission/",
            payload,
            "authService"
          );
          if (response.data.status !== "success") {
            throw new Error(response.data.message);
          }
        }
        get().loadPermissionUsers([])
        return true;
      } catch (error) {
        errorHandler(error);
        return false
      } finally {
        set({ loading: false });
      }
    },
  })
);
