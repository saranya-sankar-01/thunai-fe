import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "@/hooks/use-toast";

import arrayIcon from "../assets/images/schema-array-icon.svg";
import buttonIcon from "../assets/images/schema-button-icon.svg";
import checkboxIcon from "../assets/images/schema-checkbox-icon.svg";
import dateIcon from "../assets/images/schema-date-icon.svg";
import deleteIcon from "../assets/images/schema-delete-icon.svg";
import editIcon from "../assets/images/schema-edit-icon.svg";
import fileIcon from "../assets/images/schema-file-icon.svg";
import schemaIcon from "../assets/images/schema-icon.svg";
import numberIcon from "../assets/images/schema-number-icon.svg";
import objectIcon from "../assets/images/schema-object-icon.svg";
import removeIcon from "../assets/images/schema-remove-icon.svg";
import textIcon from "../assets/images/schema-text-icon.svg";
import uploadIcon from "../assets/images/schema-upload-icon.svg";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function errorHandler(error: Error) {
  if (axios.isAxiosError(error)) {
    console.error("Axios API Error:", error.response.data.message);
    toast({ variant: "error", title: "Error", description: error.response.data.message });
  } else if (error instanceof Error) {
    toast({ variant: "error", title: "Error", description: error?.message });
    console.error("API Error:", error.message);
  } else {
    toast({ variant: "error", title: "Error", description: error });
    console.error("Unexpected error:", error);
  }
}

export function getColor(name: string): string {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function getDialogPuropse(mode: string): string {
  switch (mode) {
    case "create":
      return "Create"
    case "edit":
      return "Edit";
    case "view":
      return "View";
    default:
      return "Create"
  }
}

export function getPaginationNumbers(
  currentPage: number,
  totalPages: number
): Array<number | "..."> {
  const pages: Array<number | "..."> = [];

  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export const icons = {
  text: textIcon,
  array: arrayIcon,
  button: buttonIcon,
  checkbox: checkboxIcon,
  date: dateIcon,
  delete: deleteIcon,
  edit: editIcon,
  file: fileIcon,
  schema: schemaIcon,
  number: numberIcon,
  object: objectIcon,
  remove: removeIcon,
  upload: uploadIcon
}

export const normalizeFieldName = (name: string) =>
  name.replace(/\s+(.)/g, (_, char) => char.toUpperCase());

export const ssoOptions = [
  {
    value: 'SAML',
    label: 'SAML 2.0',
    description: 'Authentication protocol type.',
  },
]