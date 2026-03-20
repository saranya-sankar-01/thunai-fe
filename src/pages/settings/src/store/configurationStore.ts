import { create } from "zustand";
import { requestApi } from "@/services/authService";
import { ApiKeyItem } from "../types/ApiKeyItem";
import { KafkaStreams } from "../types/KafkaStream";
import { toast } from "@/hooks/use-toast";
import { errorHandler } from "../lib/utils";

type apiPayload = {
  id?: string;
  key_name?: string;
  validity?: number;
};

type kafkaPayload = {
  topic_name?: string;
};

interface ConfigurationStore {
  apiKeys: ApiKeyItem[];
  kafkaStreams: KafkaStreams;
  loading: boolean;
  loadApiKey: () => Promise<void>;
  createApiKey: (payload: apiPayload) => Promise<boolean>;
  updateApiKey: (payload: apiPayload) => Promise<boolean>;
  deleteApiKey: (id: string) => Promise<void>;
  loadKafkaStream: () => Promise<void>;
  createKafkaStream: (payload: kafkaPayload) => Promise<void>;
  deleteKafkaStream: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useConfigurationStore = create<ConfigurationStore>((set, get) => ({
  apiKeys: [],
  kafkaStreams: {
    enable: false,
    topic_name: "",
    partitions: 0,
    replication_factor: 0,
  },
  loading: false,

  setLoading: (loading: boolean) => set({ loading }),

  loadApiKey: async () => {
    try {
      set({ loading: true });
      const response = await requestApi("GET", "apikey/", {}, "accountService");

      const result = response.data.data;
      set({
        apiKeys: result,
      });
    } catch (error) {
      errorHandler(error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  createApiKey: async (payload) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "POST",
        "apikey/",
        payload,
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "API Key created Successfully!",
      });
      await get().loadApiKey();
      return true;
    } catch (error) {
      errorHandler(error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  updateApiKey: async (payload) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "PUT",
        "apikey/",
        payload,
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "API Key updated Successfully!",
      });
      await get().loadApiKey();
      return true;
    } catch (error) {
      errorHandler(error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  deleteApiKey: async (id) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "DELETE",
        `apikey/?id=${id}`,
        {},
        "accountService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      toast({
        variant: "success",
        title: "Success",
        description: "API Key deleted Successfully!",
      });
      await get().loadApiKey();
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  loadKafkaStream: async () => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "GET",
        "enable/kafka/streaming/brain/",
        {},
        "authService"
      );

      const result = response.data.data;
      set({ kafkaStreams: result });
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  createKafkaStream: async (payload) => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "POST",
        "enable/kafka/streaming/brain/",
        payload,
        "authService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      await get().loadKafkaStream();
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },

  deleteKafkaStream: async () => {
    try {
      set({ loading: true });
      const response = await requestApi(
        "DELETE",
        "enable/kafka/streaming/brain/",
        {},
        "authService"
      );

      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      await get().loadKafkaStream();
    } catch (error) {
      errorHandler(error);
    } finally {
      set({ loading: false });
    }
  },
}));
