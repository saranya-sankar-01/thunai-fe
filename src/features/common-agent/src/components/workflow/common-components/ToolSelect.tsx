import { FC } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolSelectProps {
  selectedApp: any;
  selectedOperationId: string;
  setSelectedOperationId: (id: string) => void;
    onToolChange?: (operationId: string) => void;
}

const ToolSelect: FC<ToolSelectProps> = ({
  selectedApp,
  selectedOperationId,
  setSelectedOperationId,
  onToolChange
}) => {
  if (!selectedApp) return null;

  const allActions = selectedApp.tools.flatMap((tool: any) => tool.actions);
 const handleSelect = (operationId: string) => {
    setSelectedOperationId(operationId);
    if (onToolChange) onToolChange(operationId); // trigger parent
  };
  return (
    <div>
      <h5 className="text-sm font-medium mt-4 text-black">Select Tool</h5>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
               className="w-full justify-between border border-gray-300 text-black rounded-md p-3 hover:bg-transparent hover:border-gray-300 hover:text-black"

          >
            <span>
              {selectedOperationId
                ? allActions.find((a: any) => a.operationId === selectedOperationId)
                    ?.operationId
                : "Select a Tool"}
            </span>

            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-[430px]">
          <Command>
            <CommandInput placeholder="Search tools..." />

            <CommandList className="p-2">
              <CommandEmpty>No tool found.</CommandEmpty>

              {allActions.map((action: any) => (
                <CommandItem
                  key={action.operationId}
                  value={action.operationId}
                  onSelect={() => handleSelect(action.operationId)}
                >
                    <Check
      className={cn(
        "mr-2 h-4 w-4",
        selectedOperationId === action.operationId ? "opacity-100" : "opacity-0"
      )}
    />
                  {action.operationId} - {action.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ToolSelect;
