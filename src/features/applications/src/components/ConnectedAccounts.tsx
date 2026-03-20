import { IconButton, Tooltip } from "@mui/material";
import { ApplicationItem } from "../types/ApplicationItem";
import { UserInfo } from "../types/UserInfo";
import { useRef } from "react";
import { useApplicationStore } from "../store/applicationStore";
import Modal from "../components/ui/Modal";
import ConfirmDisconnect from "../components/ui/ConfirmDisconnect";

interface ConnectedAccountsProps {
  application: ApplicationItem;
  userInfo: UserInfo
  onClose: () => void
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({
  application,
  userInfo,
  onClose
}) => {
  const { disconnectApp } = useApplicationStore();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const identities = application.application_identities ?? [];

  const connectNewAccount = () => {
    const googleLoginUrl = `https://api.thunai.ai/oauth-service/oauth/v1/${application.name}${application.name === 'x_twitter' ? '/' + userInfo.default_tenant_id : ''}/auth/login`;

    window.location.href = googleLoginUrl;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 flex items-end justify-end bg-gray-900/50 z-3 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div ref={sidebarRef} className="bg-white dark:bg-gray-800 rounded-l-2xl shadow-2xl w-full max-w-md h-full transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden">
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Connected Accounts
              </h2>
            </div>
            <Tooltip title="Add Account">
              <IconButton size="small" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => connectNewAccount()}>

                <span className="material-icons">add</span>
              </IconButton>
              {/* <button
                className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
              </button> */}
            </Tooltip>
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-150px)]">
          {/* No Connected Accounts Message */}
          {!identities.length && (
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg">
              <div className="text-center">
                <div className="mb-6 opacity-60"></div>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No Connected Accounts
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Connect your first account to get started
                </p>
              </div>
            </div>
          )}

          {/* Connected Accounts List */}
          {identities.map((app, i) => (
            <div key={i} className="flex items-center justify-between p-4 mb-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center space-x-4">
                <span className="material-icons text-indigo-500 dark:text-indigo-400">
                  account_circle
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {app}
                </span>
              </div>

              <Modal>
                <Modal.Open opens="disconnect-account">
                  <button
                    className="px-4 py-2 flex items-center text-[#005cbb] font-semibold rounded-full text-sm transition-all duration-300 ease-in-out transform shadow-md cursor-pointer hover:scale-105 hover:shadow-lg"
                  >
                    <span className="material-icons mr-2">link</span>
                    Disconnect
                  </button>
                </Modal.Open>
                <Modal.Window name="disconnect-account" showCloseButton={false}>
                  <ConfirmDisconnect title="Disconnect Application" content="Do yuo want to Disconnect the Application" onConfirm={() => disconnectApp(application, "DELINK_PARTICULAR_ACC", i)} />
                </Modal.Window>
              </Modal>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
