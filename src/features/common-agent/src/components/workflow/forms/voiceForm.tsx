import { FC } from "react";
import MultiSelectDropdown from "../common-components/multiSelectDropdown";
import Dropdown from "../common-components/dropdown";
import ToolSelect from "../common-components/ToolSelect";

interface FreshdeskFormProps {
  selectedApp: any;
  selectedOperationId: string;
  setSelectedOperationId: (id: string) => void;
  error: string | null;
  isMaster?: boolean;
  text?: string;
  applicationName?: string;
  setWorkflowagent?: any;
  workflowAgent?: any;
}

const VoiceForm: FC<FreshdeskFormProps> = ({
  selectedApp,
  selectedOperationId,
  setSelectedOperationId,
  error,
  isMaster,
  text,
  applicationName,
  setWorkflowagent,
  workflowAgent,
}) => {

const handleSelectChange = (
    option: { value: string; label: string } | null
  ) => {
    if (option) {
      console.log("Selected option:", option);
      setWorkflowagent([option]);
    } else {
       setWorkflowagent([]);
      console.log("Cleared value. setValue called with an empty array");
    }
  };

  //  const selectedOption = config.find((option) => option.value === workflowAgent[0]?.value) || null;

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

      {/* {selectedOperationId && (
        <Dropdown
          heading=""
          label="Select Voice Agent"
          options={config}
          isMulti={false}
          value={selectedOption}
          onChange={handleSelectChange}
        />
      )} */}
    </>
  );
};

export default VoiceForm;
