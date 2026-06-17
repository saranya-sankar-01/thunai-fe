import { apiRequest, getTenantId } from "@/services/authService";
import { requestApi } from "@/services/authService";

const tenant_id = getTenantId();

export const getconfiguration = async () => {
     const response = await requestApi(
      "GET",
      `${tenant_id}/ask-thunai/mcp/config/`,
      "",
      "authService"
    );
//   const result = await apiRequest("/ask-thunai/mcp/config/","authService");
  return response;
};
export const saveconfiguration = async (payload) => {
     const response = await requestApi(
      "POST",
      `${tenant_id}/ask-thunai/mcp/config/`,
    payload,
      "authService"
    );
//   const result = await apiRequest("/ask-thunai/mcp/config/","authService");
  return response;
};
export const ToolsList = async (payload) => {
  const response = await requestApi(
    "GET",
    `ask-thunai/mcp/fields/?tenant_id=${tenant_id}`,
    payload,
     "authService"
  );
  return response;
};
export const AsanaChannelList = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/thunai/asana/list/projects`,
    // payload,
    "",
     "geteway2Service"
  );
  return response;
};
export const JiraProjectlList = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/thunai/jira/get/sub/projects`,
    "",
     "geteway2Service"
  );
  return response;
};
export const JiraIssueList = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/thunai/jira/get/issue-key?projectKey=${payload.projectKey}`,
    "",
     "geteway2Service"
  );
  return response;
};
export const SlackChannelList = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/application/workflow/slack/channel/list`,
    payload,
     "slackService"
  );
  return response;
};
export const GithubIssuesList = async (payload) => {
  const response = await requestApi(
    "POST",
    `thunai/github_issues/get/projectkey`,
    payload,
     "getewayService"
  );
  return response;
};
export const MicrosoftTeamsList = async (payload) => {
  const response = await requestApi(
    "GET",
    `${tenant_id}/application/workflow/teams/channel/list`,
    payload,
     "teamService"
  );
  return response;
};
export const ConfluenceList = async (payload) => {
  const response = await requestApi(
    "POST",
    `thunai/confluence/getprojects`,
    payload,
     "geteway2Service"
  );
  return response;
};
export const ZohoCRMAccountList = async (payload) => {
  const response = await requestApi(
    "POST",
    `zoho/accounts-list`,
    payload,
     "intService"
  );
  return response;
};
export const ZohoCRMStagesList = async (payload) => {
  const response = await requestApi(
    "POST",
    `zoho/stages-list`,
    payload,
     "intService"
  );
  return response;
};