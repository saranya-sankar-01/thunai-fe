// import { FC, useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { v4 as uuidv4 } from "uuid";
// import JiraForm from "@/components/workflow/forms/JiraForm";
// import FreshdeskForm from "@/components/workflow/forms/FreshdeskForm";
// import ComonForm from "@/components/workflow/forms/commonForm";
// import ZendeskForm from "@/components/workflow/forms/zendeskForm";
// import RedmineForm from "@/components/workflow/forms/redmineForm";
// import ServiceNowForm from "@/components/workflow/forms/Servicenow";
// import VoiceForm from "@/components/workflow/forms/voiceForm";
// import SlackForm from "@/components/workflow/forms/slackForm";
// import { Trash2 } from "lucide-react";
// import Dropdown from "@/components/workflow/common-components/dropdown";
// import GoogleDriveMultiSelectDropdown from "@/components/workflow/common-components/google-drive-multiSelectDropdown";
// import GoogleDriveForm from "@/components/workflow/forms/google-drive";
// import { useWidgetStore } from '@/stores/widgetStore';
// import { requestApi } from "@/services/workflow";
// interface AppEndpoint {
//   application_id: string;
//   application_name: string;
//   is_master: boolean;
// }

// const Step3Application: FC<any> = ({
//   setApplicationName,
//   applicationName,
//   setIsMaster,
//   setConfig,
//   config,
//   selectedConfigId,
//   setSelectedConfigId,
//   jiraIssueData,
//   setJiraIssueData,
//   selectedIssueType,
//   setSelectedIssueType,
//   setSelectedCustomFields,
//   selectedCustomFields,
//   setSelectedOperationId,
//   selectedOperationId,
//   setFields,
//   fields,
//   value,
//   setValue,
//   isMaster,
//   workflowAgent,
//   setWorkflowagent
// }) => {
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const token = localStorage.getItem("agent_token");
//   const { widgetId } = useWidgetStore();
//   const tenantId = localStorage.getItem("tenant_id");
//   const urlIdentifier = localStorage.getItem("url_identifier")
//   const userId = localStorage.getItem("user_id")
//   const csrfToken = localStorage.getItem("csrf_token")

//   const [appEndpoints, setAppEndpoints] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [configLoading, setConfigLoading] = useState(false);
//   const [jiraLoading, setJiraLoading] = useState<boolean>(false);
//   const [agent, setAgent] = useState<any[]>([]);

//   const clearFormData = () => {
//     setApplicationName("");
//     setIsMaster(false);
//     setConfig({});
//     setSelectedConfigId("");
//     setJiraIssueData([]);
//     setSelectedIssueType("");
//     setSelectedCustomFields({});
//     setSelectedOperationId("");
//     setFields([]);
//     setValue([]);
//     setAgent([]);
//     setWorkflowagent([]);
//   };

//   const hasData =
//     applicationName ||
//     config ||
//     selectedConfigId ||
//     jiraIssueData.length ||
//     selectedCustomFields ||
//     selectedOperationId ||
//     fields.length ||
//     value.length;
    
//   useEffect(() => {
//     async function fetchAppEndpoints() {
//       try {
//         setLoading(true);
//         setError("");
//         // const response = await fetch(
//         //   `https://api.thunai.ai/auth-service/ai/api/v1/${tenantId}/application/endpoint/mapping/`,
//         //   {
//         //     method: "GET",
//         //     headers: {
//         //       "Content-Type": "application/json",
//         //       Authorization: `Bearer ${token}`,
//         //       "x-csrftoken": csrfToken || "",
//         //     },
//         //   }
//         // );
//         // if (!response.ok) {
//         //   throw new Error(`Error fetching endpoints: ${response.statusText}`);
//         // }
//         // const res = await response.json();
//         // setAppEndpoints(res.data);
//           const response = await requestApi(
//       "GET",
//       `${localStorage.getItem("tenant_id")}/application/endpoint/mapping/`,
//       null,
//       "authService"
//     );
    
//     setAppEndpoints(response.data.data);
//       } catch (err: any) {
//         setError(err.message || "Failed to load application endpoints");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchAppEndpoints();
//   }, [token]);

//   const selectedApp = appEndpoints.find(
//     (app) => app.application_name === applicationName
//   );

//   const handleOperationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedOpId = e.target.value;
//     const selectedAction = selectedApp?.tools
//       .flatMap((tool: any) => tool.actions)
//       .find((action: any) => action.operationId === selectedOpId);

//     setSelectedOperationId(selectedOpId);
//     if (selectedAction) {
//       console.log(`Selected Tool: ${selectedAction.name}`);
//       console.log(`Selected Operation ID: ${selectedOpId}`);
//     }
//   };

//   useEffect(() => {
//     if (isMaster && applicationName && selectedOperationId) {
//       async function fetchConfig() {
//         try {
//           setConfigLoading(true);
//           // const response = await fetch(
//           //   `https://api.thunai.ai/auth-service/ai/api/v1/get/widget/applications/${widgetId}/?app=${applicationName?.toLowerCase()}`,
//           //   {
//           //     method: "GET",
//           //     headers: {
//           //       "Content-Type": "application/json",
//           //       Authorization: `Bearer ${token}`,
//           //       "x-csrftoken": csrfToken || "",
//           //     },
//           //   }
//           // );
//           const response = await requestApi(
//       "GET",
//       `get/widget/applications/${widgetId}/?app=${applicationName?.toLowerCase()}`,
//       null,
//       "authService"
//     );
//           // if (!response.ok) {
//           //   throw new Error(
//           //     `Error fetching configuration: ${response.statusText}`
//           //   );
//           // }
//           // const res = await response.json();
//           setConfig(response.data.data);
//         } catch (err: any) {
//           setError(err.message || "Failed to load configuration");
//         } finally {
//           setConfigLoading(false);
//         }
//       }
//       async function fetchSlackConfig() {
//         try {
//           setConfigLoading(true);
//           // const response = await fetch(
//           //   `https://api.thunai.ai/slack-service/slackai/v1/${tenantId}/application/workflow/slack/channel/list`,
//           //   {
//           //     method: "GET",
//           //     headers: {
//           //       "Content-Type": "application/json",
//           //       Authorization: `Bearer ${token}`,
//           //       "x-csrftoken": csrfToken || "",
//           //     },
//           //   }
//           // );
//           // if (!response.ok) {
//           //   throw new Error(
//           //     `Error fetching configuration: ${response.statusText}`
//           //   );
//           // }
//           // const res = await response.json();
//           // setConfig(res.data);
//           const response = await requestApi(
//       "GET",
//       `slackai/v1/${localStorage.getItem("tenant_id")}/application/workflow/slack/channel/list`,
//       null,
//       "slackService"
//     );
    
//     setConfig(response.data.data);
//         } catch (err: any) {
//           setError(err.message || "Failed to load configuration");
//         } finally {
//           setConfigLoading(false);
//         }
//       }
//           async function fetchMicrosoftTeamsConfig() {
//         try {
//           setConfigLoading(true);
//           const response = await requestApi(
//       "GET",
//       `teamsai/v1/${localStorage.getItem("tenant_id")}/application/workflow/teams/channel/list`,
//       null,
//       "slackService"
//     );
    
//     setConfig(response.data.data);
//         } catch (err: any) {
//           setError(err.message || "Failed to load configuration");
//         } finally {
//           setConfigLoading(false);
//         }
//       }
//       const excludedApplications = ["zendesk", "servicenow", "teams_phone","slack", "shopify", "microsoft_teams"];
//       if (!excludedApplications.includes(applicationName?.toLowerCase())) {
//         fetchConfig();
//       }
//       if(applicationName == 'slack'){
//         fetchSlackConfig()
//       }
//             if(applicationName == 'microsoft_teams'){
// fetchMicrosoftTeamsConfig()
//     } 
//     } 

//     // if(isMaster && applicationName  && selectedOperationId){
//       async function fetchWidgetConfig() {
//         try {
//           // setConfigLoading(true);
//           // const response = await fetch(
//           //   `https://api.thunai.ai/auth-service/ai/api/v1/${tenantId}/voice/agent/config/filter/${widgetId}/`,
//           //   {
//           //     method: "GET",
//           //     headers: {
//           //       "Content-Type": "application/json",
//           //       Authorization: `Bearer ${token}`,
//           //       "x-csrftoken": csrfToken || "",
//           //     },
//           //   }
//           // );
//           // if (!response.ok) {
//           //   throw new Error(
//           //     `Error fetching configuration: ${response.statusText}`
//           //   );
//           // }
//           // const data = await response.json();
//           const response = await requestApi(
//       "GET",
//       `${localStorage.getItem("tenant_id")}/voice/agent/config/filter/${widgetId}/`,
//       null,
//       "authService"
//     );
//           const data = response.data;
//           if (data && data.data) {
//           const options = data.data.map((user: any) => ({
//             value: user.widget_id,
//             label: user.agent_name,
//           }));
//           setAgent(options);
//         }
//         } catch (err: any) {
//           setError(err.message || "Failed to load configuration");
//         } finally {
//           // setConfigLoading(false);
//         }
//       }
//         fetchWidgetConfig();
//     // }
//   }, [applicationName, selectedOperationId, token, widgetId]);

//   useEffect(() => {
//     if (selectedConfigId && applicationName === "jira") {
//       async function fetchJiraIssueTypes() {
//         try {
//           setJiraLoading(true);

//           const payload = {
//             tenantId: tenantId,
//             urlIdentifier: urlIdentifier,
//             userId: userId || "",
//             key: selectedConfigId,
//           };

//           // const response = await fetch(
//           //   "https://api.thunai.ai/int-service//thunai/v1/jira/get/issue-key",
//           //   {
//           //     method: "POST",
//           //     headers: {
//           //       "Content-Type": "application/json",
//           //       Authorization: `Bearer ${token}`,
//           //       "x-csrftoken": csrfToken || "",
//           //     },
//           //     body: JSON.stringify(payload),
//           //   }
//           // );

//           // if (!response.ok) {
//           //   throw new Error(
//           //     `Error fetching Jira issue key: ${response.statusText}`
//           //   );
//           // }

//           // const data = await response.json();
//             const response = await requestApi(
//       "POST",
//       "jira/get/issue-key",
//       payload,
//       "intService"
//     );
//           setJiraIssueData(response.data.data);
//         } catch (err: any) {
//           setError(err.message || "Failed to fetch Jira issue key");
//         } finally {
//           setJiraLoading(false);
//         }
//       }

//       fetchJiraIssueTypes();
//     }
//   }, [
//     selectedConfigId,
//     applicationName,
//     tenantId,
//     urlIdentifier,
//     userId,
//     token,
//   ]);

//   const handleApplicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedAppId = e.target.value;
//     const selectedApp = appEndpoints.find(
//       (app) => app.application_name === selectedAppId
//     );
//     if (selectedApp) {
//       setApplicationName(selectedApp.application_name);
//       setIsMaster(selectedApp.is_master);
//     }
//   };

//   useEffect(() => {
//     let includeApps = ["servicenow"];
//     if (includeApps.includes(applicationName)) {
//       handleConfigChange({
//         target: { value: selectedConfigId || "" },
//       } as React.ChangeEvent<HTMLSelectElement>);
//     } else if (selectedConfigId && applicationName) {
//       handleConfigChange({
//         target: { value: selectedConfigId },
//       } as React.ChangeEvent<HTMLSelectElement>);
//     }
//   }, [selectedConfigId, applicationName, selectedOperationId]);

//   const handleConfigChange = async (
//     e: React.ChangeEvent<HTMLSelectElement>
//   ) => {
//     const selectedConfigId = e.target.value;
//     setSelectedConfigId(selectedConfigId);

//     console.log(`Selected Configuration: ${selectedConfigId}`);

//     if (applicationName === "jira" && selectedOperationId) {
//       try {
//         setJiraLoading(true);
//         const payload = {
//           tenantId: tenantId,
//           urlIdentifier: urlIdentifier,
//           userId: userId || "",
//           key: selectedConfigId,
//         };

//         // const response = await fetch(
//         //   "https://api.thunai.ai/int-service//thunai/v1/jira/get/issue-key",
//         //   {
//         //     method: "POST",
//         //     headers: {
//         //       "Content-Type": "application/json",
//         //       Authorization: `Bearer ${token}`,
//         //       "x-csrftoken": csrfToken || "",
//         //     },
//         //     body: JSON.stringify(payload),
//         //   }
//         // );

//         // if (!response.ok) {
//         //   throw new Error(
//         //     `Error fetching Jira issue key: ${response.statusText}`
//         //   );
//         // }

//         // const data = await response.json();
//          const response = await requestApi(
//       "POST",
//       "jira/get/issue-key",
//       payload,
//       "intService"
//     );
//      const data = response.data;
//         setJiraIssueData(data.data);
//         const selectedIssue = data.data.find(
//           (issue: any) => issue.issueType === selectedIssueType
//         );

//         if (selectedIssue) {
//           const customFields = selectedIssue.customFields.reduce(
//             (acc: any, field: any) => {
//               acc[field.id] = {
//                 value: field.type === "select" ? "" : [],
//                 name: field.name,
//                 id: field.id,
//               };
//               return acc;
//             },
//             {}
//           );
//           setSelectedCustomFields(customFields);
//       }
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch Jira issue key");
//       } finally {
//         setJiraLoading(false);
//       }
//     } else if (applicationName === "freshdesk" && selectedOperationId) {
//       try {
//         if (selectedOperationId == "createFreshdeskTicket") {
//           setJiraLoading(true);
//           const payload = {
//             tenantId: tenantId,
//             urlIdentifier: urlIdentifier,
//             userId: userId || "",
//           };

//           // const response = await fetch(
//           //   "https://api.thunai.ai/int-service/thunai/v1/freshdesk/get/custom-fields",
//           //   {
//           //     method: "POST",
//           //     headers: {
//           //       "Content-Type": "application/json",
//           //       Authorization: `Bearer ${token}`,
//           //       "x-csrftoken": csrfToken || "",
//           //     },
//           //     body: JSON.stringify(payload),
//           //   }
//           // );

//           // if (!response.ok) {
//           //   throw new Error(
//           //     `Error fetching Jira issue key: ${response.statusText}`
//           //   );
//           // }

//           // const data = await response.json();
//           const response = await requestApi(
//     "POST",
//     "freshdesk/get/custom-fields",
//     payload,
//     "intService"
//   );

//   const data = response.data;

//           setJiraIssueData(data.data);
//           if (data.data) {
//             const customFields = data.data.reduce((acc: any, field: any) => {
//               acc[field.id] = {
//                 value: field.type === "select" ? "" : [],
//                 name: field.name,
//                 id: field.id,
//               };
//               return acc;
//             }, {});
//             setSelectedCustomFields(customFields);
//           }
//         } else {
//           setSelectedCustomFields({});
//         }
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch Jira issue key");
//       } finally {
//         setJiraLoading(false);
//       }
//     } else if (applicationName === "zendesk" && selectedOperationId) {
//       try {
//         setJiraLoading(true);
//         const payload = {
//           tenantId: tenantId,
//           widgetId: widgetId,
//           urlIdentifier: urlIdentifier,
//           userId: userId || "",
//         };

//         // const response = await fetch(
//         //   "https://api.thunai.ai/int-service/thunai/v2/zendesk/get/custom-fields",
//         //   {
//         //     method: "POST",
//         //     headers: {
//         //       "Content-Type": "application/json",
//         //       Authorization: `Bearer ${token}`,
//         //       "x-csrftoken": csrfToken || "",
//         //     },
//         //     body: JSON.stringify(payload),
//         //   }
//         // );

//         // if (!response.ok) {
//         //   throw new Error(
//         //     `Error fetching Zendesk custom fields: ${response.statusText}`
//         //   );
//         // }

//         // const data = await response.json();
//          const response = await requestApi(
//       "POST",
//       "zendesk/get/custom-fields",
//       payload,
//       "intServiceV2"
//     );

//     const data = response.data;
//         setJiraIssueData(data.data);
//         if (data.data) {
//           const customFields = data.data.reduce((acc: any, field: any) => {
//             acc[field.id] = {
//               value: field.type === "select" ? "" : [],
//               name: field.title,
//               id: field.id,
//             };
//             return acc;
//           }, {});
//           setSelectedCustomFields(customFields);
//           console.log(`Selected Custom Fields:`, customFields);
//         }
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch Zendesk custom fields");
//       } finally {
//         setJiraLoading(false);
//       }
//     } else if (applicationName === "redmine" && selectedOperationId) {
//       try {
//         setJiraLoading(true);
//         const payload = {
//           tenantId: tenantId,
//           urlIdentifier: urlIdentifier,
//           userId: userId || "",
//         };

//         // const response = await fetch(
//         //   "https://api.thunai.ai/int-service/thunai/v1/redmine/get/custom-fields",
//         //   {
//         //     method: "POST",
//         //     headers: {
//         //       "Content-Type": "application/json",
//         //       Authorization: `Bearer ${token}`,
//         //       "x-csrftoken": csrfToken || "",
//         //     },
//         //     body: JSON.stringify(payload),
//         //   }
//         // );

//         // if (!response.ok) {
//         //   throw new Error(
//         //     `Error fetching Zendesk custom fields: ${response.statusText}`
//         //   );
//         // }

//         // const data = await response.json();
//          const response = await requestApi(
//       "POST",
//       "redmine/get/custom-fields",
//       payload,
//       "intService"
//     );

//     const data = response.data;
//         setJiraIssueData(data.data);
//         if (data.data) {
//           const customFields = data.data.reduce((acc: any, field: any) => {
//             acc[field.id] = {
//               value: field.type === "select" ? "" : [],
//               name: field.name,
//               id: field.id,
//             };
//             return acc;
//           }, {});
//           setSelectedCustomFields(customFields);
//           console.log(`Selected Custom Fields:`, customFields);
//         }
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch Zendesk custom fields");
//       } finally {
//         setJiraLoading(false);
//       }
//     } else if (applicationName === "servicenow" && selectedOperationId) {
//       try {
//         let table_name = "incident";
//         let incidentArray = [
//           "createServiceNowIncident",
//           "UpdateServiceNowIncidentDetails",
//           "checkExistingServiceNowIncident",
//           "checkExistingServiceNowIncidentByKey",
//           "linkServiceNowIncidents",
//         ];
//         let problemArray = [
//           "createServiceNowProblems",
//           "UpdateServiceNowProblemDetails",
//           "checkExistingServiceNowProblems",
//           "checkExistingServiceNowProblemsByKey",
//           "linkServiceNowProblems",
//         ];
//         let taskArray = [
//           "createServiceNowTask",
//           "UpdateServiceNowTaskDetails",
//           "checkExistingServiceNowTask",
//           "checkExistingServiceNowTaskByKey",
//           "linkServiceNowTask",
//         ];
//         let changeRequestArray = [
//           "createServiceNowChangeRequest",
//           "UpdateServiceNowChangeRequestDetails",
//           "checkExistingServiceNowChangeRequest",
//           "checkExistingServiceNowChangeRequestByKey",
//           "linkServiceNowChangeRequest",
//         ];
//         if (incidentArray.includes(selectedOperationId)) {
//           table_name = "incident";
//         } else if (problemArray.includes(selectedOperationId)) {
//           table_name = "problem";
//         } else if (taskArray.includes(selectedOperationId)) {
//           table_name = "task";
//         } else if (changeRequestArray.includes(selectedOperationId)) {
//           table_name = "change_request";
//         }

//         setJiraLoading(true);
//         const payload = {
//           tenantId: tenantId,
//           urlIdentifier: urlIdentifier,
//           userId: userId || "",
//           widgetId: widgetId,
//           table_name: table_name,
//         };

//         // const response = await fetch(
//         //   "https://api.thunai.ai/int-service/thunai/v2/servicenow/custom-field/list",
//         //   {
//         //     method: "POST",
//         //     headers: {
//         //       "Content-Type": "application/json",
//         //       Authorization: `Bearer ${token}`,
//         //       "x-csrftoken": csrfToken || "",
//         //     },
//         //     body: JSON.stringify(payload),
//         //   }
//         // );

//         // if (!response.ok) {
//         //   throw new Error(
//         //     `Error fetching Zendesk custom fields: ${response.statusText}`
//         //   );
//         // }

//         // const data = await response.json();
       
//         // console.log(`Fetched ServiceNow custom fields:`, data.data);
//         const response = await requestApi(
//       "POST",
//       "servicenow/custom-field/list",
//       payload,
//       "intServiceV2"
//     );

//     const data = response.data;
//         setJiraIssueData(data.data);
//         if (data.data) {
//           const customFields = data.data.reduce((acc: any, field: any) => {
//             acc[field.id] = {
//               value: field.type === "select" ? "" : [],
//               name: field.name,
//               id: field.element,
//             };
//             return acc;
//           }, {});
//           setSelectedCustomFields(customFields);
//           console.log(`Selected Custom Fields:`, customFields);
//         }
//       } catch (err: any) {
//         setError(err.message || "Failed to fetch Zendesk custom fields");
//       } finally {
//         setJiraLoading(false);
//       }
//     }
//   };

//   const handleIssueTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedType = e.target.value;
//     setSelectedIssueType(selectedType);
//     const selectedIssue = jiraIssueData.find(
//       (issue: any) => issue.issueType === selectedType
//     );

//     if (selectedIssue) {
//       const customFields = selectedIssue.customFields.reduce(
//         (acc: any, field: any) => {
//           acc[field.id] = {
//             value: field.type === "select" ? "" : [],
//             name: field.name,
//             id: field.id,
//           };
//           return acc;
//         },
//         {}
//       );
//       setSelectedCustomFields(customFields);
//     }
//   };

//   const handleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     e.target.style.height = "auto";
//     e.target.style.height = `${e.target.scrollHeight}px`;
//   };

//   // Add a new field
//   const addField = () => {
//     const newField = {
//       id: uuidv4(),
//       selectedField: "",
//       instructions: "",
//     };

//     setFields((prevFields: any) => [...prevFields, newField]);
//   };

//   // Remove a specific field
//   const removeField = (id: string) => {
//     setFields(fields.filter((field: any) => field.id !== id));
//   };

//   const updateField = (id: string, key: string, value: string) => {
//     setFields((prevFields: any) =>
//       prevFields.map((field: any) =>
//         field.id === id ? { ...field, [key]: value } : field
//       )
//     );
//   };

//   const handleSelectChange = (
//     option: { value: string; label: string } | null
//   ) => {
//     if (option) {
//       console.log("Selected option:", option);
//       setWorkflowagent([option]);
//     } else {
//        setWorkflowagent([]);
//       console.log("Cleared value. setValue called with an empty array");
//     }
//   };

//    const selectedOption = agent.find((option) => option.value === workflowAgent[0]?.value) || null;


//   const excludedApps = [
//     "jira",
//     "freshdesk",
//     "zendesk",
//     "redmine",
//     "servicenow",
//     "slack",
//     "google drive",
//     "teams_phone"
//   ];
//   return (
//     <div className="space-y-2">
//       <div className="flex flex-row justify-between">
//         <label htmlFor="application" className="text-sm font-medium text-black">
//           Application
//         </label>
//         {hasData && (
//           <div>
//             <button
//               onClick={clearFormData}
//               aria-label="Clear Configuration"
//               title="Clear Configuration"
//               className="rounded-md text-black border-black  transition-colors duration-200"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         )}
//       </div>
//       <select
//         id="application"
//         value={applicationName}
//         onChange={handleApplicationChange}
//         className="border border-gray-300 text-black rounded-md w-full p-3"
//       >
//         <option value="">Select an application</option>
//         {loading && <option>Loading...</option>}
//         {error && <option>Error loading endpoints</option>}
//         {!loading &&
//           !error &&
//           appEndpoints.map((app) => (
//             <option key={app.application_id} value={app.application_name}>
//               {app.application_name}
//             </option>
//           ))}
//       </select>

//       {applicationName === "jira" && (
//         <JiraForm
//           selectedApp={selectedApp}
//           handleOperationChange={handleOperationChange}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           jiraLoading={jiraLoading}
//           jiraIssueData={jiraIssueData}
//           handleConfigChange={handleConfigChange}
//           selectedConfigId={selectedConfigId}
//           setIsMaster={setIsMaster}
//           config={config}
//           configLoading={configLoading}
//           error={error}
//           selectedIssueType={selectedIssueType}
//           selectedCustomFields={selectedCustomFields}
//           fields={fields}
//           handleIssueTypeChange={handleIssueTypeChange}
//           updateField={(id, key, value) => updateField(id, key, value)}
//           removeField={(id) => removeField(id)}
//           handleResize={(e) => handleResize(e)}
//           addField={addField}
//         />
//       )}

//       {applicationName === "freshdesk" && (
//         <FreshdeskForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           config={config}
//           configLoading={configLoading}
//           selectedCustomFields={selectedCustomFields}
//           fields={fields}
//           updateField={(id, key, value) => updateField(id, key, value)}
//           removeField={(id) => removeField(id)}
//           handleResize={(e) => handleResize(e)}
//           addField={addField}
//           handleConfigChange={handleConfigChange}
//           selectedConfigId={selectedConfigId}
//         />
//       )}

//       {applicationName === "zendesk" && (
//         <ZendeskForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           config={config}
//           configLoading={configLoading}
//           selectedCustomFields={selectedCustomFields}
//           fields={fields}
//           updateField={(id, key, value) => updateField(id, key, value)}
//           removeField={(id) => removeField(id)}
//           handleResize={(e) => handleResize(e)}
//           addField={addField}
//           handleConfigChange={handleConfigChange}
//           selectedConfigId={selectedConfigId}
//         />
//       )}

//       {applicationName === "redmine" && (
//         <RedmineForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           config={config}
//           configLoading={configLoading}
//           selectedCustomFields={selectedCustomFields}
//           fields={fields}
//           updateField={(id, key, value) => updateField(id, key, value)}
//           removeField={(id) => removeField(id)}
//           handleResize={(e) => handleResize(e)}
//           addField={addField}
//           handleConfigChange={handleConfigChange}
//           selectedConfigId={selectedConfigId}
//         />
//       )}

//       {applicationName === "servicenow" && (
//         <ServiceNowForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           config={config}
//           configLoading={configLoading}
//           selectedCustomFields={selectedCustomFields}
//           fields={fields}
//           value={value}
//           setValue={setValue}
//           updateField={(id, key, value) => updateField(id, key, value)}
//           removeField={(id) => removeField(id)}
//           handleResize={(e) => handleResize(e)}
//           addField={addField}
//           handleConfigChange={handleConfigChange}
//           selectedConfigId={selectedConfigId}
//         />
//       )}

//       {applicationName === "slack" && (
//         <SlackForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           config={config}
//           configLoading={configLoading}
//           value={value}
//           setValue={setValue}
//           error={error}
//           isMaster={isMaster}
//           text="Select Slack Channels"
//         />
//       )}

//       {applicationName === "teams_phone" && (
//         <VoiceForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           error={error}
//           isMaster={isMaster}
//           setWorkflowagent={setWorkflowagent}
//           workflowAgent={workflowAgent}
//         />
//       )}

//       {applicationName === "google drive" && (
//         <GoogleDriveForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           config={config}
//           configLoading={configLoading}
//           value={value}
//           setValue={setValue}
//           error={error}
//           isMaster={isMaster}
//           applicationName={applicationName}
//         />
//       )}

//       {!excludedApps.includes(applicationName) && (
//         <ComonForm
//           selectedApp={selectedApp}
//           selectedOperationId={selectedOperationId}
//           setSelectedOperationId={setSelectedOperationId}
//           config={config}
//           configLoading={configLoading}
//           value={value}
//           setValue={setValue}
//           error={error}
//           isMaster={isMaster}
//           applicationName={applicationName}
//         />
//       )}
//         {/* Show Dropdown only if applicationName is selected */}
//         {applicationName && (
//           <Dropdown
//             heading=""
//             label="Select Voice Agent"
//             options={agent}
//             isMulti={false}
//             value={selectedOption}
//             onChange={handleSelectChange}
//           />
//         )}
//     </div>
//   );
// };

// export default Step3Application;


import { FC, useState, useEffect ,useRef,useId} from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import JiraForm from "../../../workflow/forms/JiraForm";
import FreshdeskForm from "../../../workflow/forms/FreshdeskForm";
import ComonForm from "../../../workflow/forms/commonForm";
import ZendeskForm from "../../../workflow/forms/zendeskForm";
import RedmineForm from "../../../workflow/forms/redmineForm";
import ServiceNowForm from "../../../workflow/forms/Servicenow";
import VoiceForm from "../../../workflow/forms/voiceForm";
import SlackForm from "../../../workflow/forms/slackForm";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import Dropdown from "../../../workflow/common-components/dropdown";
import GoogleDriveForm from "../../../workflow/forms/google-drive";
import { useWidgetStore } from '../../../../stores/widgetStore';
import { getAccessToken, getTenantId, getUrlIdentifier, getUserId, requestApi } from "../../../../services/workflow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ZohoCrmForm from "../../forms/ZohoCrmForm";
import { useZohoStore } from "../../../../stores/useZohoStore";
import ConfluenceForm from "../../forms/ConfluenceForm";

// Shadcn UI imports for Combobox
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils"; // You'll need this utility for conditional classnames
import AsanaForm from "../../forms/AsanaForm";
import ToolSelect from "../../common-components/ToolSelect";
import ThunaiDBForm from "../../forms/ThunaiDBForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AppEndpoint {
  application_id: string;
  application_name: string;
  is_master: boolean;
}

// NEW: Interface for each form instance's state
interface FormInstance {
  id: string;
  applicationName: string;
  isMaster: boolean;
  config: any;
  selectedConfigId: string;
  jiraIssueData: any[];
  selectedIssueType: string;
  selectedCustomFields: any;
  selectedOperationId: string;
  fields: any[];
  value: any[];
  // workflowagent: any[];
  // You might want to include error and loading states per form if needed
  configLoading: boolean;
  jiraLoading: boolean;
  error: string;
  stages?: { name: string } | null; // Added
  selectedAccountName?: string; // Added for Zoho CRM
    reflectProjects?: any[]; // Separate state for reflect projects
  reflectLoading?: boolean; // Separate state for loading status
  tableName?: string; 
   socketUrl?: string[];
   type: string;
}
interface Step3ApplicationProps {
  forms: FormInstance[];
  setForms: React.Dispatch<React.SetStateAction<FormInstance[]>>;
   workflowAgent: any[];
  setWorkflowagent: React.Dispatch<React.SetStateAction<any[]>>;
   showTransfer: boolean;          // Add this
  setShowTransfer: (val: boolean) => void; // Add this
}

const Step3Application: FC<Step3ApplicationProps> = ({ forms, setForms,workflowAgent ,setWorkflowagent,showTransfer,setShowTransfer }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = getAccessToken(); // Assuming you have a function to get the token
  const { widgetId } = useWidgetStore();
  const tenantId = getTenantId()
  const urlIdentifier = getUrlIdentifier()
  const userId = getUserId();
  
  const baseId = useId(); // Generate unique base ID for accessibility
  const [appEndpoints, setAppEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState<Record<string, boolean>>({}); // State to manage individual combobox open/close

  // NEW: State to hold an array of form instances
  // const [forms, setForms] = useState<FormInstance[]>([]);
  const [agent, setAgent] = useState<any[]>([]); // Global agent options
const { toast } = useToast();
const fetchedReflectRef = useRef<Set<string>>(new Set());
  const fetchedConfigRef = useRef<Set<string>>(new Set());
  const fetchedJiraRef = useRef<Set<string>>(new Set());
const prevLengthRef = useRef(forms.length);
const bottomRef = useRef<HTMLDivElement>(null);

// 2. Update the scroll logic to only trigger if the current length is GREATER than previous
useEffect(() => {
  if (forms.length > prevLengthRef.current) {
    const timeoutId = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }
  
  prevLengthRef.current = forms.length;
}, [forms.length]);
  // Helper function to update a specific form's state using its unique ID
  const updateFormState = (formId: string, newState: Partial<FormInstance>) => {
    if (newState.selectedOperationId !== undefined) {
      const newSelectedOpId = newState.selectedOperationId;
 if (newSelectedOpId) {
      const isDuplicate = forms.some(
          (form) => form.id !== formId && form.selectedOperationId === newSelectedOpId
      );
      if (isDuplicate) {
        toast({
          title: "Error",
          description: "This tool is already selected in another form. Please choose a different tool.",
          variant: "destructive",
        });
        return; 
      }
      }
    }
    setForms((prevForms) =>
      prevForms.map((form) => (form.id === formId ? { ...form, ...newState } : form))
    );
  };

  // NEW: Function to add a new form instance
  const addForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      {
        id: uuidv4(),
        applicationName: "",
        isMaster: false,
        config: {},
        selectedConfigId: "",
        jiraIssueData: [],
        selectedIssueType: "",
        selectedCustomFields: {},
        selectedOperationId: "",
        fields: [],
        value: [],
        // workflowAgent: [],
        configLoading: false,
        jiraLoading: false,
        error: "",
         tableName: "",
          socketUrl: [],
          type: "",
      },
    ]);
  };

  const removeForm = (formId: string) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
  };

  const clearFormData = (formId: string) => {
    updateFormState(formId, {
      applicationName: "",
      isMaster: false,
      config: {},
      selectedConfigId: "",
      jiraIssueData: [],
      selectedIssueType: "",
      selectedCustomFields: {},
      selectedOperationId: "",
      fields: [],
      value: [],
      // workflowAgent: [],
      configLoading: false,
      jiraLoading: false,
      error: "",
      socketUrl: [],
      type: "",
    });
  };

  // Keep global app endpoints fetching
  useEffect(() => {
    async function fetchAppEndpoints() {
      try {
        setLoading(true);
        setGlobalError("");
        const response = await requestApi(
          "GET",
          `${tenantId}/application/endpoint/mapping/`,
          null,
          "authService"
        );
        setAppEndpoints(response.data);
      } catch (err: any) {
        setGlobalError(err?.message || "Failed to load application endpoints");
                   toast({
      title: "Error",
      description: err?.response?.message || "Failed to load application endpoints",
      variant: "destructive",
    });
      } finally {
        setLoading(false);
      }
    }

    fetchAppEndpoints();
  }, [token]);


  // Keep global widget config fetching (for voice agents)
  useEffect(() => {
    async function fetchWidgetConfig() {
      try {
        const response = await requestApi(
          "GET",
          `${tenantId}/voice/agent/config/filter/${widgetId}/`,
          null,
          "authService"
        );
        const data = response;
        if (data && data.data) {
          const options = data.data.map((user: any) => ({
            value: user.widget_id,
            label: user.agent_name,
          }));
          setAgent(options);
        }
      } catch (err: any) {
        setGlobalError(err?.message || "Failed to load voice agent configuration");
          toast({
      title: "Error",
      description: err?.response?.message || "Failed to load voice agent configuration",
      variant: "destructive",
    });
      }
    }
    fetchWidgetConfig();


  }, [widgetId, token]);

  const handleApplicationChange = (formId: string, appName: string) => {
    const selectedApp = appEndpoints.find(
      (app) => app.application_name === appName
    );
    if (selectedApp) {
      updateFormState(formId, {
        applicationName: selectedApp.application_name,
        isMaster: selectedApp.is_master,
        config: {}, // Clear config when application changes
        selectedConfigId: "",
        selectedOperationId: "",
        jiraIssueData: [],
        selectedIssueType: "",
        selectedCustomFields: {},
        fields: [],
        value: [],
        // workflowAgent: [],
         socketUrl: [], 
          type: "",
      });
    }
    setOpenCombobox((prev) => ({ ...prev, [formId]: false })); 
  };

  const handleOperationChange = (formId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOpId = e.target.value;   
 const currentForm = forms.find(f => f.id === formId);

    if (!currentForm) return;

    const selectedApp = appEndpoints.find(
      (app) => app.application_name === currentForm.applicationName
    );
    const selectedAction = selectedApp?.tools
      .flatMap((tool: any) => tool.actions)
      .find((action: any) => action.operationId === selectedOpId);

    updateFormState(formId, { selectedOperationId: selectedOpId });
  };

  const fetchReflectProjects = async (formId: string) => {
    const currentForm = forms.find(f => f.id === formId);
    if (!currentForm || currentForm.applicationName !== "reflect") return;

    updateFormState(formId, { reflectLoading: true, error: "" });
    try {
      const response = await requestApi(
        "GET",
        `get/widget/applications/${widgetId}/?app=reflect`,
        null,
        "authService"
      );
      updateFormState(formId, { reflectProjects: response.data || [] });
    } catch (err: any) {
      updateFormState(formId, { error: err?.message || "Failed to load Reflect projects" });
    toast({
      title: "Error",
      description: "Failed to load Reflect projects",
      variant: "destructive",
    });
  } finally {
      updateFormState(formId, { reflectLoading: false });
    }
  };

  const fetchConfigForForm = async (formId: string) => {
    const currentForm = forms.find(f => f.id === formId);
    if (!currentForm || !currentForm.applicationName || !currentForm.selectedOperationId) return;

    updateFormState(formId, { configLoading: true, error: "" });

    try {
      const appName =
        currentForm.applicationName === "mondayCrm"
          ? currentForm.applicationName
          : currentForm.applicationName?.toLowerCase();

      // Removed "servicenow" from excludedApplications
      const excludedApplications = ["zendesk", "teams_phone", "slack", "shopify", "microsoft_teams", "jira", "asana","confluence"];

      let response;
      if (!excludedApplications.includes(appName)) {
        response = await requestApi(
          "GET",
          `get/widget/applications/${widgetId}/?app=${appName}`,
          null,
          "authService"
        );
      } else if (appName === 'slack') {
        response = await requestApi(
          "GET",
          `slackai/v1/${tenantId}/application/workflow/slack/channel/list`,
          null,
          "slackService"
        );
      } else if (appName === 'microsoft_teams') {
        response = await requestApi(
          "GET",
          `teamsai/v1/${tenantId}/application/workflow/teams/channel/list`,
          null,
          "slackService"
        );
      } else if (appName === 'jira') {
        const payload = {
          tenantId: tenantId,
          urlIdentifier: urlIdentifier,
          // userId: userId || "",
        
        }
        response = await requestApi(
          "GET",
          `${tenantId}/thunai/jira/get/sub/projects`,
          payload,
          "gatewayService"
        );
      } else if (appName === 'asana') {
        const payload = {
          tenantId: tenantId, 
          urlIdentifier: urlIdentifier,
        }
        response = await requestApi(
          "GET",
          `${tenantId}/thunai/asana/list/projects`,
          "",
          "gatewayService"
        );
      }else if (appName === 'confluence') {
          const payload = {
          tenant_id: tenantId,
          urlidentifier: urlIdentifier,
        }
         response = await requestApi(
          "POST",
          `thunai/confluence/getprojects`,
          payload,
          "gatewayService"
        );
      }

      if (response) {
        updateFormState(formId, { config: response.data });
      if(appName === 'socket'){
          updateFormState(formId, { type: response.data[0]?.type });
        }
      }
    } catch (err: any) {
      updateFormState(formId, { error: err?.message || "Failed to load configuration" });
        toast({
      title: "Error",
      description: err?.response?.data?.message || "Failed to load configuration",
      variant: "destructive",
    });
    } finally {
      updateFormState(formId, { configLoading: false });
    }
  };

  const fetchJiraIssueTypesForForm = async (formId: string) => {
    const currentForm = forms.find(f => f.id === formId);
    if (!currentForm || !currentForm.selectedConfigId || currentForm.applicationName !== "jira") return;

    updateFormState(formId, { jiraLoading: true, error: "" });

    try {
      const payload = {
        tenantId: tenantId,
        urlIdentifier: urlIdentifier,
        // userId: userId || "",
        key: currentForm.selectedConfigId,
      };
      const response = await requestApi(
        "GET",
        `${tenantId}/thunai/jira/get/issue-key?projectKey=${currentForm.selectedConfigId}`,
        null,
        "gatewayService"
      );
      updateFormState(formId, { jiraIssueData: response.data });
    } catch (err: any) {
      updateFormState(formId, { error: err?.message || "Failed to fetch Jira issue key" });
        toast({
      title: "Error",
      description: err?.response?.message || "Failed to fetch Jira issue key",
      variant: "destructive",
    });
    } finally {
      updateFormState(formId, { jiraLoading: false });
    }
  };

useEffect(() => {
    forms.forEach((form) => {
      const needsConfig = form.applicationName;
      if (needsConfig) {
        const configKey = `${form.id}-${form.applicationName}-${form.selectedOperationId}`;
        if (!fetchedConfigRef.current.has(configKey)) {
          fetchedConfigRef.current.add(configKey);
          fetchConfigForForm(form.id);
        }
      }
      
      if (form.selectedConfigId && form.applicationName === "jira") {
        const jiraKey = `${form.id}-${form.selectedConfigId}`;
        if (!fetchedJiraRef.current.has(jiraKey)) {
          fetchedJiraRef.current.add(jiraKey);
          fetchJiraIssueTypesForForm(form.id);
        }
      }

      if (form.applicationName === "reflect") {
        const reflectKey = `${form.id}-reflect`;
        if (!fetchedReflectRef.current.has(reflectKey)) {
          fetchedReflectRef.current.add(reflectKey);
          fetchReflectProjects(form.id);
        }
      }
    });
  }, [forms, widgetId, tenantId, urlIdentifier, userId, token]);

  useEffect(() => {
    forms.forEach((form) => {
      const includeApps = ["servicenow"];
      if (includeApps.includes(form.applicationName) && form.selectedOperationId) {
        const configKey = `${form.id}-${form.applicationName}-${form.selectedOperationId}`;
        if (!fetchedJiraRef.current.has(configKey)) {
          fetchedJiraRef.current.add(configKey);
          handleConfigChange(form.id, {
            target: { value: form.selectedConfigId || "" }
          } as React.ChangeEvent<HTMLSelectElement>);
        }
      } else if (form.selectedConfigId && form.applicationName && form.selectedOperationId) {
        const configKey = `${form.id}-${form.selectedConfigId}`;
        if (!fetchedJiraRef.current.has(configKey)) {
          fetchedJiraRef.current.add(configKey);
          handleConfigChange(form.id, {
            target: { value: form.selectedConfigId }
          } as React.ChangeEvent<HTMLSelectElement>);
        }
      }
    });
  }, [forms.map((f) => `${f.id}-${f.applicationName}-${f.selectedOperationId}-${f.selectedConfigId}`).join(',')]);

  const handleConfigChange = async (formId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedConfigId = e.target.value;
    updateFormState(formId, { selectedConfigId });

    const currentForm = forms.find(f => f.id === formId);
    if (!currentForm) return;

 if (currentForm.applicationName === "jira" && currentForm.selectedOperationId) {
      updateFormState(formId, { jiraLoading: true, error: "" });
      try {
        const payload = {
          tenantId: tenantId,
          urlIdentifier: urlIdentifier,
          // userId: userId || "",
          key: selectedConfigId,
        };
        const response = await requestApi(
          "GET",
          `${tenantId}/thunai/jira/get/issue-key?projectKey=${selectedConfigId}`,
          null,
          "gatewayService"
        );
        const data = response;
        updateFormState(formId, { jiraIssueData: data.data });
        const selectedIssue = data.data.find(
          (issue: any) => issue.issueType === currentForm.selectedIssueType
        );

        if (selectedIssue) {
          const customFields = selectedIssue.customFields.reduce(
            (acc: any, field: any) => {
              acc[field.id] = {
                value: field.type === "select" ? "" : [],
                name: field.name,
                id: field.id,
              };
              return acc;
            },
            {}
          );
          updateFormState(formId, { selectedCustomFields: customFields });
        }
      } catch (err: any) {
        updateFormState(formId, { error: err?.message || "Failed to fetch Jira issue key" });
                   toast({
      title: "Error",
      description: err?.response?.message || "Failed to fetch fetch Jira issue key",
      variant: "destructive",
    });
      } finally {
        updateFormState(formId, { jiraLoading: false });
      }
    } else if (currentForm.applicationName === "freshdesk" && currentForm.selectedOperationId) {
      updateFormState(formId, { jiraLoading: true, error: "" });
      try {
        if (currentForm.selectedOperationId === "createFreshdeskTicket") {
          const payload = {
            tenantId: tenantId,
            urlIdentifier: urlIdentifier,
            userId: userId || "",
          };
          const response = await requestApi(
            "POST",
            "freshdesk/get/custom-fields",
            payload,
            "intService"
          );

          const data = response;
          updateFormState(formId, { jiraIssueData: data.data });
          if (data.data) {
            const customFields = data.data.reduce((acc: any, field: any) => {
              acc[field.id] = {
                value: field.type === "select" ? "" : [],
                name: field.name,
                id: field.id,
              };
              return acc;
            }, {});
            updateFormState(formId, { selectedCustomFields: customFields });
          }
        } else {
          updateFormState(formId, { selectedCustomFields: {} });
        }
      } catch (err: any) {
        updateFormState(formId, { error: err?.message || "Failed to fetch Freshdesk custom fields" });
                   toast({
      title: "Error",
      description: err?.response?.message || "Failed to fetch Freshdesk custom fields",
      variant: "destructive",
    });
      } finally {
        updateFormState(formId, { jiraLoading: false });
      }
    } else if (currentForm.applicationName === "zendesk" && currentForm.selectedOperationId) {
      updateFormState(formId, { jiraLoading: true, error: "" });
      try {
        const payload = {
          tenantId: tenantId,
          // widgetId: widgetId,
          urlIdentifier: urlIdentifier,
          // projectId: selectedConfigId,
          // userId: userId || "",
        };
        const response = await requestApi(
          "GET",
          `${tenantId}/thunai/zendesk/get/custom-fields`,
          payload,
          "gatewayService"
        );

        const data = response;
        updateFormState(formId, { jiraIssueData: data.data });
        if (data.data) {
      const customFields = data.data
  .filter((field: any) => {
    return !Array.isArray(field.custom_field_options);
  })
  .reduce((acc: any, field: any) => {
            acc[field.id] = {
              value: field.type === "select" ? "" : [],
              name: field.title,
              id: field.id,
            };
            return acc;
          }, {});
          updateFormState(formId, { selectedCustomFields: customFields });
          console.log(`Selected Custom Fields for ${formId}:`, customFields);
        }
      } catch (err: any) {
        updateFormState(formId, { error: err?.message || "Failed to fetch Zendesk custom fields" });
               toast({
      title: "Error",
      description: err?.response?.message || "Failed to fetch Zendesk custom fields",
      variant: "destructive",
    });
      } finally {
        updateFormState(formId, { jiraLoading: false });
      }
    } else if (currentForm.applicationName === "redmine" && currentForm.selectedOperationId) {
      updateFormState(formId, { jiraLoading: true, error: "" });
      try {
        const payload = {
          tenantId: tenantId,
          urlIdentifier: urlIdentifier,
          userId: userId || "",
        };
        const response = await requestApi(
          "POST",
          "redmine/get/custom-fields",
          payload,
          "intService"
        );

        const data = response;
        updateFormState(formId, { jiraIssueData: data.data });
        if (data.data) {
          const customFields = data.data.reduce((acc: any, field: any) => {
            acc[field.id] = {
              value: field.type === "select" ? "" : [],
              name: field.name,
              id: field.id,
            };
            return acc;
          }, {});
          updateFormState(formId, { selectedCustomFields: customFields });
          console.log(`Selected Custom Fields for ${formId}:`, customFields);
        }
      } catch (err: any) {
        updateFormState(formId, { error: err?.message || "Failed to fetch Redmine custom fields" });
               toast({
      title: "Error",
      description: err?.response?.message || "Failed to fetch Redmine custom fields",
      variant: "destructive",
    });
      } finally {
        updateFormState(formId, { jiraLoading: false });
      }
    } else if (currentForm.applicationName === "servicenow" && currentForm.selectedOperationId) {
      console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
      updateFormState(formId, { jiraLoading: true, error: "" });
      try {
        let table_name = "incident";
        let incidentArray = [
          "createServiceNowIncident",
          "UpdateServiceNowIncidentDetails",
          "checkExistingServiceNowIncident",
          "checkExistingServiceNowIncidentByKey",
          "linkServiceNowIncidents",
        ];
        let problemArray = [
          "createServiceNowProblem",
          "UpdateServiceNowProblemDetails",
          "checkExistingServiceNowProblems",
          "checkExistingServiceNowProblemsByKey",
          "linkServiceNowProblems",
        ];
        let taskArray = [
          "createServiceNowTask",
          "UpdateServiceNowTaskDetails",
          "checkExistingServiceNowTask",
          "checkExistingServiceNowTaskByKey",
          "linkServiceNowTask",
        ];
        let changeRequestArray = [
          "createServiceNowChangeRequest",
          "UpdateServiceNowChangeRequestDetails",
          "checkExistingServiceNowChangeRequest",
          "checkExistingServiceNowChangeRequestByKey",
          "linkServiceNowChangeRequest",
        ];
        let catalogRequestArray = [
          "createServiceCatalogRequest",
        ]
        if (incidentArray.includes(currentForm.selectedOperationId)) {
          table_name = "incident";
        } else if (problemArray.includes(currentForm.selectedOperationId)) {
          table_name = "problem";
        } else if (taskArray.includes(currentForm.selectedOperationId)) {
          table_name = "task";
        } else if (changeRequestArray.includes(currentForm.selectedOperationId)) {
          table_name = "change_request";
        } else if(catalogRequestArray.includes(currentForm.selectedOperationId)) {
          table_name = "sc_request";
        }

        const payload = {
          tenantId: tenantId,
          urlIdentifier: urlIdentifier,
          userId: userId || "",
          widgetId: widgetId,
          table_name: table_name,
        };
        const response = await requestApi(
          "POST",
          `${tenantId}/thunai/servicenow/custom-fields/list`,
          payload,
          "gatewayService"
        );

        const data = response;
        updateFormState(formId, { jiraIssueData: data.data });
        if (data.data) {
          const customFields = data.data.reduce((acc: any, field: any) => {
            acc[field.id] = {
              value: field.type === "select" ? "" : [],
              name: field.name,
              id: field.element,
            };
            return acc;
          }, {});
          updateFormState(formId, { selectedCustomFields: customFields });
          console.log(`Selected Custom Fields for ${formId}:`, customFields);
        }
      } catch (err: any) {
        updateFormState(formId, { error: err?.message || "Failed to fetch ServiceNow custom fields" });
        console.log(err?.message)
          toast({
      title: "Error",
      description: err?.response?.message || "Failed to fetch ServiceNow custom fields",
      variant: "destructive",
    });
      } finally {
        updateFormState(formId, { jiraLoading: false });
      }
    }else if (currentForm.applicationName === "asana" && currentForm.selectedOperationId) {
  updateFormState(formId, { jiraLoading: true, error: "" });

  try {
    const payload = {
      tenantId: tenantId,
      urlIdentifier: urlIdentifier,
      projectId: selectedConfigId,
    };

    const response = await requestApi(
      "GET",
      `${tenantId}/thunai/asana/get/custom-fields?projectId=${selectedConfigId}`,
      payload,
      "gatewayService"
    );

    const data = response;
    updateFormState(formId, { jiraIssueData: data.data });

    if (data.data) {
      const customFields = data.data.reduce((acc: any, field: any) => {
        acc[field.gid] = {
          value: field.type === "enum" ? "" : "",
          name: field.name,
          id: field.gid,
          type: field.type,
          enumOptions: field.enum_options || [],
        };
        return acc;
      }, {});

      updateFormState(formId, { selectedCustomFields: customFields });
      console.log(`Selected Custom Fields for ${formId} (Asana):`, customFields);
    }
  } catch (err: any) {
    updateFormState(formId, {
      error: err?.message || "Failed to fetch Asana custom fields",
    });

    toast({
      title: "Error",
      description: err?.response?.message || "Failed to fetch Asana custom fields",
      variant: "destructive",
    });
  } finally {
    updateFormState(formId, { jiraLoading: false });
  }
}
  }

  const handleIssueTypeChange = (formId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const currentForm = forms.find(f => f.id === formId);
    if (!currentForm) return;

    if (currentForm.applicationName === "zoho-crm") {
      const { accounts } = useZohoStore.getState();
      const selectedAccount = accounts.find((account: any) => account.id === selectedId);
      updateFormState(formId, {
      selectedIssueType: selectedId,
      selectedConfigId: selectedAccount ? selectedAccount.Account_Name : "", // Store the Account_Name
      selectedCustomFields: {},
    });
  } else {
    // Existing logic for Jira and other applications
    const selectedIssue = currentForm.jiraIssueData.find(
      (issue: any) => issue.issueType === selectedId // Use selectedId here
    );

    if (selectedIssue) {
      const customFields = selectedIssue.customFields.reduce(
        (acc: any, field: any) => {
          acc[field.id] = {
            value: field.type === "select" ? "" : [],
            name: field.name,
            id: field.id,
          };
          return acc;
        },
        {}
      );
        updateFormState(formId, { selectedIssueType: selectedId, selectedCustomFields: customFields });
    }
  }
};


  const handleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const addField = (formId: string) => {
    const currentForm = forms.find(f => f.id === formId);
    const newField = { id: uuidv4(), selectedField: "", instructions: "" };
    updateFormState(formId, { fields: [...(currentForm?.fields || []), newField] });
  };

  const removeField = (formId: string, fieldId: string) => {
    const currentForm = forms.find(f => f.id === formId);
    updateFormState(formId, { fields: (currentForm?.fields || []).filter((field: any) => field.id !== fieldId) });
  };

  const updateField = (formId: string, fieldId: string, key: string, value: string) => {
    const currentForm = forms.find(f => f.id === formId);
    updateFormState(formId, {
      fields: (currentForm?.fields || []).map((field: any) =>
        field.id === fieldId ? { ...field, [key]: value } : field
      ),
    });
  };

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [forms]);

  const handleSelectChange = (option: { value: string; label: string } | null) => {
    setWorkflowagent(option ? [option] : []);
  };

           const selectedOption = agent.find((option) => option.value === workflowAgent[0]?.value) || null;


  const excludedApps = [
    "jira",
    "freshdesk",
    "zendesk",
    "redmine",
    "servicenow",
    "slack",
    "google drive",
    "teams_phone",
    "zoho-crm",
    "confluence",
    "asana",
     "reflect","thunaidb","socket"
  ];

  return (
    <div className="space-y-4">
      {/* NEW: Button to add a new form */}
     <div className="sticky top-0 right-6 flex justify-end w-full bg-white z-10 py-2 ">
<Button
  onClick={addForm}
  className=" flex items-center gap-1 bg-blue-500 text-white   shadow-lg hover:bg-blue-600 transition-all "
>
  <Plus className="h-5 w-5" />
  Add
</Button>
</div>

      {forms.map((form) => {
        const selectedApp = appEndpoints.find((app) => app.application_name === form.applicationName);
        const uniqueFormId = `${baseId}-${form.id}`;

        return (
          <div key={form.id} className="border p-4 rounded-md space-y-2 relative">
          <button 
   // Crucial fix for "all forms removed" issue
  onClick={(e) => {
    e.preventDefault(); // Extra safety
    removeForm(form.id);
  }} 
  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
>
  <Trash2 size={18} />
</button>

            <div className="flex flex-row justify-between">
              <label htmlFor={uniqueFormId} className="text-sm font-medium text-black">
                Integration
              </label>
            </div>
            
            <Popover
              open={openCombobox[form.id]}
              onOpenChange={(isOpen) => setOpenCombobox((prev) => ({ ...prev, [form.id]: isOpen }))}
            >
              <PopoverTrigger asChild>
                <Button
                  id={uniqueFormId}
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox[form.id]}
                  className="w-full justify-between border border-gray-300 text-black rounded-md p-3 hover:bg-transparent hover:border-gray-300 hover:text-black"
                >
                  <span>
                    {appEndpoints.find((app) => app.application_name === form.applicationName)?.application_name || 
     form.applicationName || 
     "Select an Integration..."}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

  <PopoverContent className="p-0 w-[430px]  overflow-y-auto">
    <Command>
      <CommandInput placeholder="Search integration..." />

      <CommandList className="">
        <CommandEmpty>No application found.</CommandEmpty>

        <CommandGroup>
          {loading && <CommandItem disabled>Loading...</CommandItem>}
          {globalError && (
            <CommandItem disabled>Error loading endpoints</CommandItem>
          )}

          {!loading &&
            !globalError &&
            appEndpoints.map((app) => (
              <CommandItem
                key={app.application_id}
                value={app.application_name}
                onSelect={() =>
                             handleApplicationChange(form.id, app.application_name)}
                        >
  <Check
    className={cn(
      "mr-2 h-4 w-4",
      form.applicationName === app.application_name ? "opacity-100" : "opacity-0"
    )}
  />
                {app.application_name}
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
{form.applicationName === "reflect" && (
  <div className="space-y-2 mb-4">
    <label className="text-sm font-medium text-black">
      {form.reflectLoading ? "Loading Projects..." : "Select Reflect Project"}
    </label>
    <select
      className="w-full border border-gray-300 rounded-md p-2 text-sm"
      value={form.selectedConfigId}
      onChange={(e) => updateFormState(form.id, { selectedConfigId: e.target.value })}
    >
      <option value="">Select a project...</option>
      {form.reflectProjects?.map((project: any) => (
        <option key={project.project_id} value={project.project_id}>
          {project.project_name}
        </option>
      ))}
    </select>
  </div>
)}

{/* Keep CommonForm visible for Reflect to select operations/tools */}
{(form.applicationName === "reflect" || form.applicationName === "socket") && (
  <ToolSelect
        selectedApp={selectedApp}
        selectedOperationId={form.selectedOperationId}
        setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
      />
)}


  {form.applicationName === "socket" && form.selectedOperationId && form?.config[0]?.type === "external" && (
              <Dropdown
                heading=""
                label="Socket URLs"
                placeholder="Select or enter socket URLs..."
                options={
                  Array.isArray(form.config) && form.config[0]?.socket_urls
                    ? form.config[0].socket_urls.map((url: string) => ({
                        value: url,
                        label: url,
                      }))
                    : []
                }
                isMulti={true}
                value={
                  Array.isArray(form.socketUrl)
                    ? form.socketUrl.map((url: any) => ({
                        value: url,
                        label: url,
                      }))
                    : []
                }
                onChange={(selectedUrls: any) => 
                  updateFormState(form.id, { 
                    socketUrl: Array.isArray(selectedUrls) 
                      ? selectedUrls.map((item: any) => item.value) 
                      : [],
                    type: "external"
                  })
                }
              />
            )}
            {form.applicationName === "jira" && (
              <JiraForm
                selectedApp={selectedApp}
                handleOperationChange={(e) => handleOperationChange(form.id, e)}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                jiraLoading={form.jiraLoading}
                jiraIssueData={form.jiraIssueData}
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
                setIsMaster={(isMaster) => updateFormState(form.id, { isMaster })}
                config={form.config}
                configLoading={form.configLoading} // Use form-specific loading state
                error={form.error} // Use form-specific error state
                selectedIssueType={form.selectedIssueType}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                handleIssueTypeChange={(e) => handleIssueTypeChange(form.id, e)}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
              />
            )}


            {form.applicationName === "freshdesk" && (
              <FreshdeskForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
              />
            )}
  {form.applicationName === "asana" && (
              <AsanaForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
                
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
              />
            )}
            {form.applicationName === "zendesk" && (
              <ZendeskForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
              />
            )}

            {form.applicationName === "redmine" && (
              <RedmineForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
              />
            )}

            {form.applicationName === "servicenow" && (
              <ServiceNowForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                value={form.value}
                setValue={(val) => updateFormState(form.id, { value: val })}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
              />
            )}

            {form.applicationName === "slack" && (
              <SlackForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                value={form.value}
                setValue={(val) => updateFormState(form.id, { value: val })}
                error={form.error}
                isMaster={form.isMaster}
                text="Select Slack Channels"
              />
            )}

            {form.applicationName === "teams_phone" && (
              <VoiceForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                error={form.error}
                isMaster={form.isMaster}
               setWorkflowagent={setWorkflowagent}
          workflowAgent={workflowAgent}
              />
            )}

            {form.applicationName === "google drive" && (
              <GoogleDriveForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                value={form.value}
                setValue={(val) => updateFormState(form.id, { value: val })}
                error={form.error}
                isMaster={form.isMaster}
                applicationName={form.applicationName}
              />
            )}
             
 {form.applicationName === "zoho-crm" && (
              <ZohoCrmForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
                value={form.value}
                setValue={(val) => updateFormState(form.id, { value: val })}
                error={form.error}
                isMaster={form.isMaster}
                applicationName={form.applicationName}
                handleIssueTypeChange={(e) => handleIssueTypeChange(form.id, e)}
                selectedIssueType={form.selectedIssueType}
                currentFormStages={form.stages}
                onStageChange={(stageData) => updateFormState(form.id, { stages: stageData })}
              />
            )}
             {form.applicationName === "confluence" && (
              <ConfluenceForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                selectedCustomFields={form.selectedCustomFields}
                fields={form.fields}
                updateField={(fieldId, key, value) => updateField(form.id, fieldId, key, value)}
                removeField={(fieldId) => removeField(form.id, fieldId)}
                handleResize={handleResize}
                addField={() => addField(form.id)}
                handleConfigChange={(e) => handleConfigChange(form.id, e)}
                selectedConfigId={form.selectedConfigId}
                 value={form.value}
                setValue={(val) => updateFormState(form.id, { value: val })}
                error={form.error}
                isMaster={form.isMaster}
                applicationName={form.applicationName}
              
              />
            )}
              {form.applicationName === "thunaidb" && (
             <ThunaiDBForm
    selectedApp={selectedApp}
    selectedOperationId={form.selectedOperationId}
    setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
    tableName={form.tableName} // Pass separate state
    setTableName={(name) => updateFormState(form.id, { tableName: name })} // Updater
    config={form.config}
    configLoading={form.configLoading}
    selectedCustomFields={form.selectedCustomFields}
    fields={form.fields}
    selectedConfigId={form.selectedConfigId}
    value={form.value}
    setValue={(val) => updateFormState(form.id, { value: val })}
    error={form.error}
    isMaster={form.isMaster}
    applicationName={form.applicationName}
  />
            )}
            {!excludedApps.includes(form.applicationName) && (
              <ComonForm
                selectedApp={selectedApp}
                selectedOperationId={form.selectedOperationId}
                setSelectedOperationId={(opId) => updateFormState(form.id, { selectedOperationId: opId })}
                config={form.config}
                configLoading={form.configLoading}
                value={form.value}
                setValue={(val) => updateFormState(form.id, { value: val })}
                error={form.error}
                isMaster={form.isMaster}
                applicationName={form.applicationName}
              />
            )}
           
          </div>
         
        );
      })}
  <div ref={bottomRef} className="h-2" />
      <div className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="enableTransfer" className="text-sm font-medium text-black cursor-pointer">
            Enable Agent to Agent Transfer
          </Label>
          <Switch id="enableTransfer" checked={showTransfer} onCheckedChange={setShowTransfer} />
        </div>
        {showTransfer && (
          <Dropdown
            heading=""
            placeholder="Select voice agent..."
            options={agent}
            isMulti={false}
            value={selectedOption}
            onChange={handleSelectChange}
          />
        )}
      </div>
    </div>
  );
};

export default Step3Application;
