import { FC } from "react";
import MultiSelectDropdown from "../common-components/slackMultiselectDropdown";
import { useLocation } from "react-router-dom";
import ToolSelect from "../common-components/ToolSelect";
import { getUserId } from "../../../services/workflow";

interface FreshdeskFormProps {
  selectedApp: any;
  selectedOperationId: string;
  setSelectedOperationId: (id: string) => void;
  config: any[];
  configLoading: boolean;
  value: any[];
  setValue: (value: any[]) => void;
  error: string | null;
  isMaster?: boolean;
  text?: string;
  applicationName?: string;
}

const SlackForm: FC<FreshdeskFormProps> = ({
  selectedApp,
  selectedOperationId,
  setSelectedOperationId,
  config,
  configLoading,
  value,
  setValue,
  error,
  isMaster,
  text,
  applicationName,
}) => {
  const excludedApps = ["teams_phone"];
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = getUserId()
  
  return (
    <>
      {/* {selectedApp && (
        <div>
          <h4 className="text-md font-medium mt-4 text-black pb-2">
            Select Tool
          </h4>
          <select
            value={selectedOperationId}
            onChange={(e) => setSelectedOperationId(e.target.value)}
            className="border border-gray-300 text-black rounded-md w-full p-3"
          >
            <option value="">Select a Tool</option>
            {selectedApp.tools.flatMap((tool: any) =>
              tool.actions.map((action: any) => (
                <option key={action.operationId} value={action.operationId}>
                  {action.operationId} - {action.name}
                </option>
              ))
            )}
          </select>
        </div>
      )} */}

 <ToolSelect
        selectedApp={selectedApp}
        selectedOperationId={selectedOperationId}
        setSelectedOperationId={setSelectedOperationId}
      />

      {!excludedApps.includes(applicationName) &&
     
        selectedOperationId && (
          <MultiSelectDropdown
            config={config}
            value={value}
            setValue={setValue}
            configLoading={configLoading}
            error={error}
            text={text}
            userId={userId}
          />
        )}
    </>
  );
};

export default SlackForm;
