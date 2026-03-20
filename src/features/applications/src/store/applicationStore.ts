// import axios from "axios";
import { create } from "zustand";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { ApplicationItem } from "@/types/ApplicationItem";
import { toast } from "sonner";

interface ApplicationStore {
  applications: ApplicationItem[];
  tenantId: string;
  loading: boolean;
  loadFiles: (filters: any[], page?: number, size?: number) => Promise<void>;
  disconnectApp: (
    appData: ApplicationItem,
    action?: string,
    index?: number,
    appType?: string
  ) => Promise<void>;
  setLoading: (loading: boolean) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
  loading: false,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,

  setLoading: (loading: boolean) => set({ loading }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  loadFiles: async (filters: any[], page = 1, size = 50) => {
    const { tenantId } = get();
    try {
      set({ loading: true });
      const requestBody = {
        filter: filters,
        page: {
          size: size,
          page_number: page,
        },
        sort: "asc",
        sortby: "name",
      };

      const response = await requestApi(
        "POST",
        `${tenantId}/oauth2/app/connected/filter/`,
        requestBody,
        "authService"
      );

      if (response.status === "error") {
        throw new Error(response.message);
      }

      const result: ApplicationItem[] = response.data.data.data || [];
      const total = response.data.data.total;
      const totalPages = Math.ceil(total / size);

      set({
        applications: result,
        currentPage: page,
        totalPages,
        totalItems: total,
        pageSize: size,
      });
    } catch (error: any) {
      console.error("Load Content Error:", error.message);
      toast.error(error?.message || error || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },

  disconnectApp: async (
    appData: ApplicationItem,
    action?: string,
    index?: number,
    appType?: string
  ) => {
    const tenantId = localStorage.getItem("tenant_id");
    try {
      set({ loading: true });
      const {
        oauth_flow,
        admin_configure_enable,
        application_id,
        action_application_id,
        name,
        oauth_application_id,
        multiple_account,
      } = appData;
      const oauth2 = `${tenantId}/oauth2/app/configure/?id=${
        admin_configure_enable ? application_id : action_application_id
      }`;

      const delink = `${tenantId}/${name}/delink/account?id=${
        multiple_account ? appData.application_ids[index] : oauth_application_id
      }`;

      let method: Promise<any> | null;

      if (name === "salesforce" && action === "DISCONNECT_OAUTH") {
        method = await requestApi("GET", delink, {}, "oauthServiceUri");
        toast.success("Disconnected Salesforce OAuth successfully");
        await get().loadFiles(
          [{ key_name: "name", key_value: name, operator: "==" }],
          1,
          get().pageSize
        );
        return;
      }

      if (oauth_flow && action !== "DELINK_PARTICULAR_ACC") {
        if (multiple_account) {
          method = await requestApi("DELETE", oauth2, {}, "authService");
        } else {
          if (name !== "salesforce") {
            method = await requestApi("GET", delink, {}, "oauthServiceUri");
          }
        }
      } else if (action === "DELINK_PARTICULAR_ACC") {
        method = await requestApi("GET", delink, {}, "oauthServiceUri");
      } else {
        method = await requestApi("DELETE", oauth2, {}, "authService");
      }

      if (method) {
        await method;
        toast.success("Application disconnected successfully");
        await get().loadFiles(
          [{ key_name: "name", key_value: name, operator: "==" }],
          get().currentPage,
          get().pageSize
        );
      }

      if (oauth_flow && !multiple_account && appType === "DYNAMIC_APP") {
        const appId = admin_configure_enable
          ? application_id
          : action_application_id;

        if (appId) {
          await requestApi("DELETE", oauth2, {}, "authService");
        }
      }
    } catch (err: any) {
      console.error("App Disconnect Error:", err);
      toast.error(err?.response?.data?.message || "Failed to disconnect");
    } finally {
      set({ loading: false });
    }
  },
}));
