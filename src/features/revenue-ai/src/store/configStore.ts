import { toast } from "@/hooks/use-toast";
import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { Config } from "../types/Config";
import { CustomField } from "../types/CustomField";
import { create } from "zustand";

type LoadingState = {
    settingConfig: boolean;
    configLoading: boolean;
    loadingCustomFields: boolean;
    creatingCustomField: boolean;
    editingCustomField: boolean;
    deletingCustomField: boolean;
}
type LoadingKey = keyof LoadingState;

interface ConfigStore {
    config: Config;
    customFields: CustomField[];
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    loadConfig: () => Promise<void>;
    settingConfiguration: (payload: Record<string, any>) => Promise<void>
    loadCustomFields: () => Promise<void>;
    createCustomField: (payload: Record<string, any>) => Promise<boolean>;
    editCustomField: (payload: Record<string, any>) => Promise<boolean>;
    deleteCustomField: (key: string) => Promise<void>;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
    config: {} as Config,
    customFields: [],
    loading: {
        settingConfig: false,
        configLoading: false,
        loadingCustomFields: false,
        creatingCustomField: false,
        editingCustomField: false,
        deletingCustomField: false,
    },
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    loadConfig: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("configLoading", true);
            const response = await requestApi("GET", `${tenantId}/contact/settings/`, {}, "accountService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({
                config: response.data.data || {}
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("configLoading", false);
        }
    },

    settingConfiguration: async (payload: Record<string, any>) => {
        const { setLoading, tenantId, loadConfig } = get();
        try {
            setLoading("settingConfig", true);
            const response = await requestApi("POST", `${tenantId}/contact/settings/`, payload, "accountService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                variant: "default",
                title: "Success",
                description: "Currency selected successfully",
            })
            await loadConfig();
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("settingConfig", false);
        }
    },
    loadCustomFields: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("loadingCustomFields", true);
            const response = await requestApi("GET", `${tenantId}/contacts/custom-fields/`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({
                customFields: response.data.data.fields || []
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("loadingCustomFields", false);
        }
    },
    createCustomField: async (payload: Record<string, any>) => {
        const { setLoading, tenantId, loadCustomFields } = get();
        try {
            setLoading("creatingCustomField", true);
            const response = await requestApi("POST", `${tenantId}/contacts/custom-fields/`, { fields: [payload] }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "Custom field created successfully",
            })
            await loadCustomFields();
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("creatingCustomField", false);
        }
    },
    editCustomField: async (payload: Record<string, any>) => {
        const { setLoading, tenantId, loadCustomFields } = get();
        try {
            setLoading("editingCustomField", true);
            const response = await requestApi("PATCH", `${tenantId}/contacts/custom-fields/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "Custom field edited successfully",
            })
            await loadCustomFields();
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("editingCustomField", false);
        }
    },
    deleteCustomField: async (key: string) => {
        const { setLoading, tenantId, loadCustomFields } = get();
        try {
            setLoading("deletingCustomField", true);
            const response = await requestApi("DELETE", `${tenantId}/contacts/custom-fields/`, { key }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "Custom field deleted successfully",
            })
            await loadCustomFields();
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("deletingCustomField", false);
        }
    }
}))