import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { Activity } from "../types/Activity";
import { create } from "zustand";

type LoadingState = {
    activitiesLoading: boolean;
    deletingActivity: boolean;
}

type LoadingKey = keyof LoadingState;

interface ActivityStore {
    activities: Activity[];
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    loadActivities: (filter: Record<string, string>[], email: string) => Promise<void>;
    deleteActivity: (id: string) => Promise<void>;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
    activities: [],
    loading: {
        activitiesLoading: false,
        deletingActivity: false,
    },
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    loadActivities: async (filter: Record<string, string>[], email: string) => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("activitiesLoading", true);
            const requestBody = {
                email,
                filter,
                page: {
                    size: 50,
                    page_number: 1
                },
                sort: "desc",
                sortby: "created",
                type: "activity"
            }

            const response = await requestApi("PUT", `${tenantId}/opportunity/`, requestBody, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            const result = response.data.data;
            set({
                activities: result.data || []
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("activitiesLoading", false);
        }
    },
    deleteActivity: async (id: string) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("deletingActivity", true);
            const response = await requestApi("DELETE", `${tenantId}/activity/manual/?activity_id=${id}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("deletingActivity", false);
        }
    }
}))