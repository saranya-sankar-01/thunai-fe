import { getTenantId, requestApi } from "@/services/authService";// keep as-is

const tenant_id = getTenantId();

export const fetchSuggestedQuestions = async (type: "meet" | "kb") => {
  const url = `${tenant_id}/faqs/?type=${type}`;

  const response = await requestApi("GET",url,null,"authService");
const result = response
  const faqs = result?.data?.faqs || [];
  return faqs.map((faq: any) => faq.question).slice(0, 6);
};
export const getLogs = async (payload) => {
  const response = await requestApi(
    "POST",
    `${tenant_id}/mcp/logs`,
    payload,
    "omniMcp"
  );
  return response;
};