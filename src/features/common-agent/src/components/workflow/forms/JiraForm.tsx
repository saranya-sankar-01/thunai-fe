import { FC } from "react";
import { v4 as uuidv4 } from "uuid";
import CustomFields from "../../../components/workflow/common-components/customFields";
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
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import ToolSelect from "../common-components/ToolSelect";
interface JiraFormProps {
  selectedApp: any;
  selectedOperationId: string;
  setSelectedOperationId: (id: string) => void;
  jiraLoading: boolean;
  jiraIssueData: any[];
  selectedIssueType: string;
  fields: any[];
  updateField: (id: string, key: string, value: string) => void;
  removeField: (id: string) => void;
  handleResize: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  addField: () => void;
  handleIssueTypeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleConfigChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedConfigId: string;
  setIsMaster: (isMaster: boolean) => void;
  config: any[];
  configLoading: boolean;
  error: string | null;
  selectedCustomFields?: any;
  handleOperationChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const JiraForm: FC<JiraFormProps> = ({
  selectedApp,
  selectedOperationId,
  setSelectedOperationId,
  handleOperationChange,
  jiraLoading,
  jiraIssueData,
  selectedIssueType,
  selectedCustomFields,
  fields,
  updateField,
  removeField,
  handleResize,
  addField,
  handleIssueTypeChange,
  handleConfigChange,
  selectedConfigId,
  setIsMaster,
  configLoading,
  error,
  config,
}) => {
  const showIssueType= ["createJiraTicket","checkExistingTicket","checkExistingTicketByKey"];
  const showCustomFields = ["createJiraTicket"];
  return (
    <>
      {/* {selectedApp && (
        <div>
          <h4 className="text-md font-medium mt-4 text-black pb-2">
            Select Tool
          </h4>
          <select
            value={selectedOperationId}
            onChange={handleOperationChange}
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
      {selectedOperationId && selectedApp && (
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
            <option value="" disabled>Select a project</option>
            {configLoading && <option>Loading...</option>}
            {error && <option>Error loading configuration</option>}
            {!configLoading &&
              !error &&
              Array.isArray(config) &&
              config.length > 0 &&
              config.map((app: any) => (
                <option key={app.id} value={app.key}>
                  {app.name}
                </option>
              ))}
          </select>
        </div>
      )}
      {showIssueType.includes(selectedOperationId) &&
        selectedOperationId &&
        selectedApp && (
          <div>
            <label
              htmlFor="issueType"
              className="text-sm font-medium text-black"
            >
              IssueType
            </label>
            <select
              id="issueType"
              value={selectedIssueType}
              onChange={handleIssueTypeChange}
              className="border border-gray-300 text-black rounded-md w-full p-3"
            >
              <option value="">Select an Issue Type</option>
              {jiraLoading && <option>Loading Jira issue types...</option>}
              {!jiraLoading &&
                jiraIssueData.map((app: any) => (
                  <option key={app.issueType} value={app.issueType}>
                    {app.issueType}
                  </option>
                ))}
            </select>
          </div>
        )}

      {showCustomFields.includes(selectedOperationId) &&
        selectedIssueType && (
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

export default JiraForm;
