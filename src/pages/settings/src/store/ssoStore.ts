import { errorHandler } from "../lib/utils";
import { requestApi, requestApiFromData } from "@/services/authService";
import { SsoConfiguration } from "../types/SsoConfiguration";
import { create } from "zustand";

type LoadingState = {
  deleteSso: boolean,
  saveSso: boolean,
  fetchSso: boolean,
  verifySso: boolean,
  loadSso: boolean,
}

type LoadingKey = keyof LoadingState;

interface SsoStore {
  ssoConfigurations: SsoConfiguration[];
  loading: LoadingState;
  selectedSso: string;
  isEdit: boolean;
  appID: string;
  setSsoConfigurations: (configs: SsoConfiguration[]) => void;
  setLoading: (key: LoadingKey, value: boolean) => void;
  setSelectedSso: (sso: string) => void;
  setIsEdit: (isEdit: boolean) => void;
  setAppID: (id: string) => void;
  loadSsoConfigurations: () => Promise<void>;
  deleteSsoConfiguration: (id: string) => Promise<any>;
  saveSamlConfiguration: (payload: FormData) => Promise<any>;
  fetchSamlConfiguration: (id: string) => Promise<any>;
  verifySamlMetadata: (payload: FormData) => Promise<any>;
}

export const useSsoStore = create<SsoStore>((set, get) => ({
  ssoConfigurations: [],
  loading: {
    deleteSso: false,
    saveSso: false,
    fetchSso: false,
    verifySso: false,
    loadSso: false,
  },
  selectedSso: '',
  isEdit: false,
  appID: '',
  setSsoConfigurations: (configs) => set({ ssoConfigurations: configs }),
  setLoading: (key, value) =>
    set(state => ({
      loading: {
        ...state.loading,
        [key]: value,
      },
    })),
  setSelectedSso: (selectedSso) => set({ selectedSso }),
  setIsEdit: (isEdit) => set({ isEdit }),
  setAppID: (appID) => set({ appID }),
  loadSsoConfigurations: async () => {
    const { setLoading } = get();
    try {
      setLoading("loadSso", true);
      const response = await requestApi(
        "GET",
        "saml/configuration/",
        {},
        "samlService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      set({
        ssoConfigurations: response.data.data || [],
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading("loadSso", false);
    }
  },
  deleteSsoConfiguration: async (id: string) => {
    const { setLoading } = get();
    try {
      setLoading("deleteSso", true);
      const response = await requestApi(
        "DELETE",
        `saml/configuration/?id=${id}`,
        {},
        "samlService"
      );
      return response.data;
    } catch (error) {
      errorHandler(error);
      return { status: "error", message: error };
    } finally {
      setLoading("deleteSso", false);
    }
  },
  saveSamlConfiguration: async (payload: FormData) => {
    const { setLoading } = get();
    try {
      setLoading("saveSso", true);
      const response = await requestApiFromData(
        "POST",
        "saml/configuration/",
        payload,
        "samlService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading("saveSso", false);
    }
  },
  fetchSamlConfiguration: async (id: string) => {
    const { setLoading } = get();
    try {
      setLoading("fetchSso", true);
      const response = await requestApi(
        "PUT",
        "saml/configuration/",
        { id },
        "samlService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading("fetchSso", false);
    }
  },
  verifySamlMetadata: async (payload: FormData) => {
    const { setLoading } = get();
    try {
      setLoading("verifySso", true);
      const response = await requestApi(
        "POST",
        "parse/saml/metadata/",
        payload,
        "samlService"
      );
      if (response.data.status !== "success") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      errorHandler(error);
      return { status: "error", message: error };
    } finally {
      setLoading("verifySso", false);
    }
  },
}));
