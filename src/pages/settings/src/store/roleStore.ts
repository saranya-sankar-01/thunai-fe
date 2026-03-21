import { create } from "zustand";
import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { Roles } from "../types/Roles";
import { RolePermissions } from "../types/RolePermissions";
import { toast } from "@/hooks/use-toast";

interface RoleStore {
  roles: Roles;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  loadRoles: (query: string) => Promise<void>;

  rolePermissions: RolePermissions;
  permissionLoading: boolean;
  setPermissionLoading: (permissionLoading: boolean) => void;
  loadRolePermissions: () => Promise<void>;
  saveRole: (payload: any, method: string) => Promise<void>;
  creatingRole: boolean;
  setCreatingRole: (creatingRole: boolean) => void;
  deleteRole: (roleName: string) => Promise<void>;
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: {
    id: "",
    urlidentifier: "",
    role_mapping: {},
    created: "",
    updated: "",
  },
  roleQuery: "",
  loading: false,
  creatingRole: false,
  rolePermissions: {
    permissions: {},
    role_mapping: {},
  },
  permissionLoading: false,

  setLoading: (loading: boolean) => set({ loading }),
  setCreatingRole: (creatingRole: boolean) => set({ creatingRole }),
  setPermissionLoading: (permissionLoading: boolean) =>
    set({ permissionLoading }),

  loadRoles: async (query) => {
    try {
      set({ loading: true });
      const requestBody = {
        filter: [],
        ...(query && { q: query }),
        page: {
          size: 10,
          page_number: 1,
        },
        sort: "dsc",
      };
      const response = await requestApi(
        "POST",
        "roles/filter/",
        requestBody,
        "accountService"
      );

      const result = response.data.data[0];

      set({
        roles: result,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  loadRolePermissions: async () => {
    try {
      set({ permissionLoading: true });
      const response = await requestApi("GET", "roles/", {}, "accountService");
      const result = response.data.data;
      set({ rolePermissions: result });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ permissionLoading: false });
    }
  },

  saveRole: async (payload, method) => {
    try {
      set({ creatingRole: true });
      const response = await requestApi(
        "POST",
        "roles/",
        payload,
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      if (method === "edit" && response.data.status === "success") {
        toast({
          description: `Role updated successfully`,
          variant: "success",
        });
      } else if (method === "create" && response.data.status === "success") {
        toast({
          description: `Role created successfully`,
          variant: "success",
        });
      }
      set({ creatingRole: false });
      await get().loadRoles("");
    } catch (error) {
      errorHandler(error);
    } finally {
      console.log("finally");
      set({ creatingRole: false });
    }
  },

  deleteRole: async (roleName) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "DELETE",
        `roles/?role=${roleName}`,
        {},
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      await get().loadRoles("");
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },
}));
