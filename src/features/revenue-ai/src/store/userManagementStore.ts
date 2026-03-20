import { errorHandler } from "../lib/utils";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { User } from "../types/User";
import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";

type LoadingState = {
    usersLoading: boolean;
    creatingUser: boolean;
    updatingUser: boolean;
    deletingUser: boolean;
}
type LoadingKey = keyof LoadingState;

interface UserManagementStore {
    users: User[];
    loading: LoadingState;
    setLoading: (key: LoadingKey, value: boolean) => void;
    tenantId: string;
    loadUsers: () => Promise<void>;
    createUser: (values: Record<string, any>) => Promise<boolean>
    updateUser: (values: Record<string, any>) => Promise<boolean>
    deleteUser: (email: User) => Promise<boolean>
}

export const useUserManagementStore = create<UserManagementStore>((set, get) => ({
    users: [],
    loading: {
        usersLoading: false,
        creatingUser: false,
        updatingUser: false,
        deletingUser: false,
    },
    setLoading: (key, value) =>
        set((state) => ({
            loading: {
                ...state.loading,
                [key]: value,
            },
        })),
    tenantId: getLocalStorageItem("user_info")?.default_tenant_id || localStorage.getItem("tenant_id") || "",
    loadUsers: async () => {
        const { setLoading, tenantId } = get();
        try {
            setLoading("usersLoading", true);
            const response = await requestApi("GET", `${tenantId}/user-management/user/`, {}, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            set({
                users: response.data.data || []
            })
        } catch (error) {
            errorHandler(error);
        } finally {
            setLoading("usersLoading", false);
        }
    },

    createUser: async (values: Record<string, any>) => {
        const { setLoading, tenantId, loadUsers } = get();
        try {
            setLoading("creatingUser", true);
            const response = await requestApi("POST", `${tenantId}/user-management/user/`, values, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "User created successfully",
            })
            await loadUsers();
            return true;
        } catch (error) {
            errorHandler(error)
            return false;
        } finally {
            setLoading("creatingUser", false);
        }
    },

    updateUser: async (payload: Record<string, any>) => {
        const { setLoading, tenantId, loadUsers } = get();
        try {
            setLoading("updatingUser", true);
            const response = await requestApi("PUT", `${tenantId}/user-management/user/`, payload, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "User updated successfully",
            })
            await loadUsers();
            return true;

        } catch (error) {
            errorHandler(error)
            return false;
        } finally {
            setLoading("updatingUser", false);
        }
    },

    deleteUser: async (user: User) => {
        const { setLoading, tenantId, loadUsers } = get();
        try {
            setLoading("deletingUser", true);
            const response = await requestApi("DELETE", `${tenantId}/user-management/user/`, { email: user.email }, "revService");
            if (response.data.status !== "success") {
                throw new Error(response.data.message);
            }
            toast({
                title: "Success",
                description: "User deleted successfully",
            })
            await loadUsers();
            return true;
        } catch (error) {
            errorHandler(error)
            return false;
        } finally {
            setLoading("deletingUser", false);
        }
    },
}))
