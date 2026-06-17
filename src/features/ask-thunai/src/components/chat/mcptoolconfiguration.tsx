import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  AsanaChannelList,
  ConfluenceList,
  getconfiguration,
  GithubIssuesList,
  JiraIssueList,
  JiraProjectlList,
  MicrosoftTeamsList,
  saveconfiguration,
  SlackChannelList,
  ToolsList,
  ZohoCRMAccountList,
  ZohoCRMStagesList,
} from "../../services/configuration";
import { toast } from "@/components/ui/use-toast";
import { getTenantId, getUserId, getUrlIdentifier } from "@/services/authService";

export function MCPToolConfiguration({ selectedTools, onChange }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [issaving, setIssaving] = useState(false);
  const tanent_id = getTenantId();
  const urlIdentifier = getUrlIdentifier();
  const user_id = getUserId();
const userInfo= localStorage.getItem("user_info") || {};
  // store form field values
  const [formValues, setFormValues] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownErrors, setDropdownErrors] = useState({});
console.log("Initializing user info:", userInfo);
  const updateFieldValue = (appName, fieldName, value, app) => {
    // For GitHub, when selecting a project, store BOTH id and name
    if (
      appName === "github_issues" ||
      (appName === "asana" && fieldName === "project_name")
    ) {
      const selectedOption = dynamicOptions[appName]?.[fieldName]?.find(
        (opt) => opt.value === value
      );

      setFormValues((prev) => ({
        ...prev,
        [appName]: {
          ...prev[appName],
          project_name: selectedOption?.projectName || value,
          project_id: selectedOption?.projectId || value,
        },
      }));
    } else {
      // Normal update for other fields
      setFormValues((prev) => ({
        ...prev,
        [appName]: {
          ...prev[appName],
          [fieldName]: value,
        },
      }));
    }

    // If user picked a Jira project → load issue types
    if (appName === "jira" && fieldName === "project_name") {
      // fetchJiraIssues(value, app);
       const selectedOption = dynamicOptions[appName]?.[fieldName]?.find(
      (opt) => opt.value === value
    );
    fetchJiraIssues(value, selectedOption?.key, app);
    }
  };

  // Helper to set loading state for specific dropdown
  const setDropdownLoading = (appName, fieldName, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [`${appName}_${fieldName}`]: isLoading,
    }));
  };
  const setDropdownError = (appName, fieldName, message = null) => {
    setDropdownErrors((prev) => ({
      ...prev,
      [appName]: {
        ...prev[appName],
        [fieldName]: message, // null = no error
      },
    }));
  };

  // fetch all mcp tools
  const getToolsList = async () => {
    try {
      const res = await ToolsList("");
      setApps(res.data?.apps || []);
    } catch (err) {
       toast({
        title: "Failed to load Data!",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to Load Data.",
        variant: "destructive",
      });
      console.error("Error fetching MCP tools:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved config and prefill
  useEffect(() => {
    const fetchSavedConfig = async () => {
      try {
        const res = await getconfiguration();
        const data = res.data;

        if (!data || !data.apps) return;

        const enabledApps = data.apps.map((a) => a.app_name);
        onChange(enabledApps);

        const mappedValues = {};
        data.apps.forEach((a) => {
          mappedValues[a.app_name] = a.fields;
        });
        setFormValues(mappedValues);
        for (const a of data.apps) {
          const app = apps.find((x) => x.app_name === a.app_name);
          if (!app) continue;

          if (a.app_name === "jira") {
            const projects = await fetchJiraProjects(app, app.fields);
            if (a.fields.project_name && projects.length > 0) {
              const value = a.fields.project_name;
              const selectedOption = projects.find(
                (opt) => opt.value === value
              );
              fetchJiraIssues(a.fields.project_name, selectedOption?.key, app);
            }
          }
          if (a.app_name === "slack") fetchSlackChannels(app.fields, app);
          if (a.app_name === "asana") fetchAsanaChannels(app.fields, app);
          if (a.app_name === "github_issues")
            fetchGithubIssues(app.fields, app);
          if (a.app_name === "confluence") fetchConfluence(app.fields, app);
          if (a.app_name === "zoho-crm") {
            fetchZohoAccounts(app.fields, app);
            fetchZohoStages(app.fields, app);
          }
          if (a.app_name === "microsoft_teams")
            fetchMicrosoftTeams(app.fields, app);
        }
      } catch (err) {
        console.error("Error loading saved config:", err);
        toast({
        title: "Failed to load Data!",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to Load Data.",
        variant: "destructive",
      });
      }
    };

    if (!loading && apps.length > 0) {
      fetchSavedConfig();
    }
  }, [loading, apps]);

  useEffect(() => {
    getToolsList();
  }, []);

  // -----------------------------
  // 🔵 DYNAMIC API LOADERS
  // -----------------------------
  const fetchJiraProjects = async (app, f) => {
    setDropdownLoading(app.app_name, "project_name", true);
    setDropdownError(app.app_name, "project_name", null);

    try {
      const payload = {
        tenantId: tanent_id,
        urlIdentifier: urlIdentifier,
        userId: user_id,
      };

      const res = await JiraProjectlList(payload);

      const mappedproject = res.data.map((p) => ({
        label: p.name,
        value: p.id,
        key: p.key,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          project_name: mappedproject,
        },
      }));
      
      return mappedproject; // Return the mapped projects for use in useEffect
    } catch (err) {
      console.error("Failed to load Jira Projects", err);
      setDropdownError(
        app.app_name,
        "project_name",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load projects"
      );
      toast({
        title: "Failed to load Jira Projects",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while fetching Jira Projects.",
        variant: "destructive",
      });
      return []; // Return empty array on error
    } finally {
      setDropdownLoading(app.app_name, "project_name", false);
    }
  };

  const fetchJiraIssues = async (projectKey,projectName, app) => {
    setDropdownLoading(app.app_name, "issue_type", true);
    setDropdownError(app.app_name, "issue_type", null);

    try {
      const payload = {
        tenantId: tanent_id,
        urlIdentifier: urlIdentifier,
        userId: user_id,
        key: projectKey,
        projectKey: projectName
      };

      const res = await JiraIssueList(payload);

      const mappedIssue = res.data.map((p) => ({
        label: p.issueType,
        value: p.issueType,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          issue_type: mappedIssue,
        },
      }));
    } catch (err) {
      console.error("Error fetching Jira issues:", err);
      setDropdownError(
        app.app_name,
        "issue_type",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load Jira issues"
      );
      toast({
        title: "Failed to load Jira issues",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while fetching Jira issues.",
        variant: "destructive",
      });
    } finally {
      setDropdownLoading(app.app_name, "issue_type", false);
    }
  };
  //   const fetchZohoAccounts = async (fields, app) => {
  //   const fieldName = "issue_type";
  //   setDropdownLoading(app.app_name, fieldName, true);

  //   try {
  //     const payload = {
  //       tenantId: tanent_id,
  //       userId: user_id,
  //     };

  //     const res = await ZohoCRMAccountList(payload);

  //     const options = res.data.data.map((p) => ({
  //       label: p.Account_Name,
  //       value: p.id,
  //     }));

  //     setDynamicOptions((prev) => ({
  //       ...prev,
  //       [app.app_name]: {
  //         ...prev[app.app_name],
  //         [fieldName]: options,
  //       },
  //     }));
  //   } catch (err) {
  //     console.error("Zoho Accounts error:", err);
  //   } finally {
  //     setDropdownLoading(app.app_name, fieldName, false);
  //   }
  // };

  const fetchZohoAccounts = async (fields, app) => {
    const fieldName = "issue_type";
    setDropdownLoading(app.app_name, fieldName, true);

    setDropdownError(app.app_name, fieldName, null); // clear old error

    try {
      const payload = {
        tenantId: tanent_id,
        userId: user_id,
      };

      const res = await ZohoCRMAccountList(payload);

      const options = res.data.data.map((p) => ({
        label: p.Account_Name,
        value: p.id,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          [fieldName]: options,
        },
      }));
    } catch (error) {
      console.error("Zoho Accounts error:", error);
      setDropdownError(
        app.app_name,
        fieldName,
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load projects"
      );
      toast({
        title: "Failed to load Zoho accounts",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching Zoho accounts.",
        variant: "destructive",
      });
    } finally {
      setDropdownLoading(app.app_name, fieldName, false);
    }
  };

  const fetchZohoStages = async (fields, app) => {
    const fieldName = "stage";
    setDropdownLoading(app.app_name, fieldName, true);
    setDropdownError(app.app_name, fieldName, null); // clear old error
    try {
      const payload = {
        tenantId: tanent_id,
        userId: user_id,
      };

      const res = await ZohoCRMStagesList(payload);

      const options = res.data.map((p) => ({
        label: p,
        value: p,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          [fieldName]: options,
        },
      }));
    } catch (error) {
      console.error("Zoho Stages error:", error);
      setDropdownError(
        app.app_name,
        fieldName,
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load projects"
      );
      toast({
        title: "Failed to load Zoho Stages",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while fetching Zoho accounts.",
        variant: "destructive",
      });
    } finally {
      setDropdownLoading(app.app_name, fieldName, false);
    }
  };

  const fetchAsanaChannels = async (f, app) => {
    f.forEach((field) => setDropdownLoading(app.app_name, field.name, true));
    setDropdownError(app.app_name, f, null); // clear old error
    try {
      const payload = {
        tenantId: tanent_id,
        userId: user_id,
      };

      const res = await AsanaChannelList(payload);

      const mapped = res.data.map((c) => ({
        label: c.name,
        value: c.id,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          ...Object.fromEntries(f.map((field) => [field.name, mapped])),
        },
      }));
    } catch (err) {
      console.error("Error fetching Asana channels:", err);
      setDropdownError(
        app.app_name,
        f,
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load projects"
      );
      toast({
        title: "Failed to load Asana channels",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while fetching Asana channels.",
        variant: "destructive",
      });
    } finally {
      f.forEach((field) => setDropdownLoading(app.app_name, field.name, false));
    }
  };

  const fetchSlackChannels = async (f, app) => {
    f.forEach((field) => setDropdownLoading(app.app_name, field.name, true));
    f.forEach((field) => setDropdownError(app.app_name, field.name, null));
    try {
      const payload = {
        tenantId: tanent_id,
        userId: user_id,
      };

      const res = await SlackChannelList(payload);
      // const mapped= mockdata;
      const mapped = res.data.map((c) => ({
        label: c.name,
        value: c.id,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          ...Object.fromEntries(f.map((field) => [field.name, mapped])),
        },
      }));
    } catch (err) {
      console.error("Error fetching Slack channels:", err);
      f.forEach((field) =>
        setDropdownError(
          app.app_name,
          field.name,
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load Slack channels"
        )
      );
      toast({
        title: "Failed to load Slack channels",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while fetching Slack channels.",
        variant: "destructive",
      });
    } finally {
      f.forEach((field) => setDropdownLoading(app.app_name, field.name, false));
    }
  };

  const fetchGithubIssues = async (f, app) => {
    f.forEach((field) => setDropdownLoading(app.app_name, field.name, true));
    f.forEach((field) => setDropdownError(app.app_name, field.name, null));
    try {
      const payload = {
        tenant_id: tanent_id,
      };

      const res = await GithubIssuesList(payload);

      const mapped = res.data.data.map((c) => ({
        label: c.title,
        value: c.id,
        projectId: c.id,
        projectName: c.title,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          ...Object.fromEntries(f.map((field) => [field.name, mapped])),
        },
      }));
    } catch (err) {
      console.error("Error fetching GitHub issues:", err);
      f.forEach((field) =>
        setDropdownError(
          app.app_name,
          field.name,
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load GitHub issues"
        )
      );
      toast({
        title: "Failed to load Github Issues",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while fetching Microsoft Teams.",
        variant: "destructive",
      });
    } finally {
      f.forEach((field) => setDropdownLoading(app.app_name, field.name, false));
    }
  };

  const fetchMicrosoftTeams = async (f, app) => {
    f.forEach((field) => setDropdownLoading(app.app_name, field.name, true));
    f.forEach((field) => setDropdownError(app.app_name, field.name, null));
    try {
      const payload = {
        tenantId: tanent_id,
        userId: user_id,
      };

      const res = await MicrosoftTeamsList(payload);

      const mapped = res.data.map((c) => ({
        label: c.name,
        value: c.id,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          ...Object.fromEntries(f.map((field) => [field.name, mapped])),
        },
      }));
    } catch (err) {
      console.error("Error fetching Microsoft Teams:", err);
      f.forEach((field) =>
        setDropdownError(
          app.app_name,
          field.name,
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load Microsoft Teams channels"
        )
      );
      toast({
        title: "Failed to load Microsoft Teams channels",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while fetching Microsoft Teams channels.",
        variant: "destructive",
      });
    } finally {
      f.forEach((field) => setDropdownLoading(app.app_name, field.name, false));
    }
  };
  const fetchConfluence = async (f, app) => {
    f.forEach((field) => setDropdownLoading(app.app_name, field.name, true));
    try {
      const payload = {
        tenant_id: tanent_id,
        urlidentifier: urlIdentifier,
      };

      const res = await ConfluenceList(payload);

      const mapped = res.data.map((c) => ({
        label: c.name,
        value: c.id,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [app.app_name]: {
          ...prev[app.app_name],
          ...Object.fromEntries(f.map((field) => [field.name, mapped])),
        },
      }));
    } catch (err) {
      console.error("Error fetching Confluence:", err);
      toast({
        title: "Failed to load Confluence Space",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while fetching Confluence Space.",
        variant: "destructive",
      });
    } finally {
      f.forEach((field) => setDropdownLoading(app.app_name, field.name, false));
    }
  };

  const toggleTool = (appName, app, fields) => {
    const updated = selectedTools.includes(appName)
      ? selectedTools.filter((t) => t !== appName)
      : [...selectedTools, appName];

    onChange(updated);

    if (!selectedTools.includes(appName)) {
      if (appName === "jira") {
        fetchJiraProjects(app, fields);
      }
      if (appName === "slack") {
        fetchSlackChannels(fields, app);
      }
      if (appName === "github_issues") {
        fetchGithubIssues(fields, app);
      }
      if (appName === "microsoft_teams") {
        fetchMicrosoftTeams(fields, app);
      }
      if (appName === "confluence") {
        fetchConfluence(fields, app);
      }
      if (appName === "zoho-crm") {
        fetchZohoAccounts(fields, app);
        fetchZohoStages(fields, app);
      }
      if (appName === "asana") {
        fetchAsanaChannels(fields, app);
      }
    }
  };

  const buildPayload = () => {
    return {
      apps: selectedTools.map((appName) => ({
        app_name: appName,
        fields: formValues[appName] || {},
      })),
    };
  };

  const saveConfiguration = async () => {
    const payload = buildPayload();
    console.log("FINAL PAYLOAD:", payload);

    try {
      setIssaving(true);
      const res = await saveconfiguration(payload);
      console.log("Saved:", res);
      setIssaving(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to save configuration.",
        variant: "destructive",
      });
      setIssaving(false);
      console.error("Save failed:", err);
    }
  };
  const shouldShowField = (appName, fieldIndex, fields) => {
    if (appName !== "jira") return true; // apply only for JIRA

    // Always show the first field
    if (fieldIndex === 0) return true;

    // For field N, check if field N-1 has value
    const previousField = fields[fieldIndex - 1];
    const previousValue = formValues[appName]?.[previousField.name];

    return Boolean(previousValue);
  };
  return (
    <div className="flex min-h-[85vh] max-h-[85vh] flex-col relative">
      <h1 className="font-bold flex items-center gap-2 text-sm">
        MCP Tool Configuration
      </h1>

      <div className="space-y-3 pr-1 mt-3 overflow-auto scrollbar-hide mb-16">
        {loading ? (
          // <div className="h-screen mx-auto  items-center gap-2 text-xs text-primary">
          //   <Loader2 className="h-5 w-5 animate-spin" />
          //   Loading tools...
          // </div>
           <div className="w-full h-full flex items-center justify-center gap-2 text-xs text-primary">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span>Loading tools...</span>
  </div>
        ) : (
          apps.map((app) => (
            <div
              key={app.app_name}
              className="border p-2 rounded-lg bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm flex items-center gap-2">
                  {app.label || app.app_name}
                </h3>

                <input
                  type="checkbox"
                  className="w-3 h-3 accent-blue-600 cursor-pointer"
                  checked={selectedTools.includes(app.app_name)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleTool(app.app_name, app, app.fields)}
                />
              </div>

              {selectedTools.includes(app.app_name) && (
                <div className="space-y-4 mt-3">
                  {app.fields.map((f, index) => {
                    // show JIRA fields step-by-step
                    if (!shouldShowField(app.app_name, index, app.fields)) {
                      return null;
                    }
                    const fieldError = dropdownErrors?.[app.app_name]?.[f.name];
                    const dynamic =
                      dynamicOptions[app.app_name]?.[f.name] || [];
                    const combinedOptions = [...(f.options || []), ...dynamic];
                    const selectedList =
                      formValues[app.app_name]?.[f.name] || [];
                    const isLoading =
                      loadingStates[`${app.app_name}_${f.name}`];
                    const selectedValue =
                      app.app_name === "github_issues" &&
                      f.name === "project_name"
                        ? formValues[app.app_name]?.project_id
                        : selectedList;

                    const selectedOption = combinedOptions.find(
                      (o) => o.value === selectedValue
                    );

                    // const [openDropdown, setOpenDropdown] = useState<string | null>(null);
                    const isOpen = openDropdown === `${app.app_name}-${f.name}`;
                    return (
                      <div
                        key={f.name}
                        className="p-3 border rounded-md bg-gray-50"
                      >
                        <p className="font-medium text-xs">{f.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.description}
                        </p>
                        {fieldError && (
                          <p className="text-xs text-red-500 mt-1">
                            {fieldError}
                          </p>
                        )}
                        <div className="mt-3">
                          {f.type === "text" && (
                            <input
                              type="text"
                              placeholder={f.placeholder}
                              className="w-full p-2 border rounded text-xs"
                              value={selectedList || ""}
                              onChange={(e) =>
                                updateFieldValue(
                                  app.app_name,
                                  f.name,
                                  e.target.value,
                                  app
                                )
                              }
                            />
                          )}

                          {/* {f.type === "list" && !f.multi_select && (
                            <div className="relative">
                                <select
                                  className="w-full p-2 border rounded text-xs"
                                  value={
                                    app.app_name === "github_issues" &&
                                    f.name === "project_name"
                                      ? formValues[app.app_name]?.project_id || ""
                                      : selectedList
                                  }
                                  onChange={(e) =>
                                    updateFieldValue(
                                      app.app_name,
                                      f.name,
                                      e.target.value,
                                      app
                                    )
                                  }
                                >
                                  <option value="">{f.placeholder}</option>
                                  {isLoading ? (
                                <div className="w-full p-2 border rounded text-xs bg-white flex items-center gap-2 text-gray-500">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Loading options...
                                </div>):
                                   combinedOptions.length === 0 ? (
    <option value="" disabled className=" p-4 h-10">
      No options available
    </option>
  ) : (
    combinedOptions.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))
  )}
                                 
                                </select>
                              
                            </div>
                          )} */}
                          {f.type === "list" && !f.multi_select && (
                            <div className="space-y-2 mt-2">
                              {/* Input box */}
                              <div className="relative">
                                <div
                                  className={`min-h-[40px] w-full px-3 py-2 pr-10 text-sm border rounded-md flex items-center
    ${
      fieldError
        ? "border-red-500 bg-gray-100 cursor-not-allowed"
        : "border-gray-300 bg-white cursor-pointer"
    }
  `}
                                  // className="min-h-[40px] w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md cursor-pointer bg-white flex items-center"
                                  onClick={() => {
                                    if (fieldError) return;
                                    setOpenDropdown(
                                      isOpen
                                        ? null
                                        : `${app.app_name}-${f.name}`
                                    );
                                  }}
                                >
                                  {selectedValue ? (
                                    <span className="text-sm">
                                      {selectedOption?.label ||
                                        "Select option..."}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      {f.placeholder || "Select option..."}
                                    </span>
                                  )}
                                </div>

                                {/* Chevron */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenDropdown(
                                      isOpen
                                        ? null
                                        : `${app.app_name}-${f.name}`
                                    )
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                  {isOpen ? (
                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  )}
                                </button>
                              </div>

                              {/* Dropdown */}
                              {isOpen && (
                                <div className="border border-gray-300 rounded-md shadow-lg bg-white max-h-60 overflow-y-auto">
                                  {/* Search */}
                                  <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                      setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search..."
                                    className="m-2 w-[calc(100%-1rem)] p-2 border border-gray-300 rounded text-xs"
                                  />

                                  {isLoading ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 py-3 px-3">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Loading options...
                                    </div>
                                  ) : (
                                    (() => {
                                      const filtered = searchQuery
                                        ? combinedOptions.filter((o) =>
                                            o.label
                                              .toLowerCase()
                                              .includes(
                                                searchQuery.toLowerCase()
                                              )
                                          )
                                        : combinedOptions;

                                      if (filtered.length === 0) {
                                        return (
                                          <div className="text-xs text-gray-500 py-3 px-3">
                                            {searchQuery
                                              ? "No matching options"
                                              : "No options available"}
                                          </div>
                                        );
                                      }

                                      return (
                                        <div className="py-1">
                                          {filtered.map((o) => (
                                            <div
                                              key={o.value}
                                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 ${
                                                selectedList === o.value
                                                  ? "bg-blue-50 text-blue-700"
                                                  : ""
                                              }`}
                                              onClick={() => {
                                                updateFieldValue(
                                                  app.app_name,
                                                  f.name,
                                                  o.value,
                                                  app
                                                );
                                                setOpenDropdown(null);
                                                setSearchQuery("");
                                              }}
                                            >
                                              {o.label}
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {f.type === "list" && f.multi_select && (
                            <div className="space-y-2 mt-2">
                              {/* Input Box with Selected Items Inside */}
                              <div className="relative">
                                <div
                                  className={`${
                                    fieldError
                                      ? "border-red-500 bg-gray-100 cursor-not-allowed"
                                      : "border-gray-300 bg-white cursor-pointer"
                                  } min-h-[40px] max-h-[50px] scrollbar-hide overflow-y-auto w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 `}
                                  // onClick={() => {
                                  //   setIsDropdownOpen(true);
                                  //   document.getElementById(`search-input-${f.name}`)?.focus();
                                  // }}
                                  onClick={() => {
                                    if (fieldError) return;
                                    setOpenDropdown(
                                      isOpen
                                        ? null
                                        : `${app.app_name}-${f.name}`
                                    );
                                    document
                                      .getElementById(`search-input-${f.name}`)
                                      ?.focus();
                                  }}
                                >
                                  {selectedList.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      {selectedList.map((value) => {
                                        const option = combinedOptions.find(
                                          (o) => o.value === value
                                        );
                                        return (
                                          <span
                                            key={value}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs whitespace-nowrap"
                                          >
                                            {option?.label || value}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updated =
                                                  selectedList.filter(
                                                    (v) => v !== value
                                                  );
                                                updateFieldValue(
                                                  app.app_name,
                                                  f.name,
                                                  updated,
                                                  app
                                                );
                                              }}
                                              className="hover:text-blue-900 hover:bg-blue-200 rounded"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 text-sm">
                                      Select options...
                                    </div>
                                  )}
                                </div>

                                {/* Toggle Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenDropdown(
                                      isOpen
                                        ? null
                                        : `${app.app_name}-${f.name}`
                                    )
                                  }
                                  className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                  {isOpen ? (
                                    <ChevronUp className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  )}
                                </button>
                              </div>

                              {/* Collapsible Dropdown with Fixed Height */}
                              {isOpen && (
                                <div className="border border-gray-300 rounded-md shadow-lg bg-white max-h-60 scrollbar-hide overflow-y-auto">
                                  <input
                                    id={`search-input-${f.name}`}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                      setSearchQuery(e.target.value)
                                    }
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="m-2 w-[calc(100%-1rem)] p-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Search..."
                                  />{" "}
                                  {isLoading ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 py-3 px-3">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Loading options...
                                    </div>
                                  ) : (
                                    (() => {
                                      const filtered = searchQuery
                                        ? combinedOptions.filter((o) =>
                                            o.label
                                              .toLowerCase()
                                              .includes(
                                                searchQuery.toLowerCase()
                                              )
                                          )
                                        : combinedOptions;

                                      return filtered.length === 0 ? (
                                        <div className="text-xs text-gray-500 py-3 px-3">
                                          {searchQuery
                                            ? "No matching options"
                                            : "No options available"}
                                        </div>
                                      ) : (
                                        <div className="py-1">
                                          {filtered.map((o) => (
                                            <label
                                              key={o.value}
                                              className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={selectedList.includes(
                                                  o.value
                                                )}
                                                onChange={(e) => {
                                                  let updated = [];

                                                  if (e.target.checked) {
                                                    updated = [
                                                      ...selectedList,
                                                      o.value,
                                                    ];
                                                  } else {
                                                    updated =
                                                      selectedList.filter(
                                                        (v) => v !== o.value
                                                      );
                                                  }

                                                  updateFieldValue(
                                                    app.app_name,
                                                    f.name,
                                                    updated,
                                                    app
                                                  );
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                              />
                                              <span>{o.label}</span>
                                            </label>
                                          ))}
                                        </div>
                                      );
                                    })()
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="absolute bottom-5 w-full bg-white pt-3 flex justify-end border-t">
        <button
          onClick={saveConfiguration}
          disabled={issaving}
          className="px-4 py-2 text-xs bg-blue-600 text-white rounded-md flex items-center gap-2 disabled:opacity-60"
        >
          {issaving && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{issaving ? "Saving..." : "Save Configuration"}</span>
        </button>
      </div>
    </div>
  );
}
