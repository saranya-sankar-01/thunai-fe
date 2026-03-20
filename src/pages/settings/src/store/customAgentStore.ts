import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import { errorHandler } from "../lib/utils";
import { FormValues } from "../pages/CustomAgent";
import { requestApi } from "@/services/authService";
import { CommonWidget } from "../types/CommonWidget";
import { CustomDomain } from "../types/CustomDomain";

interface CustomAgentStore {
  commonWidgets: CommonWidget[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  customDomains: CustomDomain[];
  domainLoading: boolean;
  setDomainLoading: (domainLoading: boolean) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  tenantId: string;
  loadCommonWidgets: () => Promise<void>;
  loadCustomDomains: () => Promise<void>;
  createCustomDomain: (payload: FormValues) => Promise<boolean>;
  updateCustomDomain: (payload: FormValues) => Promise<boolean>;
  deleteCustomDomain: (uniqueUserName: string) => Promise<void>;
}

export const useCustomAgentStore = create<CustomAgentStore>((set, get) => ({
  commonWidgets: [],
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  customDomains: [],
  domainLoading: false,
  setDomainLoading: (domainLoading: boolean) => set({ domainLoading }),
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,

  tenantId: localStorage.getItem("tenant_id"),

  loadCommonWidgets: async () => {
    const { currentPage, tenantId } = get();
    try {
      set({ loading: true });
      const requestBody = {
        filter: [],
        page: {
          size: 50,
          page_number: currentPage,
        },
        sort: "desc",
        sortby: "created",
      };
      const response = await requestApi(
        "POST",
        `${tenantId}/common/widget/filter/`,
        requestBody,
        "authService"
      );
      const result = response.data.data;

      set({
        commonWidgets: result.data,
        totalItems: result.overall_total,
        totalPages: Math.ceil(result.overall_total ?? 0 / 50),
        pageSize: 50,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  loadCustomDomains: async () => {
    const { tenantId } = get();
    try {
      set({ domainLoading: true });
      const requestBody = {
        tenantId,
        urlIdentifier: "entrans",
      };

      const response = await requestApi(
        "POST",
        "customDomain/sharelink/detail",
        requestBody,
        "intService"
      );
      const result = response.data.data || [];
      set({
        customDomains: result,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ domainLoading: false });
    }
  },

  createCustomDomain: async (payload: FormValues) => {
    const { tenantId } = get();
    try {
      set({ domainLoading: true });
      const requestBody = {
        ...payload,
        urlIdentifier: "entrans",
        tenantId,
      };
      const response = await requestApi(
        "POST",
        "customDomain/sharelink/create-widget",
        requestBody,
        "intService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "Widget Saved Successfullly",
      });
      await get().loadCustomDomains();
      return true;
    } catch (error) {
      errorHandler(error);
      return false;
    } finally {
      set({ domainLoading: false });
    }
  },

  updateCustomDomain: async (payload: FormValues) => {
    const { tenantId } = get();
    try {
      set({ domainLoading: true });
      const requestBody = {
        ...payload,
        urlIdentifier: "entrans",
        tenantId,
      };
      const response = await requestApi(
        "PATCH",
        "customDomain/sharelink/edit-widget",
        requestBody,
        "intService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "Widget updated Successfully!",
      });
      await get().loadCustomDomains();
      return true;
    } catch (error) {
      errorHandler(error);
      return false;
    } finally {
      set({ domainLoading: false });
    }
  },

  deleteCustomDomain: async (uniqueUserName: string) => {
    try {
      set({ domainLoading: true });
      const response = await requestApi(
        "DELETE",
        `customDomain/sharelink/delete-widget/?uniquerUserName=${uniqueUserName}`,
        {},
        "intService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "Widget deleted Successfully!",
      });
      await get().loadCustomDomains();
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ domainLoading: false });
    }
  },
}));
