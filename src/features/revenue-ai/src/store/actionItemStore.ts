import { toast } from "@/hooks/use-toast";
import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { ActionItem } from "../types/ActionItem";
import { create } from "zustand";

type LoadingState = {
    actionItemsLoading: boolean;
    actionItemStatusUpdating: boolean;
    actionItemUserAssigning: boolean;
    addingComment: boolean;
    deletingActionItem: boolean;
}
type LoadingKey = keyof LoadingState;

interface ActionItemStore {
    actionItems: ActionItem[];
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    loadActionItems: (filter: Record<string, string>[], email: string) => Promise<void>;
    updateActionItemStatus: (actionItem: ActionItem, status: string) => Promise<void>;
    assignUserToActionItem: (actionItem: ActionItem, userId: string) => Promise<void>;
    addCommentToActionItem: (payload: Record<string, string>) => Promise<void>;
    deleteActionItem: (payload: Record<string, string>) => Promise<void>;
}

export const useActionItemStore = create<ActionItemStore>((set, get) => ({
    actionItems: [],
    loading: {
        actionItemsLoading: false,
        actionItemStatusUpdating: false,
        actionItemUserAssigning: false,
        addingComment: false,
        deletingActionItem: false,
    },
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    loadActionItems: async (filter: Record<string, string>[], email: string) => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("actionItemsLoading", true);
            const requestBody = {
                email,
                filter,
                page: {
                    size: 10,
                    page_number: 1
                },
                sort: "desc",
                type: "opportunities",
            }
            const response = await requestApi("POST", `${tenantId}/opportunity/filter/action-items/`, requestBody, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            const result = response.data.data;
            set({
                actionItems: result.data || []
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("actionItemsLoading", false);
        }
    },

    updateActionItemStatus: async (actionItem: ActionItem, status: string) => {
        const { setLoading, tenantId, loadActionItems } = get();
        try {
            setLoading("actionItemUserAssigning", true);

            const payload = {
                source_from: actionItem.source_from,
                reference_id: actionItem.reference_id, // Replace with actual actionItem ID field
                action_item: actionItem.action_item,
                responsible_user_id: actionItem.responsible_user_id,
                deadline: actionItem.deadline || actionItem.Deadline,
                action_status: status
            }
            const response = await requestApi("PATCH", `${tenantId}/opportunity/action-items/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "Your action item status has been updated.",
            });
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("actionItemUserAssigning", false);
        }
    },

    assignUserToActionItem: async (actionItem: ActionItem, userId: string) => {
        const { setLoading, tenantId, loadActionItems } = get();
        try {
            setLoading("actionItemUserAssigning", true);

            const payload = {
                source_from: actionItem.source_from,
                reference_id: actionItem.reference_id, // Replace with actual actionItem ID field
                action_item: actionItem.action_item,
                responsible_user_id: userId,
                deadline: actionItem.deadline || actionItem.Deadline,
                action_status: actionItem.status
            }
            const response = await requestApi("PATCH", `${tenantId}/opportunity/action-items/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "User has been assigned to the action item.",
            });
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("actionItemUserAssigning", false);
        }
    },

    addCommentToActionItem: async (payload: Record<string, string>) => {
        const { setLoading, tenantId, loadActionItems } = get();
        try {
            setLoading("addingComment", true);
            const response = await requestApi("PATCH", `${tenantId}/opportunity/action-items/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Comment added",
                description: "Your comment has been added to the action item.",
            });
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("addingComment", false);
        }
    },

    deleteActionItem: async (payload: Record<string, string>) => {
        const { tenantId, setLoading, loadActionItems } = get();
        try {
            setLoading("deletingActionItem", true)
            const response = await requestApi("DELETE", `${tenantId}/opportunity/action-items/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Action item deleted",
                description: "The action item has been removed successfully.",
            });
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("deletingActionItem", false)
        }
    }
}))