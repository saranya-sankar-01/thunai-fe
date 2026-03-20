import { getTenantId, getUserId, requestApi } from "../services/workflow";
import { create } from "zustand";

interface ZohoAccount {
  Account_Name: string;
  id: string;
}

interface ZohoState {
  accounts: ZohoAccount[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  fetchStages: () => Promise<void>;
  stages: any[];
  stagesLoading:boolean;
}
const tenant_id = getTenantId();
const user_id = getUserId();
export const useZohoStore = create<ZohoState>((set) => ({
  accounts: [],
  loading: false,
  error: null,
stages: [],
stagesLoading:false,
  fetchAccounts: async () => {
    set({ loading: true, error: null });

    try {
      const payload = {
        tenantId: tenant_id,
        userId: user_id,
      }
      const response = await requestApi(
        "POST",
        "zoho/accounts-list",
        payload,
        "intService"
      );

      set({
        accounts: response?.data.data,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to fetch accounts",
        loading: false,
      });
    }
  },
    fetchStages: async () => {
    set({ stagesLoading: true, error: null });

    try {
      const payload = {
        tenantId: tenant_id,
        userId: user_id,
      }
      const response = await requestApi(
        "POST",
        "zoho/stages-list",
        payload,
        "intService"
      );

      set({
        stages: response?.data,
        stagesLoading: false,
      });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to fetch accounts",
        stagesLoading: false,
      });
    }
  },
}));
