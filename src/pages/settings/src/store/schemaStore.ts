import { toast } from "@/hooks/use-toast";
import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { Attribute } from "../types/Attribute";
import { Schema } from "../types/Schema";
import { create } from "zustand";

interface SchemaStore {
  schema: Schema;
  attributes: Attribute[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  loadSchema: () => Promise<void>;
  loadAttributes: () => Promise<void>;
  createAttributes: (payload: Record<string, string>[]) => Promise<boolean>;
  updateAttribute: (payload: Record<string, string>) => Promise<boolean>;
  deleteAttribute: (id: string) => Promise<void>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const useSchemaStore = create<SchemaStore>((set, get) => ({
  schema: {
    attribute_mapping: [],
    created: "",
    id: "",
    is_default: false,
    mandatory_attributes: [],
    primary_attribute: "",
    schema_name: "",
    updated: "",
    version: "",
  },
  attributes: [],
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,
  loadSchema: async () => {
    try {
      set({ loading: true });
      const response = await requestApi("GET", "schema/", {}, "accountService");
      const result = response.data.data || [];
      set({
        schema: result,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },
  loadAttributes: async () => {
    try {
      set({ loading: true });
      const payload = {
        filter: [],
        page: {
          page_number: 1,
          size: 50,
        },
        sort: "dsc",
        sortby: "created",
      };

      const response = await requestApi(
        "POST",
        "attribute/filter/",
        payload,
        "accountService"
      );
      const result = response.data.data;
      set({
        attributes: result.attributes,
        totalItems: result.overall_total,
        totalPages: Math.ceil((result.overall_total ?? 0) / 50),
        pageSize: 50,
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  createAttributes: async (payload: Record<string, string>[]) => {
    try {
      set({ loading: true });
      console.log(payload)
      const response = await requestApi(
        "POST",
        "attribute/",
        {attribute_data: {payload}},
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "Attribute Saved Successfullly",
      });
      await get().loadAttributes();
      return true;
    } catch (error) {
      errorHandler(error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateAttribute: async (payload: Record<string, string>) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "PATCH",
        "attribute/",
        payload,
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "Attribute Updated Successfullly",
      });
      await get().loadAttributes();
      return true;
    } catch (error) {
      errorHandler(error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteAttribute: async (id: string) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "DELETE",
        `attribute/?id=${id}`,
        {},
        "accountService"
      );

      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "Attribute deleted Successfully!",
      });
      await get().loadAttributes();
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },
}));
