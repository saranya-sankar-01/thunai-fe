import { ToastOptions } from "../types/ToastOptions";

export const toastRef = {
  toast: (opts: ToastOptions) => {
    console.warn("ToastProvider not initialized", opts);
  },
  dismiss: (id?: string) => {
    console.warn("ToastProvider not initialized", id);
  },
};
