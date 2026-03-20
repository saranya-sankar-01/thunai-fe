import { create } from "zustand"
import { Contact, EngagementType } from "../types/Contact";
import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi, requestApiFromData } from "@/services/authService";
import { Activity } from "../types/Activity";
import { ActionItem } from "../types/ActionItem";
import { AssigneeUser } from "../types/AssigneeUser";
import { toast } from "@/hooks/use-toast";

type LoadingState = {
    contactsLoading: boolean;
    contactCreating: boolean;
    contactsBulkUploading: boolean;
    downloadingTemplate: boolean;
    contactUpdating: boolean;
    contactDeleting: boolean;
    updateActivityVisibilityLoading: boolean;
    opportunityLoading: boolean;
    assigneeUsersLoading: boolean;
    sendingPrompt: boolean;
}

type LoadingKey = keyof LoadingState;

type ChatMessage = {
    user?: string
    model?: string;
}

interface ContactStore {
    contacts: Contact[];
    engagement: EngagementType;
    assigneeUsers: AssigneeUser[];
    bulkuploadColumns: Record<string, any>;
    aiChatHistory: ChatMessage[];
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    resetPagination: () => void;
    setCurrentPage: (page: number) => void;
    loadContacts: (filter: Record<string, string>[], query: string) => Promise<void>;
    createContact: (contact: Record<string, any>) => Promise<boolean>;
    bulkUploadContacts: (file: File) => Promise<boolean>;
    downloadBulkUploadTemplate: () => Promise<void>;
    updateContact: (payload: Record<string, any>) => Promise<boolean>;
    deleteContact: (contactId: string) => Promise<boolean>;
    loadAssigneeUsers: (filter: Record<string, string>[]) => Promise<void>;
    getAiChatHistory: (email: string) => Promise<void>;
    sendPromptToAi: (payload: Record<string, string>) => Promise<void>;
    deleteAiChatHistory: (email: string) => Promise<void>;
}

export const useContactStore = create<ContactStore>((set, get) => ({
    contacts: [],
    engagement: {
        high_engagement: 0,
        low_engagement: 0,
    },
    assigneeUsers: [],
    bulkuploadColumns: {},
    aiChatHistory: [],
    loading: {
        contactsLoading: false,
        contactCreating: false,
        contactsBulkUploading: false,
        downloadingTemplate: false,
        contactUpdating: false,
        contactDeleting: false,
        activitiesLoading: false,
        updateActivityVisibilityLoading: false,
        opportunityLoading: false,
        assigneeUsersLoading: false,
        sendingPrompt: false,
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
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
        //   const { filter } = get();
        get().loadContacts([], "");
    },

    resetPagination: () => set({ currentPage: 1 }),

    loadContacts: async (filter: Record<string, string>[], query: string) => {
        const { currentPage, tenantId, setLoading } = get();
        try {
            setLoading("contactsLoading", true);
            const requestBody = {
                filter,
                ...(query && { q: query }),
                page: {
                    size: 10,
                    page_number: currentPage
                },
                sort: "asc",
                sortby: "email"
            };

            const response = await requestApi("POST", `${tenantId}/contacts/filter/`, requestBody, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            const result = response.data.data;
            set({
                contacts: result.data || [],
                engagement: {
                    high_engagement: result.high_engagement,
                    low_engagement: result.low_engagement,
                } as EngagementType,
                currentPage: result.page_number,
                totalPages: Math.ceil(result.total / 10),
                totalItems: result.total,
                pageSize: 10,
            })

        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("contactsLoading", false);
        }
    },

    createContact: async (payload: Record<string, any>) => {
        const { tenantId, setLoading, loadContacts } = get();
        try {
            setLoading("contactCreating", true);
            const response = await requestApi("POST", `${tenantId}/add/crm/contacts/`, { ...payload, crm_name: "thunai" }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: "Success", description: "Contact created successfully" })
            loadContacts([], "");
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("contactCreating", false);
        }
    },

    bulkUploadContacts: async (file: File) => {
        const { tenantId, setLoading, loadContacts } = get();
        try {
            setLoading("contactsBulkUploading", true);
            const formData = new FormData();
            if (file) {
                console.log(file);
                formData.append("file", file);
                const response = await requestApiFromData("POST", `${tenantId}/add/crm/contacts/bulk-upload/`, formData, "revService");
                if (response.data.status !== "success") {
                    throw new Error(response.data.message);
                }
                toast({ title: "Success", description: response.data.message || "Contacts uploaded successfully" })
            }
            loadContacts([], "");
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("contactsBulkUploading", false);
        }
    },

    downloadBulkUploadTemplate: async () => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("downloadingTemplate", true);
            const response = await requestApi("GET", `${tenantId}/add/crm/contacts/bulk-upload/`, {}, "revService");
            const result = response.data.data;
            console.log(result, "COLUMN");
            const headers = result.columns.map((col: { key: string; description?: string }) =>
                col.description ? `${col.key} (${col.description})` : col.key
            );
            const csvContent = headers.join(",");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "contacts.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("downloadingTemplate", false);
        }
    },

    updateContact: async (payload: Record<string, any>) => {
        const { tenantId, setLoading, loadContacts } = get();
        try {
            setLoading("contactUpdating", true);
            const response = await requestApi("PATCH", `${tenantId}/add/crm/contacts/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: "Success", description: "Contact updated successfully" })
            loadContacts([], "");
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("contactUpdating", false);
        }
    },

    deleteContact: async (contactId: string) => {
        const { tenantId, setLoading, loadContacts } = get();
        try {
            setLoading("contactDeleting", true);
            const response = await requestApi("DELETE", `${tenantId}/add/crm/contacts/?id=${contactId}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({ title: "Success", description: "Contact deleted successfully" })
            loadContacts([], "");
            return true;
        } catch (error) {
            errorHandler(error);
            return false;
        } finally {
            setLoading("contactDeleting", false);
        }
    },

    loadAssigneeUsers: async (filter: Record<string, string>[]) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("assigneeUsersLoading", true);
            const requestBody = {
                filter,
                page: {
                    size: 1000,
                    page_number: 1
                },
                sort: "desc",
            }
            const response = await requestApi("POST", `${tenantId}/users/`, requestBody, "accountService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            const result = response.data.data;
            set({
                assigneeUsers: result.data || []
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("assigneeUsersLoading", false);
        }
    },

    getAiChatHistory: async (email: string) => {
        const { tenantId } = get();
        try {
            const response = await requestApi("GET", `${tenantId}/ai/assistant/chat/history/?contact_email=${email}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            const rawData = response.data.data || [];
            const formattedData = rawData.map(message => {
                if (message.role === 'user') return { user: message.content }
                else return { model: message.content }
            })
            set({
                aiChatHistory: formattedData
            })
        } catch (error) {
            errorHandler(error);
        }
    },

    sendPromptToAi: async (payload: Record<string, string>) => {
        const { tenantId, setLoading } = get();
        try {
            setLoading("sendingPrompt", true);
            const response = await requestApi("POST", `${tenantId}/aiassistant/`, payload, "chatService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            const result = response.data.data;
            set(state => ({
                aiChatHistory: [...state.aiChatHistory, { user: payload.chat_data }, { model: result }]
            }))
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("sendingPrompt", false);
        }
    },

    deleteAiChatHistory: async (email: string) => {
        const { tenantId } = get();
        try {
            const response = await requestApi("DELETE", `${tenantId}/ai/assistant/chat/history/?contact_email=${email}`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message || "Failed to delete chat history");
            }
            set({
                aiChatHistory: []
            })
        } catch (error) {
            errorHandler(error);
        }
    },
}))