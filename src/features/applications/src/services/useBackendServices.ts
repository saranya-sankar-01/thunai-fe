import { useCallback } from "react";
import { getAccessToken, getLocalStorage } from "../utils/cryptoStorage";

import { integrationServiceMap } from "../services/integrationServiceMap";

// type ServiceKey = keyof typeof SERVICE_BASE_URLS;

export const useBackendService = (appName: string) => {
  const getUserInfo = useCallback(() => getLocalStorage("userInfo"), []);

  const getTenantId = useCallback(() => {
    return getUserInfo()?.default_tenant_id;
  }, [getUserInfo]);

  const getUserId = useCallback(
    () => getUserInfo()?.profile?.user_id,
    [getUserInfo]
  );

  const getToken = useCallback(() => getAccessToken(), []);

  const getService = integrationServiceMap[appName];

  const fetchAppDependentData = useCallback(
    async (
      appName: string,
      payload: Record<string, any>,
      appType: string,
      handlerName?: string
    ) => {
      const service = getService?.getState();

      if (appType === "DYNAMIC_APP") {
        if (appName === "asana") {
          const { asana_token, workspaceId } = payload;
          if (!asana_token) return;
          if (!workspaceId &&service.loadWorkplaces) {
            const options = await service.loadWorkplaces(asana_token);

            return {options: options, returnValue: "id", displayValue: "name"};
          }
          if (workspaceId && service.loadProjects) {
            const options = await service.loadProjects(
              asana_token,
              workspaceId
            );
            return {options: options, returnValue: 'gid', displayValue: "name"};
          }
        }
        if (appName === "github_issues") {
          if (payload.api_token && payload.owner && payload.repository) {
            if (service.loadProjects) {
              const options = await service.loadProjects(
                payload.api_token,
                payload.owner,
                payload.repository
              );
              return {options: options, returnValue: "id", displayValue: "name"};
            }
          }
        }
        if (appName === "jira") {
          if (payload.apiToken && payload.domainName && payload.email) {
            if (service.loadProjects) {
              const options = await service.loadProjects(
                payload.apiToken,
                payload.domainName,
                payload.email
              );
              return {options:options, returnValue: "id", displayValue: "name"};
            }
          }
        }
      } else if (appType === "CUSTOM_APP") {
        const callbackFn = handlerName ? service[handlerName] : undefined;
        if (appName === "slack" && callbackFn) {
          const options = await callbackFn?.();
          return options;
        }
        if(appName === "microsoft_teams" && callbackFn){
          const options = await callbackFn?.();

          return options;
        }
        // try {
        //   const response = await requestApi(
        //     "POST",
        //     endpoint,
        //     payload,
        //     serviceKey
        //   );

        //   const rawOptions = response?.data?.options || response?.options || [];

        //   const options = rawOptions.map((item: any) => ({
        //     value: item.id || item.value,
        //     label: item.name || item.label || item.value,
        //   }));

        //   return { options };
        // } catch (error) {
        //   console.error(`Dynamic data fetch failed for ${appName}: `, error);
        //   return { options: [] };
        // }
      }
    },
    [getService]
  );

  return {
    fetchAppDependentData,
    getTenantId,
    getUserId,
    getToken,
    getUserInfo,
  };
};
