import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { EmailTemplate } from "../types/EmailTemplate";
import { EmailTemplateDetail } from "../types/EmailTemplateDetail";
import { create } from "zustand";

interface EmailTemplateStore {
  emailTemplates: EmailTemplate[];
  emailTemplate: EmailTemplateDetail;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  filter: Record<string, string>[];
  setFilter: (filter: Record<string, string>[]) => void;
  loadEmailTemplates: (filter: Record<string, string>[]) => Promise<void>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (currentPage: number) => void;
  loadEmailTemplate: (id: string) => Promise<void>;
  updateEmailTemplate: (payload: EmailTemplateDetail) => Promise<void>;
  resetTemplate: (id: string) => Promise<void>;
}

export const useEmailTemplateStore = create<EmailTemplateStore>((set, get) => ({
  emailTemplates: [],
  emailTemplate: {
    created: "",
    design_object: {
      body: { footers: [], headers: [], id: "", rows: [], values: {} },
      counters: {},
    },
    html: "",
    id: "",
    is_default: false,
    subject: "",
    template_key: "",
    updated: "",
    variables: [],
  },
  loading: false,
  filter: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,
  setLoading: (loading: boolean) => set({ loading }),
  setFilter: (filter: Record<string, string>[]) => set({ filter }),
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
    const { filter } = get();
    get().loadEmailTemplates(filter);
  },
  resetPagination: () => set({ currentPage: 1 }),
  loadEmailTemplates: async (filter: []) => {
    const { currentPage } = get();
    try {
      set({ loading: true });
      const requestBody = {
        ...filter,
        page: {
          size: 10,
          page_number: currentPage,
        },
        sort: "desc",
      };

      const response = await requestApi(
        "POST",
        "email/template/",
        requestBody,
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      const result = response.data.data;
      set({
        emailTemplates: result.data,
        totalItems: result.overall_total ?? 0,
        totalPages: Math.ceil((result.total ?? 0) / 10),
        pageSize: 10,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  loadEmailTemplate: async (id: string) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "GET",
        `email/template/?id=${id}`,
        {},
        "authService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      const result = response.data.data || {};
      set({
        emailTemplate: result,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  updateEmailTemplate: async (payload) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "PUT",
        "email/template/",
        payload,
        "authService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      const result = response.data.data;
      set({
        emailTemplate: result,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  resetTemplate: async (id: string) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "DELETE",
        `email/template/?id=${id}`,
        {},
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      get().loadEmailTemplates([]);
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },
}));
