import { create } from "zustand";
import {getLocalStorageItem , requestApi } from "@/services/authService";
import { toast } from "react-toastify";


/* ---------- HELPERS ---------- */
const url = new URL(window.location.href);
 const userInfo = getLocalStorageItem("user_info") || {};
 
 const getTenantId = (): string => {
   const tenantId = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

  if (!tenantId) throw new Error("Tenant ID not found");
  return tenantId;
};

interface SyncDataType {
  enable_all_meetings: boolean;
}

/* ---------- TYPES ---------- */
interface CalendarSyncState {
  SyncData: SyncDataType | null;
  SyncLoading: boolean;
  error: string | null;
  fetchCalendarSync: () => Promise<void>;
  SyncAllMeet: () => Promise<void>;
}

/* ---------- STORE ---------- */
const CalendarSyncStore = create<CalendarSyncState>((set, get) => ({
  SyncData: null,
  SyncLoading: false,
  error: null,

  fetchCalendarSync: async () => {
    set({ SyncLoading: true, error: null });
    try {
      const tenant_id = getTenantId();
      const response = await requestApi(
        "GET",
        `${tenant_id}/sync/settings`,
        {},
        "CalendarService"
      );

      set({
        SyncData: response?.data ?? null,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error fetching calendar sync data",
      });
    } finally {
      set({ SyncLoading: false });
    }
  },

  SyncAllMeet: async () => {
    set({ SyncLoading: true, error: null });

    try {
      const tenant_id = getTenantId();
      const { SyncData } = get();

      const payload = {
        //  TOGGLE VALUE
        enable_all_meeting: !SyncData?.enable_all_meetings,
      };

       await requestApi(
        "POST",
        `${tenant_id}/sync/settings`,
        payload,
        "CalendarService"
      );

      //  update UI immediately
      set({
        SyncData: {
          ...SyncData!,
          enable_all_meetings: payload.enable_all_meeting,
        },
      });

      toast.success( "Settings updated successfully");

    } catch (error) {
      toast.error(
      error instanceof Error
        ? error.message
        : "Failed to update calendar sync"
    );
    } finally {
      set({ SyncLoading: false });
    }
  },
}));

export default CalendarSyncStore;
