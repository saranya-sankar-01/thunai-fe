import { create } from "zustand";
import { UserDirectory } from "../types/UserDirectory";
import { errorHandler } from "../lib/utils";
import { requestApi, requestApiFromData } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { requestApiBlob } from "../services/authService";

interface UsersDirectoryStore {
  users: UserDirectory[];
  loading: boolean;
  filter: Record<string, string>[];
  setLoading: (loading: boolean) => void;
  setFilter: (filter: Record<string, string>[]) => void;
  loadDirectoryUsers: (filter: Record<string, string>[]) => Promise<void>;
  resetPagination: () => void;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  createDirectoryUser: (payload: Record<string, string>) => Promise<boolean>;
  updateDirectoryUser: (
    payload: Record<string, string>,
    id: string
  ) => Promise<boolean>;
  deleteUser: (id: string) => Promise<void>;
  loadingFile: boolean;
  setLoadingFile: (loadingFile: boolean) => void;
  uploadFile: (file: File) => Promise<Record<string, string>>;
  downloadingTemplate: boolean;
  setDownloadingTemplate: (downloadingTemplate: boolean) => void;
  downloadTemplate: () => Promise<void>;
}

export const useUsersDirectoryStore = create<UsersDirectoryStore>(
  (set, get) => ({
    users: [],
    loading: false,
    filter: [],
    loadingFile: false,
    downloadingTemplate: false,
    currentPage: 1,
    totalItems: 0,
    totalPages: 1,
    pageSize: 10,
    setLoading: (loading: boolean) => set({ loading }),
    setFilter: (filter: Record<string, string>[]) => set({ filter }),
    setCurrentPage: (currentPage: number) => {
      set({ currentPage });
      const { filter } = get();
      get().loadDirectoryUsers(filter);
    },
    resetPagination: () => set({ currentPage: 1 }),
    setLoadingFile: (loadingFile: boolean) => set({ loadingFile }),
    setDownloadingTemplate: (downloadingTemplate: boolean) =>
      set({ downloadingTemplate }),
    loadDirectoryUsers: async (filter: []) => {
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
          sort: "dsc",
        };
        const response = await requestApi(
          "POST",
          "directory/sync/user/list/",
          requestBody,
          "accountService"
        );
        const result = response.data.data;
        set({
          users: result.user_list,
          totalItems: result.total,
          totalPages: Math.ceil((result.total ?? 0) / 10),
          pageSize: 10,
        });
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ loading: false });
      }
    },

    createDirectoryUser: async (payload: Record<string, string>) => {
      try {
        set({ loading: true });
        const response = await requestApi(
          "POST",
          "directory/user/",
          payload,
          "accountService"
        );
        if (response.data.status !== "success") {
          throw new Error(response.data.message);
        }
        toast({
          variant: "success",
          title: "Success",
          description: "User Added Successfullly",
        });
        await get().loadDirectoryUsers([]);
        return true;
      } catch (error) {
        errorHandler(error);
        return false;
      } finally {
        set({ loading: false });
      }
    },

    updateDirectoryUser: async (
      payload: Record<string, string>,
      id: string
    ) => {
      try {
        set({ loading: true });
        const response = await requestApi(
          "PUT",
          `directory/user/${id}`,
          payload,
          "accountService"
        );
        if (response.data.status !== "success") {
          throw new Error(response.data.message);
        }
        toast({
          variant: "success",
          title: "Success",
          description: "User Updated Successfullly",
        });
        await get().loadDirectoryUsers([]);
        return true;
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ loading: false });
      }
    },

    deleteUser: async (id: string) => {
      try {
        set({ loading: true });
        const response = await requestApi(
          "DELETE",
          "directory/user/",
          { ids: [id] },
          "accountService"
        );
        if (response.data.status !== "success") {
          throw new Error(response.data.message);
        }
        await get().loadDirectoryUsers([]);
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ loading: false });
      }
    },

    uploadFile: async (file: File) => {
      try {
        set({ loadingFile: true });
        const formData = new FormData();
        if (file) {
          formData.append("file", file);
          const response = await requestApiFromData(
            "POST",
            "directory/bulk/user/",
            formData,
            "accountService"
          );
          if (response.data.status !== "success") {
            throw new Error(response.data.message);
          }
          return response.data;
        } else {
          toast({
            variant: "error",
            title: "Error",
            description: "Please select a file.",
          });
        }
      } catch (error) {
        errorHandler(error);
        return false;
      } finally {
        set({ loadingFile: false });
      }
    },

    downloadTemplate: async () => {
      try {
        set({ downloadingTemplate: true });
        const data = await requestApiBlob(
          "GET",
          "directory/bulk/user/",
          "accountService"
        );
        const url = window.URL.createObjectURL(data.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users.xls";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ downloadingTemplate: false });
      }
    },
  })
);
