// useAsanaService.js
import { create } from "zustand";
// import axios from "axios";
import { errorHandler, getUserInfo } from "../lib/utils";
import { UserInfo } from "../types/UserInfo";
import { getLocalStorageItem, requestApi } from "@/services/authService";

interface HelpscoutStore {
  listMail: any[];
  loading: boolean;
  userInfo: UserInfo;
  loadListmail: () => Promise<void>;
}

export const useHelpscoutService = create<HelpscoutStore>((set, get) => ({
  listMail: [],
  loading: false,
  userInfo: getLocalStorageItem("user_info"),
  setLoading: (loading: boolean) => set({ loading }),

  loadListmail: async () => {
    const { userInfo } = get();
    try {
      set({ loading: true });
      const payload = {
        tenantId: userInfo.default_tenant_id,
        userId: userInfo.profile.user_id,
        urlIdentifier: userInfo.urlidentifier,
      };

      const response = await requestApi(
        "POST",
        `/helpscout/listmail`,
        payload,
        "intService"
      );

      if (response.data.status !== "success" || response.status === "error") {
        throw new Error(response.data.message || response.message);
      }

      const result = response.data.data || [];

      set({ listMail: result });
    } catch (error) {
      console.error("Load Content Error:", error);
      errorHandler(error?.message || error || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },
}));
