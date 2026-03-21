import React, { useCallback, useMemo } from "react";
import SetupGuideButton from "../components/SetupGuideButton";
import ConfirmDisconnect from "../components/ui/ConfirmDisconnect";
import { useApplicationStore } from "../store/applicationStore";
import { ApplicationItem } from "../types/ApplicationItem";
import { UserInfo } from "../types/UserInfo";
import { isFieldsEmpty } from "../utils/helpers";
import Modal from "../components/ui/Modal";


interface ConnectionButtonsProps {
  application: ApplicationItem
  setConnectClick: React.Dispatch<React.SetStateAction<boolean>>
  setViewConnectedAccount: React.Dispatch<React.SetStateAction<boolean>>
}
const ConnectionButtons: React.FC<ConnectionButtonsProps> = ({
  application,
  setConnectClick,
  setViewConnectedAccount
}) => {
  const userInfo: UserInfo = JSON.parse(localStorage.getItem("userInfo"));

  const { disconnectApp } = useApplicationStore();


  const connect = () => {
    if (
      application.oauth_flow &&
      !application.is_connected &&
      !application.is_oauth_connected
    ) {
      if (
        application?.admin_configure_enable &&
        !isFieldsEmpty(application.fields)
      ) {
        setConnectClick(true);
      } else {
        window.location.href = `https://api.thunai.ai/oauth-service/oauth/v1/${application.name
          }${application.admin_configure_enable
            ? `/${userInfo.default_tenant_id}`
            : ""
          }/auth/login`;
      }
    } else if (
      application.oauth_flow &&
      application.is_connected &&
      !application.is_oauth_connected
    ) {
      window.location.href = `https://api.thunai.ai/oauth-service/oauth/v1/${application.name
        }${application.admin_configure_enable
          ? `/${userInfo.default_tenant_id}`
          : ""
        }/auth/login`;
    } else {
      setConnectClick(true);
    }
    
  };

  const showManageAccountButton = useMemo((): boolean => {
    if (!application) return false;

    const hasNoFields =
      !application.fields || Object.keys(application.fields).length === 0;
    const hasAppId = !!application.application_id;

    return application.multiple_account && (hasNoFields || hasAppId);
  }, [application]);

  const showConnectButton = useMemo((): boolean => {
    const {
      oauth_flow,
      is_oauth_connected,
      is_connected,
      action_application_id,
      multiple_account,
      fields,
    } = application;

    return (
      ((oauth_flow && !is_oauth_connected) ||
        !(is_connected || action_application_id)) &&
      (!multiple_account || (multiple_account && !isFieldsEmpty(fields)))
    );
  }, [application]);

  const showDisconnectButton = useMemo((): boolean => {
    const multiAccountConfigureNeeded =
      !application.multiple_account ||
      (application.multiple_account && !isFieldsEmpty(application.fields));

    return (
      (application.is_connected || application.action_application_id) &&
      multiAccountConfigureNeeded
    );
  }, [application]);

  const connectionStatus = useCallback(
    (action: string): string => {
      const {
        name,
        admin_configure_enable,
        oauth_flow,
        is_connected,
        is_oauth_connected,
        action_application_id,
      } = application;

      if (
        oauth_flow &&
        !(is_connected || action_application_id) &&
        !is_oauth_connected
      ) {
        if (admin_configure_enable && !isFieldsEmpty(application.fields)) {
          return action === "CONNECT" ? "Configure" : "Remove Configure";
        } else {
          return action === "CONNECT" ? "Connect" : "Disconnect";
        }
      } else if (
        oauth_flow &&
        (is_connected || action_application_id) &&
        !is_oauth_connected
      ) {
        if (action === "CONNECT") {
          return "Connect";
        } else {
          return name.toLowerCase() === "salesforce"
            ? "Remove Configuration"
            : "Disconnect";
        }
      } else {
        return action === "CONNECT" ? "Connect" : "Disconnect";
      }
    },
    [application]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Setup Guide Navigation Button */}
      <SetupGuideButton docsUrl={application.docs_uri} />

      {/* Connect/Disconnect Buttons */}
      <div className="flex flex-wrap gap-2">
        {showConnectButton && (
          <button
            className="flex items-center justify-center text-gray-600 border border-gray-300 rounded-md px-3 sm:px-4 py-1 shadow hover:bg-gray-50 transition-all duration-200 min-w-[80px] text-xs sm:text-sm cursor-pointer"
            onClick={() => connect()}
          >
            {connectionStatus("CONNECT")}
          </button>
        )}
        {application.name === "salesforce" &&
          !!application.is_oauth_connected && (
            <Modal>
              <Modal.Open opens="disconnect-oauth">
                <button className="flex items-center justify-center text-gray-600 border border-gray-300 rounded-md px-3 sm:px-4 py-1 shadow hover:bg-gray-50 transition-all duration-200 min-w-[80px] text-xs sm:text-sm">
                  Disconnect Oauth
                </button>
              </Modal.Open>
              <Modal.Window name="disconnect-oauth" showCloseButton={false}>
                <ConfirmDisconnect title="Disconnect Oauth" content="Do you want to Disconnect the Oauth" onConfirm={() => disconnectApp(application, "DISCONNECT_OAUTH")} />
              </Modal.Window>
            </Modal>
          )}

        {showDisconnectButton && (
          <Modal>
            <Modal.Open opens="disconnect">
              <button className="flex items-center justify-center text-gray-600 border border-gray-300 rounded-md px-3 sm:px-4 py-1 shadow hover:bg-gray-50 transition-all duration-200 min-w-[80px] text-xs sm:text-sm cursor-pointer">
                {connectionStatus("DISCONNECT")}
              </button>
            </Modal.Open>
            <Modal.Window name="disconnect" showCloseButton={false}>
              <ConfirmDisconnect title="Disconnect Application" content="Do you want to Disconnect the Application" onConfirm={() => disconnectApp(application)} />
            </Modal.Window>
          </Modal>
        )}
      </div>

      {/* Manage Account Button */}
      {showManageAccountButton && (
        <div className="flex">
          <button className="flex items-center justify-center text-gray-600 border border-gray-300 rounded-md px-3 py-1 shadow transition-all duration-200 min-w-[100px] text-xs cursor-pointer hover:bg-gray-50 sm:px-4 sm:text-sm" onClick={() => setViewConnectedAccount(true)}>
            Manage Account
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionButtons;
