import { getLocalStorageItem, setLocalStorageItem } from "../services/workflow";
import { create } from "zustand";
import { persist, StorageValue } from "zustand/middleware";
 // Adjust path as needed

interface WidgetStore {
  widgetId: string | null;
  setWidgetId: (id: string) => void;
  clearWidgetId: () => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      widgetId: null,
      setWidgetId: (id: string) =>
        set(() => ({
          widgetId: id,
        })),

      clearWidgetId: () =>
        set(() => ({
          widgetId: null,
        })),
    }),
    {
      name: "user_info", 
      storage: {
        getItem: (name): StorageValue<Partial<WidgetStore>> | null => {
          const data = getLocalStorageItem(name);
          if (!data) return null;
          return { state: { widgetId: data.widgetId } };
        },
        setItem: (name, value) => {
          const existingUserInfo = getLocalStorageItem(name) || {};
          const updatedUserInfo = {
            ...existingUserInfo,
            widgetId: value.state.widgetId,
          };
          setLocalStorageItem(name, updatedUserInfo);
        },
        removeItem: (name) => {
          const existingUserInfo = getLocalStorageItem(name) || {};
          delete existingUserInfo.widgetId;
          setLocalStorageItem(name, existingUserInfo);
        },
      },
      partialize: (state) => ({
        widgetId: state.widgetId,
      }),
    }
  )
);
