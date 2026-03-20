export type ToastVariant = "success" | "warning" | "error" | "info";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  autoHideDuration?: number;
  action?: React.ReactNode;
}

export interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
}

let count = 0;
export function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}