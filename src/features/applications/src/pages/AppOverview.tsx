import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import AppInformation from "../components/AppInformation";
import CategoryChips from "../components/CategoryChips";
import DisconnectedAppSection from "../components/DisconnectedAppSection";
import DynamicAppConfig from "../components/DynamicAppConfig";
import ConnectedAccounts from "../components/ConnectedAccounts";
import ConnectionButtons from "../components/ConnectionButtons";
import RedirectUri from "../components/RedirectUri";
import { useApplicationStore } from "../store/applicationStore";
import { useConfigureStore } from "../store/configureStore";
import { UserInfo } from "../types/UserInfo";
import { isAppConnected, isFieldsEmpty } from "../utils/helpers";
import { customAppConfig } from "../utils/customAppConfig";
// import { ApplicationItem } from "@/types/ApplicationItem";

const AppOverview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [connectClick, setConnectClick] = useState<boolean>(false);
  const [viewConnectedAccount, setViewConnectedAccount] = useState<boolean>(false)

  const appName = searchParams.get("name");
  const userInfo: UserInfo = JSON.parse(localStorage.getItem("userInfo"));
  const { applications, loading, loadFiles } = useApplicationStore();
  // const { list, loading: listLoading, loadFiles: loadList } = useListStore();
  const {
    configureItem,
    loading: configureLoading,
    loadFiles: loadConfigure,
  } = useConfigureStore();
  const application = useMemo(
    () => (applications.length > 0 ? applications[0] : ({} as any)),
    [applications]
  );


  const apps = ["slack", "microsoft_teams"];
  const appType: "DYNAMIC_APP" | "CUSTOM_APP" = !apps.includes(application.name)
    ? "DYNAMIC_APP"
    : "CUSTOM_APP";

  const isConnectedOrActionApp =
    application?.is_connected || application?.action_application_id;

  const isOauthApp = application.oauth_flow && !application.is_oauth_connected;

  const components = isConnectedOrActionApp ? isOauthApp ? application.configure_dynamic_fields : application.dynamic_fields : application.configure_dynamic_fields || [];

  // const showDisconnectedView = !isConnectedOrActionApp;



  const configureId = useMemo(() => {
    let id: string | null = null;
    const app = application; // Use the derived application object


    // 1. Connected App Logic (Find the ID for fetching saved fields)
    if (app.is_connected || app.action_application_id) {
      if (app.oauth_flow && !app.is_oauth_connected) {
        id = app.application_id; // Use primary ID for OAuth re-auth/config
      } else if (!isFieldsEmpty(app?.action_fields)) {
        id = app.action_application_id; // Use action ID if action fields exist
      } else if (!isFieldsEmpty(app?.fields)) {
        id = app.application_id; // Use primary ID if general fields exist
      } else {
        id = app.action_application_id; // Fallback to action ID
      }
    } else {
      id = app.action_application_id || null;
    }
    // 2. Disconnected App Logic (ID is often null, so no initial call needed here)
    // The initial call happens implicitly inside ConnectionButtons/DynamicAppConfig logic when hitting "Configure"

    return id;
  }, [application]);

  useEffect(() => {
    const filter = [{ key_name: "name", key_value: appName, operator: "==" }];
    loadFiles(filter);
    // loadList();
  }, [appName, loadFiles]);


  useEffect(() => {
    if (configureId) {
      loadConfigure(configureId);
    }
  }, [configureId, loadConfigure]);

  return (
    <div className="text-grayy-900">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-[25%] lg:h-screen bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="flex flex-col items-start mb-8">
            {/* App Logo */}
            <AppLogo
              loading={loading}
              src={application.logo}
              alt={application.display_name}
            />

            {/* App Information */}
            <AppInformation
              loading={loading}
              description={application.details?.description}
            />
          </div>

          {/* Categories of the App */}
          <CategoryChips
            loading={loading}
            categories={application.categories}
          />
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-[60%] flex flex-col items-center px-2 xl:px-[5rem]">
          <div className="w-full max-w-screen-2xl pt-4">
            <button
              className="text-blue-600 mb-4 hidden lg:inline-block cursor-pointer"
              onClick={() => navigate("/applications")}
            >
              ← Back
            </button>
            <div className="flex items-center flex-col md:flex-row md:justify-between mb-4">
              <h2 className="text-md md:text-xl font-semibold text-gray-900">
                {`${application.display_name ?? ""} ${application.action_application_id || application.is_connected
                  ? "Action"
                  : "Configure"
                  }`}
              </h2>
              {!loading && (
                <ConnectionButtons application={application} setConnectClick={setConnectClick} setViewConnectedAccount={setViewConnectedAccount} />
              )}
            </div>
            {application.display_name === "Slack" && (
              <p>
                <span className="font-semibold mr-1">Note:</span>Configuration
                settings are unavailable for archived channels. Please unarchive
                before configuring.
              </p>
            )}
          </div>

          {/* Form Section */}
          <div className="w-full max-w-screen-2xl rounded-lg">
            <div className="md:max-h-[70vh] overflow-y-auto">
              {!isAppConnected(application) && !connectClick && (
                <DisconnectedAppSection
                  loading={loading}
                  features={application.details?.features}
                  caseStudies={application.details?.case_studies}
                />
              )}
              <div>
                {(isAppConnected(application) || connectClick) && (
                  <DynamicAppConfig
                    appType={appType}
                    loading={configureLoading}
                    application={application}
                    fields={appType === "CUSTOM_APP" ? customAppConfig.find(app => app.name === appName).components : components}
                    savedValues={application.action_application_id ? configureItem?.action_fields || [] : configureItem?.fields || []}
                  />

                )}
              </div>
            </div>
          </div>
          {viewConnectedAccount && <ConnectedAccounts application={application} userInfo={userInfo} onClose={() => setViewConnectedAccount(false)} />}
        </div >
        {application?.static_fields?.redirect_uri?.value && <RedirectUri uriValue={application.static_fields?.redirect_uri?.value} />}
      </div >
    </div >
  );
};

export default AppOverview;
