import { create } from "zustand";
import {getLocalStorageItem, requestApi } from "../Service/MeetingService";

/* ---------- HELPERS ---------- */

const url = new URL(window.location.href);
 const userInfo = getLocalStorageItem("user_info") || {};
  // const tenant_id = userInfo?.default_tenant_id;

const getTenantId = (): string => {
  const tenantId =userInfo?.default_tenant_id ||url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

  if (!tenantId) {
    throw new Error("Tenant ID not found");
  }

  return tenantId;
};

/* ---------- TYPES ---------- */

interface PeriodicApiState {
  Periodic: any[];
  PeriodicPlateForm: any[];
  MeetingFileProcesser: any[];
  PeriodicLoading: boolean;
  MeetLoading: boolean;
  deleteLoading: boolean;
  error: string | null;

  fetchPeriodicData: () => Promise<void>;
  FetchPlatForm: () => Promise<void>;
  FetchFileProcesser: () => Promise<void>;
  DeleteFileProcesser: (id: string) => Promise<{
  success: boolean;
  message?: string;
}>;

}

/* ---------- STORE ---------- */

const PeriodicApiStore = create<PeriodicApiState>((set) => ({
  Periodic: [],
  PeriodicPlateForm: [],
  MeetingFileProcesser: [],
  PeriodicLoading: false,
  MeetLoading: false,
  deleteLoading: false,
  error: null,

  /* ---------- FETCH PERIODIC ---------- */
  fetchPeriodicData: async () => {
    set({ PeriodicLoading: true, error: null });

    try {
      const tenant_id = getTenantId();

      const payload = {
        filter: [],
        page: { size: 50, page_number: 1 },
        sort: "asc",
        sortby: "created",
      };

      const response = await requestApi(
        "POST",
        `${tenant_id}/salesenablement/periodic/filter/`,
        payload,
        "authService"
      );

      // set({ Periodic: response?.data?.data || [] });
      set({ Periodic: response?.data || { data: [] } });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error fetching periodic data",
      });
    } finally {
      set({ PeriodicLoading: false });
    }
  },

  /* ---------- FETCH PLATFORM ---------- */
  FetchPlatForm: async () => {
    set({ PeriodicLoading: true, error: null });

    try {
      const tenant_id = getTenantId();

      const payload = {
        filter: [],
        page: { size: 50, page_number: 1 },
        sort: "asc",
        sortby: "created",
      };

      const response = await requestApi(
        "POST",
        `${tenant_id}/oauth2/app/connected/filter/`,
        payload,
        "authService"
      );

      set({ PeriodicPlateForm: response?.data?.data || [] });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error fetching platform data",
      });
    } finally {
      set({ PeriodicLoading: false });
    }
  },

  /* ---------- FETCH FILE PROCESSER ---------- */
  FetchFileProcesser: async () => {
    set({ MeetLoading: true, error: null });

    try {
      const tenant_id = getTenantId();
      
      const payload = {
        filter: [
          {
            key_name: "added_type",
            key_value: [
              "user",
              "periodic_sync",
              "recording",
              "ai-bot",
              "research",
              "meet-record",
              "teams-record",
              "zoom-record",
              "webex-record",
            ],
            operator: "in",
          },
          {
            key_name: "status",
            key_value: ["queued"],
            operator: "notin",
          },
        ],
        page: { size: 1000, page_number: 1 },
        sort: "desc",
        sortby: "created",
      };
      
      const response = await requestApi(
        "POST",
        `${tenant_id}/salesenablement/alerts/`,
        payload,
        "authService"
      );

      set({ MeetingFileProcesser: response?.data?.data || [] });
    } catch (error) {
      set({
        error:
        error instanceof Error
        ? error.message
        : "Error fetching processing files",
      });
    } finally {
      set({ MeetLoading: false });
    }
  },
  
  DeleteFileProcesser: async (id: string) => {
  set({ deleteLoading: true, error: null });

  try {
    const tenant_id = getTenantId();
    const payload = {
      id,
      option:"unique",
    };

    const response = await requestApi(
      "POST",
      `${tenant_id}/salesenablement/clear/`,
      payload,
      "authService"
    );

    // Remove from UI immediately
    set((state) => ({
      MeetingFileProcesser: state.MeetingFileProcesser.filter(
        (item) => item.id !== id
      ),
    }));

    return response
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: "Delete failed" };
  } finally {
    set({ deleteLoading: false });
  }
},


}));

export default PeriodicApiStore;
