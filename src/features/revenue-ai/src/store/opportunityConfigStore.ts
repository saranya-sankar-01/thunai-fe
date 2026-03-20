
import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { OpportunityConfig } from "../types/OpportunityConfig";
import { CustomField } from "../types/CustomField";
import { create } from "zustand";
import { toast } from "@/hooks/use-toast";

type LoadingState = {
    configLoading: boolean;
    sendingMessage: boolean;
    loadingFields: boolean;
    creatingField: boolean;
    editingField: boolean;
    deletingField: boolean;
}
type LoadingKey = keyof LoadingState;

type ModelResponse = {
    status: string;
    refined_string_response: string;
    refined_response: any;
    configuration_update: boolean;
};

type ChatMessage = {
    user?: string
    model?: ModelResponse;
}

interface OpportunityConfigStore {
    opportunityConfig: OpportunityConfig;
    chatMessages: ChatMessage[],
    customFields: CustomField[],
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    loadOpportunityConfig: () => Promise<void>;
    getChatHistory: () => Promise<void>;
    deleteChatHistory: () => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
    loadFields: () => Promise<void>;
    createField: (field: Record<string, any>) => Promise<boolean>;
    updateField: (field: Record<string, any>) => Promise<boolean>;
    deleteField: (key: string) => Promise<boolean>
}

export const useOpportunityConfigStore = create<OpportunityConfigStore>((set, get) => ({
    opportunityConfig: {} as OpportunityConfig,
    chatMessages: [],
    customFields: [],
    loading: {
        configLoading: false,
        sendingMessage: false,
        creatingField: false,
        editingField: false,
        loadingFields: false,
        deletingField: false
    },
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",

    loadOpportunityConfig: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("configLoading", true);
            const response = await requestApi("GET", `${tenantId}/opportunity-configuration/`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            set({
                opportunityConfig: response.data.data || {}
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("configLoading", false);
        }
    },

    getChatHistory: async () => {
        const { tenantId } = get();
        try {
            const response = await requestApi("GET", `${tenantId}/opppurtunity-chat/history/`, {}, "authService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            set({
                chatMessages: response.data.data || []
            })
        } catch (error) {
            errorHandler(error);
        }
    },

    deleteChatHistory: async () => {
        const { tenantId } = get();
        try {
            const response = await requestApi("DELETE", `${tenantId}/opppurtunity-chat/history/`, {}, "authService");

            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to delete chat history");
            }
            set({
                chatMessages: []
            })
        } catch (error) {
            errorHandler(error);
        }
    },

    sendMessage: async (message: string) => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("sendingMessage", true);
            set(state => ({
                chatMessages: [...state.chatMessages, { user: message }]
            }))
            const response = await requestApi("POST", `${tenantId}/airewrite_opportunity/contacts`, { chat_data: message }, "chatService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            const modelResponse = response.data.data.instructions;
            set(state => ({
                chatMessages: [...state.chatMessages, { model: modelResponse }]
            }))
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("sendingMessage", false);
        }
    },
    loadFields: async () => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("loadingFields", true);
            const response = await requestApi("GET", `${tenantId}/opportunity/custom-fields/`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message)
            }
            set({
                customFields: response.data.data.fields || []
            })
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("loadingFields", false);
        }
    },
    createField: async (payload: Record<string, any>) => {
        const { tenantId, setLoading, loadFields } = get()
        try {
            setLoading("creatingField", true);
            const response = await requestApi("POST", `${tenantId}/opportunity/custom-fields/`, { fields: [payload] }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to create field");
            }
            toast({
                title: "Success",
                description: "Custom field created successfully",
            })
            await loadFields();
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("creatingField", false);
        }
    },
    updateField: async (payload: Record<string, any>) => {
        const { tenantId, setLoading, loadFields } = get()
        try {
            setLoading("editingField", true);
            const response = await requestApi("PATCH", `${tenantId}/opportunity/custom-fields/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to update field");
            }
            toast({
                title: "Success",
                description: "Custom field updated successfully",
            })
            await loadFields();
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("editingField", false);
        }
    },

    deleteField: async (key: string) => {
        const { tenantId, loadFields, setLoading } = get();
        try {
            setLoading("deletingField", true);
            const response = await requestApi("DELETE", `${tenantId}/opportunity/custom-fields/`, { key }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to delete field");
            }
            toast({
                title: "Success",
                description: "Custom field deleted successfully",
            })
            await loadFields();
            return true;
        } catch (error) {
            errorHandler(error)
        } finally {
            setLoading("deletingField", false)
        }
    }
}))