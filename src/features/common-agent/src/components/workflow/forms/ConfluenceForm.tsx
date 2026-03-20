import { FC } from "react";
import CustomFields from "../../../components/workflow/common-components/customFields";
import MultiSelectDropdown from "../common-components/multiSelectDropdown";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolSelect from "../common-components/ToolSelect";
interface ConfluenceFormProps {
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
    setValue: (value: any[]) => void;
  error: string | null;
  isMaster?: boolean;
  text?: string;
  applicationName?: string;
  value: any[];
}

const ConfluenceForm: FC<ConfluenceFormProps> = ({
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
  text,
    setValue,
  error,
  isMaster,
  applicationName
}) => {
  const restrictCustomFields = ['createRedmineTicket'];
  const showProjects = ['addConfluencePage']
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
              config.map((app: any) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
          </select>
        </div>
      )}
     */}
      {(showProjects.includes(selectedOperationId))&& (
        <MultiSelectDropdown
           config={config}
           value={value}
           setValue={setValue}
           configLoading={configLoading}
           error={error}
           text={text}
            applicationName={applicationName}
         />
      )}
    </>
  );
};

export default ConfluenceForm;
