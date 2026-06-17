import { getTenantId, requestApi } from "@/services/authService";

const tenant_id = getTenantId();

export const ResearchDetails = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/research/results/?research_id=${payload.research_id}`,
    payload,
    "authService"
  );
  return response;
};
export const ResearchStatus = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/research/polling/?research_id=${payload.research_id}`,
    payload,
    "authService"
  );
  return response;
};
export const ResearchList = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/research/schedule/list/`,
    payload,
    "authService"
  );
  return response;
};
export const createResearch = async (payload) => {
  const response = await requestApi(
    "POST",
    `${tenant_id}/research/schedule/`,
    payload,
    "authService"
  );
  return response;
};
export const updateResearch = async (payload) => {
  const response = await requestApi(
    "PUT",
    `${tenant_id}/research/schedule/`,
    payload,
    "authService"
  );
  return response;
};
export const DeleteResearch = async (payload) => {
  const response = await requestApi(
    "DELETE",
    `${tenant_id}/research/results/`,
    payload,
    "authService"
  );
  return response;
};
export const GetChatHistory = async (payload) => {
  const response = await requestApi(
    "POST",
    `${tenant_id}/get/chat-history/${payload.session_id}/`,
    payload,
    "authService"
  );
  return response;
};

export const RegenerateResearch = async (payload) => {
  const response = await requestApi(
    "PUT",
    `${tenant_id}/research/regenerate/`,
    payload,
    "authService"
  );
  return response;
};
export const SearchResearch = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/search/research/?query=${payload}`,
    payload,
    "authService"
  );
  return response;
};