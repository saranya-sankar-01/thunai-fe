import { FC } from "react";
import CustomFields from "../../../components/workflow/common-components/customFields";
import ToolSelect from "../common-components/ToolSelect";

interface FreshdeskFormProps {
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
}

const ZendeskForm: FC<FreshdeskFormProps> = ({
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
}) => {
  const restrictCustomFields = ['createZendeskTicket'];
  const handleToolChange = (operationId: string) => {
  const syntheticEvent = {
    target: { value: operationId }
  } as any;

  handleConfigChange?.(syntheticEvent);
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
            onChange={(e) => {
              setSelectedOperationId(e.target.value);
              handleConfigChange(e);
            }}
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
  onToolChange={handleToolChange}
/>


      { restrictCustomFields.includes(selectedOperationId) && selectedApp && selectedOperationId && (
        <CustomFields
          fields={fields}
          selectedCustomFields={selectedCustomFields}
          updateField={updateField}
          removeField={removeField}
          handleResize={handleResize}
          addField={addField}
        />
      )}
    </>
  );
};

export default ZendeskForm;
