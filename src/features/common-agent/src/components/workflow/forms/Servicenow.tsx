import { FC, useEffect, useState } from "react";
import CustomFields from "../../../components/workflow/common-components/customFields";
import { useLocation } from "react-router-dom";
import { useWidgetStore } from '../../../stores/widgetStore';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolSelect from "../common-components/ToolSelect";

interface ServiceNowFormProps {
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
  setValue?: (value: { instruction: string; type: "user" | "group" }[]) => void;  // Adjusted to handle both instruction and type
  value?: any[];
}

const ServiceNowForm: FC<ServiceNowFormProps> = ({
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
  setValue,
  value,
  selectedConfigId,
}) => {
  const location = useLocation();
 

  const [selectionType, setSelectionType] = useState<"user" | "group" | "">(""); 
  const [inputValue, setInputValue] = useState("");

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value as "user" | "group";
    setSelectionType(type);
    setInputValue(""); 
    setValue && setValue([]); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (setValue && selectionType !== "") {
      setValue([{ instruction: val, type: selectionType }]);
    }
  };

  const restrictCustomFields = ['createServiceNowIncident', 'createServiceNowProblem', 'createServiceNowTask', 'createServiceNowChangeRequest','createServiceCatalogRequest'];
  return (
    <>
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



      {restrictCustomFields.includes(selectedOperationId) && selectedOperationId && (
        <div className="mt-4">
          <h4 className="text-md font-medium text-black mb-2">Assign Type</h4>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="assignType"
                value="user"
                checked={selectionType === "user"}
                onChange={handleRadioChange}
              />
              <span className="ml-2 text-black">Assign User</span>
            </label>
            <label>
              <input
                type="radio"
                name="assignType"
                value="group"
                checked={selectionType === "group"}
                onChange={handleRadioChange}
              />
              <span className="ml-2 text-black">Assign Group</span>
            </label>
          </div>

          {selectionType && (
            <div className="mt-3">
              <textarea
                placeholder={selectionType === "user" ? "Enter instruction to assign user" : "Enter instruction to assign group"}
                value={inputValue}
                onChange={handleInputChange}
                className="text-black border border-gray-300 rounded-md p-2 w-full h-32 resize-none"
              />
            </div>
          )}
        </div>
      )}

      {restrictCustomFields.includes(selectedOperationId) && selectedOperationId && (
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

export default ServiceNowForm;
