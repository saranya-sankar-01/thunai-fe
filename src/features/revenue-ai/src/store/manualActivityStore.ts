import { create } from "zustand";
import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { ManualActivity } from "../types/ManualActivity";
import { toast } from "@/components/ui/use-toast";

type LoadingState = {
    loadingActivities: boolean;
    creatingActivity: boolean;
    linkingOpportunityToActivity: boolean;
}

type LoadingKey = keyof LoadingState;

interface ManualActivityStore {
    manualActivities: ManualActivity[];
    loading: LoadingState;
    tenantId: string;
    setLoading: (key: LoadingKey, value: boolean) => void;
    loadManualActivities: () => Promise<void>;
    createManualActivity: (payload: Record<string, unknown>) => Promise<boolean>;
    linkOpportunityToActivity: (payload: Record<string, unknown>) => Promise<void>;
}

export const useManualActivityStore = create<ManualActivityStore>((set, get) => ({
    manualActivities: [],
    loading: {
        loadingActivities: false,
        creatingActivity: false,
        linkingOpportunityToActivity: false,
    },
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    loadManualActivities: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("loadingActivities", true);
            const response = await requestApi("GET", `${tenantId}/activity/masters/`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({
                manualActivities: response.data.data || []
            })
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("loadingActivities", false)
        }
    },

    linkOpportunityToActivity: async (payload: Record<string, unknown>) => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("linkingOpportunityToActivity", true);
            const response = await requestApi("POST", `${tenantId}/activity/manual/link-opportunity/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "New Opportunity Added for this activity successfully."
            })
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("linkingOpportunityToActivity", false)
        }
    },

    createManualActivity: async (payload: Record<string, unknown>) => {
        const { setLoading, tenantId, loadManualActivities, linkOpportunityToActivity } = get();
        try {
            setLoading("creatingActivity", true);
            const response = await requestApi("POST", `${tenantId}/activity/manual/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "New Activity Added successfully."
            })
            if (payload.opportunity_id) {
                linkOpportunityToActivity({
                    activity_id: response.data.data.id,
                    opportunity_id: payload.opportunity_id
                });
            }
            loadManualActivities();
            return true;
        } catch (error) {
            errorHandler(error)
            return false;
        } finally {
            setLoading("creatingActivity", false)
        }
    }
}));