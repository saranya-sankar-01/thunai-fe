import { ApplicationItem } from "../types/ApplicationItem";
import { UserInfo } from "../types/UserInfo";

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUserInfo = (): UserInfo => {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  return user;
};

export const isFieldsEmpty = (fields: Record<string, unknown>): boolean => {
  return !fields || Object.keys(fields).length === 0;
};

export const isAppConnected = (application: ApplicationItem): boolean => {
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
