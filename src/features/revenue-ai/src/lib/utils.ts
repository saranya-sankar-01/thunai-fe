import { toast } from "@/hooks/use-toast";
import { Application } from "@/types/Application";
import { CustomField } from "@/types/CustomField";
import { Opportunity } from "@/types/Opportunity";
import { OpportunityFunnel, OpportunityFunnelView } from "@/types/OpportunityFunnelView";
import { UserInfo } from "@/types/UserInfo";
import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errorHandler(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    console.error("Axios API Error:", message);

    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });

  } else if (error instanceof Error) {
    console.error("API Error:", error.message);

    toast({
      variant: "destructive",
      title: "Error",
      description: error.message,
    });

  } else {
    console.error("Unexpected error:", error);

    toast({
      variant: "destructive",
      title: "Error",
      description: "An unexpected error occurred",
    });
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

export const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const isFieldsEmpty = (fields: Record<string, unknown>): boolean => {
  return !fields || Object.keys(fields).length === 0;
};

export const isAppConnected = (application: Application): boolean => {
  if (application.multiple_account) {
    if (
      application?.is_connected &&
      Array.isArray(application?.application_ids) &&
      application.application_ids.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
  return (
    application?.is_connected ||
    !!application?.application_id ||
    !!application?.action_application_id ||
    !!application?.oauth_application_id ||
    (Array.isArray(application?.application_ids) &&
      application.application_ids.length > 0) ||
    application?.is_oauth_connected
  );
};

export const formatLabel = (field: CustomField) => {
  return field.name.replace(/([A-Z])/g, " $1") // split camelCase
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export const isFunnelOpportunity = (data: Opportunity | OpportunityFunnel): data is OpportunityFunnel => {
  return "opportunity_id" in data;
}

export const getUserInfo = (): UserInfo => {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  return user;
};