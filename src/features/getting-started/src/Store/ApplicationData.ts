import { create } from "zustand";
import {getLocalStorageItem, requestApi } from "@/services/authService";

interface Application {
    id: string;
    name?: string;
    display_name?: string;
    logo?: string;
    description?: string;
    [key: string]: any;
}

interface ApplicationType {
    ApplicationList: Application[];
    SelectedApps: Application[];
    toggleSelectedApp: (app: Application) => void;
    fetchApplications: () => Promise<void>;
    isAppSelected: (appId: string) => (state: ApplicationType) => boolean;
    isLoading: boolean;
    error: unknown | null;
}

const url = new URL(window.location.href);
 const userInfo = getLocalStorageItem("user_info") || {};

const getTenantId = (): string => {
  const tenantId =  userInfo?.default_tenant_id || url.searchParams.get("tenant_id") ||
    localStorage.getItem("tenant_id");

  if (!tenantId) throw new Error("Tenant ID not found");
  return tenantId;
};

const ApplicationData = create<ApplicationType>((set)=>({
    ApplicationList:[],
    SelectedApps: [],
    isLoading: false,
    error:null,

    fetchApplications: async () => {
        set({ isLoading: true, error: null });
        const payload={
            page:{size:50,page_number:1},
            sort:"asc",
            sortby:"created",
            filter:[]
        }
        try {
            const tenantId = getTenantId();
            const response = await requestApi(
                "POST",
                `${tenantId}/oauth2/app/connected/filter/`,
                payload,
                "authService"
            );
            // console.log("Fetched Applications:==>", response);
            set({ ApplicationList: response.data.data, isLoading: false });
        } catch (err: unknown) {
            set({ error: err, isLoading: false });
        }
    },
    toggleSelectedApp: (app: Application) => {
        set((state) => {
            const isSelected = state.SelectedApps.some((a) => a.id === app.id);
            if (isSelected) {
                return {
                    SelectedApps: state.SelectedApps.filter((a) => a.id !== app.id)
                };
            } else {
                return {
                    SelectedApps: [...state.SelectedApps, app]
                };
            }
        });
    },
    isAppSelected: (appId: string) => {
        return (state: ApplicationType) => state.SelectedApps.some((a) => a.id === appId);
    }

}))

export default ApplicationData;
