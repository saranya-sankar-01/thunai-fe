import { FC } from "react";
import { Input } from "@/components/ui/input";
import MultiSelectDropdown from "../common-components/multiSelectDropdown";
import ToolSelect from "../common-components/ToolSelect";

interface ThunaiDBFormProps {
  selectedApp: any;
  selectedOperationId: string;
  setSelectedOperationId: (id: string) => void;
  config: any[];
  configLoading: boolean;
  selectedCustomFields?: any[];
  fields?: any[];
  selectedConfigId?: string;
  setValue: (value: any[]) => void;
  error: string | null;
  isMaster?: boolean;
  text?: string;
  applicationName?: string;
  value: any[];
    tableName?: string;
  setTableName: (name: string) => void;
}

const ThunaiDBForm: FC<ThunaiDBFormProps> = ({
  selectedApp,
  selectedOperationId,
  setSelectedOperationId,
  config,
  configLoading,
  selectedCustomFields,
  fields,

  selectedConfigId,
  value,
  text,
  setValue,
  error,
  isMaster,
  applicationName,
  tableName,
  setTableName

}) => {

  return (
    <div className="space-y-4">
      <ToolSelect
        selectedApp={selectedApp}
        selectedOperationId={selectedOperationId}
        setSelectedOperationId={setSelectedOperationId}
      />

      {selectedOperationId && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">
            Table Name
          </label>
          <Input
            placeholder="Enter table name..."
            value={tableName || ""}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
      )}

      {/* <MultiSelectDropdown
        config={config}
        value={value}
        setValue={setValue}
        configLoading={configLoading}
        error={error}
        text={text}
        applicationName={applicationName}
      /> */}
    </div>
  );
};
export default ThunaiDBForm;