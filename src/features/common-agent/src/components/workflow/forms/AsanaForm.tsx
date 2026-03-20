import { FC } from "react";
import CustomFields from "../../../components/workflow/common-components/customFields";
import ToolSelect from "../common-components/ToolSelect";

interface AsanaFormProps {
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

const AsanaForm: FC<AsanaFormProps> = ({
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
  const restrictCustomFields = ["createAsanaTicket"];
  return (
    <>
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
      {restrictCustomFields.includes(selectedOperationId) &&
        selectedConfigId && (
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

export default AsanaForm;
