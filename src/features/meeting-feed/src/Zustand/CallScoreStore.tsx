import { create } from "zustand";
import {getLocalStorageItem, requestApi } from "../Service/MeetingService";


const url = new URL(window.location.href);
 const userInfo = getLocalStorageItem("user_info") || {};
  // const tenant_id = userInfo?.default_tenant_id;

const getTenantId = (): string => {
  // const tenantId =
  // url.searchParams.get("tenant_id") ||
  // localStorage.getItem("tenant_id");
  const tenantId =userInfo?.default_tenant_id ||url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id")
  
  if (!tenantId) throw new Error("Tenant ID not found");
  return tenantId;
};

interface SettingsData {
  tenant_id: string;
  created: string; 
  ignore_duration: boolean;
  min_audio_duration: string;
  updated: string; 
  enable_call_score: boolean;
  enable_metrics_dashboard: boolean;
}
interface ShareDatas {
  id: string;
  share_enabled: boolean;
  share_to: string;
  tenant_id: string;
}

interface CallScoreState {
  diarizationData: any;
  SharedMeetData: ShareDatas | null;
  diarizationEnabled: boolean;
  DiariLoading: boolean;
  SettingData:SettingsData | null;
  error: string | null;

  FetchDiarization: () => Promise<void>;
  EnableDiarization: (value: boolean) => Promise<any>;

  FetchMeetingShare: () => Promise<void>;
  FetchMetricDashboard: () => Promise<void>;
}



const CallScoreStore = create<CallScoreState>((set) => ({

  diarizationData: null,
  SharedMeetData:null,
  SettingData:null,
  diarizationEnabled: false,
  DiariLoading: false,
  error: null,

  //  FETCH STATUS
  FetchDiarization: async () => {
    set({ DiariLoading: true, error: null });
    try {
      const tenant_id = getTenantId();
      const response = await requestApi(
        "GET",
        `${tenant_id}/settings/preference/`,
        {},
        "accountService"
      );

     const diarize = response?.data?.diarize;

    set({
      diarizationData: response?.data,
      diarizationEnabled: diarize, 
    });
    } catch (error: any) {
      set({ error: error?.message || "Failed to fetch diarization" });
    } finally {
      set({ DiariLoading: false });
    }
  },

  // ENABLE / DISABLE
  EnableDiarization: async (value: boolean) => {
    set({ DiariLoading: true, error: null });

    try {
    const tenant_id = getTenantId();

    const res = await requestApi(
      "POST",
      `${tenant_id}/settings/preference/`,
      { diarize: value },
      "accountService"
    );

    set({ diarizationEnabled: value });

    return res;
  } catch (error: any) {
    set({ error: error?.message || "Update failed" });
    throw error; 
  } finally {
    set({ DiariLoading: false });
  }
  },

  FetchMeetingShare: async ()=>{
    set({DiariLoading:true, error:null});
    try{
      const tenant_id= getTenantId();
      const response =await requestApi(
        "GET",
        `${tenant_id}/meeting/share/`,
        {},
        "authService"
      )
      set({ SharedMeetData:response?.data ?? null})
      
    }catch (error) {
      set({
        error:
        error instanceof Error
            ? error.message
            : "Error fetching SharedMeet Data",
      });
    } finally {
      set({ DiariLoading: false });
    }
  }, 
  FetchMetricDashboard: async () => {
    set({ DiariLoading: true, error: null });
    try {
      const tenant_id = getTenantId();
      const response = await requestApi(
        "GET",
        `${tenant_id}/call/metrics/settings/`,
        null,
        "authService"
      );
      const settingVal = response?.data?.settings ?? null;
      set({ 
        SettingData: settingVal,
      });
      
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error fetching Setting Data",
      });
    } finally {
      set({ DiariLoading: false });
    }
  }
}));

export default CallScoreStore;
