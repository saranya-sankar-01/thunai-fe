import { apiRequest } from "./api";


export const getUserPreferences = async () => {
  const result = await apiRequest("/settings/preference/", {
    method: "GET",
  });
  return result.data;
};

export const updateUserPreferences = async (
  payload: {
    websearch: boolean;
    enrich_smart_query: boolean;
  }
) => {
  const result = await apiRequest("/settings/preference/", {
    method: "POST",
    devicetype: "chromeplugin",
    body: JSON.stringify(payload),
  });
  return result.data;
};
