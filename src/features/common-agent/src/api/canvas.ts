import { apiRequest, getTenantId, requestApi, requestApiFromData } from "@/services/authService";
import axios from "axios";
const tenant_id = getTenantId()
export const CanvasLists = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/widget/canvas/template/`,
    payload,
    "authService"
  );
  return response;
};

export const CanvasCreate = async (payload) => {
  const response = await requestApiFromData(
    "POST",
    `${tenant_id}/widget/canvas/template/`,
    payload,
    "authService"
  );
  return response;
};
 
export const CanvasUpdate = async (payload) => {
  const response = await requestApi(
    "PATCH",
    `${tenant_id}/widget/canvas/template/`,
    payload,
    "authService"
  );
  return response;
};

export const CanvasDelete = async (payload) => {
  const response = await requestApi(
    "DELETE",
    `${tenant_id}/widget/canvas/template/`,
    payload,
    "authService"
  );
  return response;
};