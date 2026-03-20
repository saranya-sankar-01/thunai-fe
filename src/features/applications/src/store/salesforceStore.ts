import { create } from "zustand";
import { getLocalStorageItem, requestApi } from "@/services/authService";
import { SalesforceCommonAgentItem } from "@/types/SalesforceCommonAgentItem";
import { toast } from "sonner";

interface SalesforceStore {
  selectedWidgetId: string | null;
  licenseValue: boolean;
  licenseKey: string;
  copied: boolean;
  commonAgentsList: SalesforceCommonAgentItem[];
  loading: boolean;
  tenantId: string;
  getSalesforceConfig: () => Promise<void>;
  getCommonWidgets: (
    filters: any,
    page?: number,
    size?: number
  ) => Promise<void>;
  toggleLicense: () => Promise<void>;
  widgetOnChange: (widgetId: string | null) => Promise<void>;
  copyLicenseKey: () => void;
}

export const useSalesforceService = create<SalesforceStore>((set, get) => ({
  selectedWidgetId: "",
  licenseValue: false,
  licenseKey: "",
  copied: false,
  commonAgentsList: [],

  loading: false,
  tenantId: getLocalStorageItem("user_info")?.default_tenant_id || "",
  setLoading: (loading: boolean) => set({ loading }),
  getSalesforceConfig: async () => {
    const { tenantId } = get();
    try {
      set({ loading: true });
      const response = await requestApi(
        "GET",
        `/${tenantId}/get/salesforce/config/`,
        {},
        "authService"
      );
      if (response.status === "error") {
        throw new Error(response.message);
      }
      const result = response.data?.data;
      set({
        selectedWidgetId: result.widget_id || "",
        licenseValue: result.is_license || false,
        licenseKey: result.license_key || "",
      });
    } catch (error) {
      console.error("Load Content Error:", error);
      toast.error(error?.message || "Failed to load");
    } finally {
      set({ loading: false });
    }
  },

  getCommonWidgets: async (filters: any[], page = 1, size = 50) => {
    const { tenantId } = get();
    try {
      set({ loading: true });
      const payload = {
        filter: filters,
        page: {
          size: size,
          page_number: page,
        },
        sort: "desc",
        soryBy: "created",
      };

      const response = await requestApi(
        "POST",
        `/${tenantId}/common/widget/filter/`,
        payload,
        "authService"
      );

      if (response.status === "error") {
        throw new Error(response.message);
      }

      const result = response?.data?.data.data || [];

      set({ commonAgentsList: result });
    } catch (error) {
      console.error("Load Content Error:", error);
      toast.error(error?.message || "Failed to load common widgets");
    } finally {
      set({ loading: false });
    }
  },

  toggleLicense: async () => {
    const { licenseValue, tenantId } = get();
    const newValue = !licenseValue;
    try {
      set({ licenseValue: newValue });
      const payload = { is_license: newValue };

      const response = await requestApi(
        "POST",
        `/${tenantId}/salesforce/license/`,
        payload,
        "authService"
      );

      if (response.status === "error") {
        throw new Error(response.message);
      }

      const key = response.data?.data?.license_key || "";

      set({ licenseKey: key });
      toast.success("License updated successfully");
    } catch (error: any) {
      console.error("Error toggling license:", error);
    }
  },
  widgetOnChange: async (widgetId: string | null) => {
    const { tenantId } = get();
    try {
      const payload = {
        widget_id: widgetId,
      };

      await requestApi(
        "POST",
        `/${tenantId}/salesforce/widget/config/`,
        payload,
        "authService"
      );
      set({ selectedWidgetId: widgetId });
      toast.success("Widget updated successfully");
    } catch (error: any) {
      console.error("Change Config Common Widget Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to config common widget"
      );
    }
  },
  copyLicenseKey: () => {
    const { licenseKey } = get();
    if (!licenseKey) return;

    navigator.clipboard.writeText(licenseKey);
    set({ copied: true });

    setTimeout(() => set({ copied: false }), 2000);
  },
}));
