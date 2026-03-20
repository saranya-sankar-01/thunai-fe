import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";

type LoadingState = {
    loadingActivityStatus: boolean;
    creatingActivityStatus: boolean;
    deletingActivityStatus: boolean;
}
type LoadingKey = keyof LoadingState;

interface ActivityStatusStore {
    activityStatus: string[];
    loading: LoadingState;
    tenantId: string;
    setLoading: (key: LoadingKey, value: boolean) => void;
    loadActivityStatus: () => void;
    createActivityStatus: (payload: string[]) => void;
    deleteActivityStatus: (payload: string) => void;
}

export const useActivityStatusStore = create<ActivityStatusStore>((set, get) => ({
    activityStatus: [],
    loading: {
        loadingActivityStatus: false,
        creatingActivityStatus: false,
        deletingActivityStatus: false,
    },
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    loadActivityStatus: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("loadingActivityStatus", true);
            const response = await requestApi("GET", `${tenantId}/activity/masters/`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({
                activityStatus: response.data.data.keys || []
            })
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("loadingActivityStatus", false)
        }
    },

    createActivityStatus: async (payload: string[]) => {
        const { setLoading, tenantId, loadActivityStatus } = get();
        try {
            setLoading("creatingActivityStatus", true);
            const response = await requestApi("POST", `${tenantId}/activity/masters/`, { keys: payload }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: payload[0] + " Added to activity statuses."
            })
            loadActivityStatus();
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("creatingActivityStatus", false)
        }
    },

    deleteActivityStatus: async (payload: string) => {
        const { setLoading, tenantId, loadActivityStatus } = get();
        try {
            setLoading("deletingActivityStatus", true);
            const response = await requestApi("DELETE", `${tenantId}/activity/masters/?key=${payload}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: 'Status Removed', description: `"${payload}" removed from activity statuses.` });
            loadActivityStatus();
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("deletingActivityStatus", false)
        }
    },

}));