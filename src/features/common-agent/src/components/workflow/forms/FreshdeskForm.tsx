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

const FreshdeskForm: FC<FreshdeskFormProps> = ({
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
    const restrictCustomFields = ['createFreshdeskTicket'];
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

      {selectedOperationId && (
        <div>
          <label htmlFor="configure" className="text-sm font-medium text-black">
            Configure
          </label>
          <select
            id="configure"
            value={selectedConfigId}
            onChange={handleConfigChange}
            className="border border-gray-300 text-black rounded-md w-full p-3"
          >
            <option value="">Select a project</option>
            {configLoading && <option>Loading...</option>}
            {!configLoading &&
  Array.isArray(config) &&
  config.map((app: any) => (
    <option key={app.id} value={app.id}>
      {app.name}
    </option>
  ))}

          </select>
        </div>
      )}
      {restrictCustomFields.includes(selectedOperationId) && selectedConfigId && (
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

export default FreshdeskForm;
