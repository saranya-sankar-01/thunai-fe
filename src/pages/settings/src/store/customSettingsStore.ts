import { toast } from "@/hooks/use-toast";
import { errorHandler } from "../lib/utils";
import { requestApi, requestApiBlob } from "../services/authService";
import { CustomCloudStorage } from "../types/CustomCloudStorage";
import { create } from "zustand";

type LoadingState = {
    connectDatabase: boolean;
    connectFileUpload: boolean;
    dataPooling: boolean;
    getForwardRule: boolean;
};

type LoadingKey = keyof LoadingState;

interface CustomSettingsStore {
    loading: LoadingState;
    activeTab: 'Database Configuration' | 'Cloud Storage';
    connectDatabaseStep: 'PREFIX' | 'DATABASE' | 'DATAPOOLING';
    databaseData: any;
    cloudStorageData: CustomCloudStorage | null;
    forwardRuleData: any;

    setLoading: (key: LoadingKey, value: boolean) => void;
    setActiveTab: (tab: 'Database Configuration' | 'Cloud Storage') => void;
    setConnectDatabaseStep: (step: 'PREFIX' | 'DATABASE' | 'DATAPOOLING') => void;

    getDatabaseList: (tenantId: string) => Promise<void>;
    getCloudStorageList: (tenantId: string) => Promise<void>;
    getForwardRule: (tenantId: string) => Promise<any>;
    submitForwardRule: (tenantId: string, payload: any) => Promise<any>;
    saveDatabaseConfig: (tenantId: string, payload: any) => Promise<any>;
    saveCloudStorageConfig: (tenantId: string, payload: any) => Promise<any>;
    pollForwardRule: (tenantId: string, prefix: string) => Promise<any>;
    downloadForwardJson: (path: string) => Promise<Blob | null>;
}

export const useCustomSettingsStore = create<CustomSettingsStore>((set, get) => ({
    loading: {
        connectDatabase: false,
        connectFileUpload: false,
        dataPooling: false,
        getForwardRule: false,
    },
    activeTab: 'Database Configuration',
    connectDatabaseStep: 'PREFIX',
    databaseData: null,
    cloudStorageData: null,
    forwardRuleData: null,

    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),

    setActiveTab: (activeTab) => set({ activeTab }),
    setConnectDatabaseStep: (connectDatabaseStep) => set({ connectDatabaseStep }),

    getDatabaseList: async (tenantId) => {
        try {
            const response = await requestApi("GET", `${tenantId}/custom-database/`, {}, "accountService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({ databaseData: response.data.data });
        } catch (error) {
            errorHandler(error);
        }
    },

    getCloudStorageList: async (tenantId) => {
        try {
            const response = await requestApi("GET", `${tenantId}/custom-cloud-storage/`, {}, "accountService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({ cloudStorageData: response.data.data });
        } catch (error) {
            errorHandler(error);
        }
    },

    getForwardRule: async (tenantId) => {
        const { setLoading } = get();
        try {
            setLoading("getForwardRule", true);
            const response = await requestApi("GET", `${tenantId}/forward-rule-manager/`, {}, "authService");
            if (response.data.status === "success") {
                set({ forwardRuleData: response.data.message });
                return response.data.message;
            }
        } catch (error) {
            // Silent error as it's often a 404/not found initially
            errorHandler(error);
        } finally {
            setLoading("getForwardRule", false);
        }
        return null;
    },

    submitForwardRule: async (tenantId, payload) => {
        const { setLoading } = get();
        try {
            setLoading("dataPooling", true);
            const response = await requestApi("POST", `${tenantId}/forward-rule-manager/`, payload, "authService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                variant: "success",
                title: "Success",
                description: "Forward Rule Saved Successfully!",
            });
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("dataPooling", false);
        }
    },

    saveDatabaseConfig: async (tenantId, payload) => {
        const { setLoading } = get();
        try {
            setLoading("connectDatabase", true);
            const response = await requestApi("POST", `${tenantId}/custom-database/`, payload, "accountService");
            return response.data;
        } catch (error) {
            errorHandler(error);
            return { status: "error" };
        } finally {
            setLoading("connectDatabase", false);
        }
    },

    saveCloudStorageConfig: async (tenantId, payload) => {
        const { setLoading } = get();
        try {
            setLoading("connectFileUpload", true);
            const response = await requestApi("POST", `${tenantId}/custom-cloud-storage/`, payload, "accountService");
            return response.data;
        } catch (error) {
            errorHandler(error);
            return { status: "error" };
        } finally {
            setLoading("connectFileUpload", false);
        }
    },

    pollForwardRule: async (tenantId, prefix) => {
        try {
            const response = await requestApi("GET", `${tenantId}/forward-rule-manager/polling/?prefix=${prefix}`, {}, "authService");
            return response.data;
        } catch (error) {
            return { status: "error" };
        }
    },

    downloadForwardJson: async (path) => {
        try {
            const encodedPath = encodeURIComponent(path);
            const response = await requestApiBlob("GET", `cloud/storage/file/?path=${encodedPath}&option=download`, "documentService");
            return response.data;
        } catch (error) {
            errorHandler(error);
            return null;
        }
    },
}));
