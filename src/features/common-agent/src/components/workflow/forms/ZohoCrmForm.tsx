import { FC, useEffect } from "react";
import CustomFields from "../../../components/workflow/common-components/customFields";
import MultiSelectDropdown from "../common-components/multiSelectDropdown";
import { useZohoStore } from "../../../stores/useZohoStore";
import ToolSelect from "../common-components/ToolSelect";

interface ZohoCrmFormProps {
  selectedApp: any;
  selectedOperationId: string;
  setSelectedOperationId: (id: string) => void;
  config: any[];
  configLoading: boolean;
  selectedCustomFields?: any[];
  fields?: any[];
  updateField: (id: string, key: string, value: string) => void;
  removeField: (id: string) => void;
  handleResize: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  addField: () => void;
  handleConfigChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedConfigId?: string;
  value: any[];
  setValue: (value: any[]) => void;
  error: string | null;
  isMaster?: boolean;
  text?: string;
  applicationName?: string;
   handleIssueTypeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
selectedIssueType?:string;
 currentFormStages: { name: string;} | null; // New prop
  onStageChange: (stageData: { name: string;  } | null) => void; // New callback

}

const ZohoCrmForm: FC<ZohoCrmFormProps> = ({
  selectedApp,
  selectedOperationId,
  setSelectedOperationId,
  config,
  configLoading,
  selectedCustomFields,
  fields,
  updateField,
  removeField,
  handleResize,
  addField,
  handleConfigChange,
  selectedConfigId,
   value,
  setValue,
  error,
  isMaster,
  text,
  applicationName,
   handleIssueTypeChange,
   selectedIssueType,
    currentFormStages,
  onStageChange,
   
}) => {
    const restrictCustomFields = ['createFreshdeskTicket'];
    const acountsAndStages=['createZohoDeals']
    const { accounts, loading, fetchAccounts,fetchStages,stages,stagesLoading } = useZohoStore();
  useEffect(() => {
    fetchAccounts();
    fetchStages()
    console.log("Fetched Zoho Accounts:", accounts);
  }, [fetchAccounts,fetchStages]);
const handleStageSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedStageName = e.target.value;
  if (selectedStageName) {
    const newStageData = { name: selectedStageName};
    onStageChange(newStageData);
  } else {
    onStageChange(null);
  }
};

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
  {/* {selectedApp && (
        <div>
          <h4 className="text-md font-medium mt-4 text-black">Select Tool</h4>
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

      {selectedOperationId && (
                <>
          {console.log("MultiSelectDropdown value prop:", value)} {/* Add this line */}
          <MultiSelectDropdown
             config={config}
             value={value}
             setValue={setValue}
             configLoading={configLoading}
             error={error}
             text={text}
              applicationName={applicationName}
           />
        </>

      )}
  {acountsAndStages.includes(selectedOperationId) && selectedOperationId && (
    
           <div>
            <label
              htmlFor="issueType"
              className="text-sm font-medium text-black"
            >
              Accounts
            </label>
            <select
              id="issueType"
              value={selectedIssueType}
              onChange={handleIssueTypeChange}
              className="border border-gray-300 text-black rounded-md w-full p-3"
            >
              <option value="">Select account</option> {/* Correct text */}
              {loading && <option>Loading ...</option>}
                 {!loading && // Use issueTypesLoading
              accounts.map((issueType) => ( // Map over issueTypes
                <option key={issueType.id} value={issueType.id}>
                  {issueType.Account_Name} {/* Assuming issueType has a Name property */}
                </option>
              ))}
            </select>
          </div>
      )}
     {acountsAndStages.includes(selectedOperationId) && selectedOperationId && (
        <div className="mt-4">
          <label htmlFor="stages" className="text-sm font-medium text-black">
            Stages
          </label>
          <select
            id="stages"
            value={currentFormStages?.name || ""}
            onChange={handleStageSelectChange}
            className="border border-gray-300 text-black rounded-md w-full p-3"
          >
            <option value="">Select Stage</option>
            {stagesLoading && <option>Loading...</option>}
            {!stagesLoading &&
              stages.map((stageName: string, index: number) => (
                <option key={index} value={stageName}>
                  {stageName}
                </option>
              ))}
          </select>
        </div>
      )}
      {/* {restrictCustomFields.includes(selectedOperationId) && selectedConfigId && (
        <CustomFields
          fields={fields}
          selectedCustomFields={selectedCustomFields}
          updateField={updateField}
          removeField={removeField}
          handleResize={handleResize}
          addField={addField}
        />
      )} */}
    </>
  );
};

export default ZohoCrmForm;
