// components/AdvancedFilter.tsx
import React, { useEffect, useState } from "react";
import { X, Plus, Search, Filter as FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useKnowledgeBaseStore } from "@/store/knowledgeBaseStore";
import { Check, ChevronDown } from "lucide-react";

interface FilterSchema {
  key_name: string;
  key_value?: string;
  operator?: string;
  label: string;
  inputtype: "textbox" | "select" | "multiselect" | "date" | "number";
  rowData?: any[];
}

interface FilterCondition {
  id: string; // stable id
  filterField: string;
  condition: string;
  filterValue: any;
  keyvalue_to?: string;
}

interface AdvancedFilterProps {
  filterList: FilterSchema[];
  onClose: () => void;
  onApplyFilters: (filters: any[]) => void;
  existingFilters?: any[];
  currentTab?: string;
}

const MultiSelectDropdown = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
}: {
  options: any[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((val) => val !== optionValue)
      : [...selectedValues, optionValue];

    onSelectionChange(newValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find((opt) => (opt.value || opt) === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-multiselect-dropdown]")) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" data-multiselect-dropdown>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300 rounded-md px-3 py-2 text-left flex items-center justify-between hover:border-indigo-200 transition-colors"
      >
        <span className="text-sm text-gray-700 truncate">{getDisplayText()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option, idx) => {
            const optionValue = option.value || option;
            const optionLabel = option.label || option;
            const isSelected = selectedValues.includes(optionValue);

            return (
              <div
                key={idx}
                onClick={() => toggleOption(optionValue)}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                  isSelected ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                }`}
              >
                <span className="text-sm">{optionLabel}</span>
                {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
            );
          })}

          {options.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">No options available</div>}
        </div>
      )}

      {selectedValues.length > 0 && <div className="text-xs text-indigo-600 mt-1">{selectedValues.length} option{selectedValues.length !== 1 ? "s" : ""} selected</div>}
    </div>
  );
};

const getOperatorList = (inputType: string): { value: string; label: string }[] => {
  switch (inputType) {
    case "textbox":
      return [
        { value: "like", label: "contains" },
        { value: "notlike", label: "does not contain" },
        { value: "==", label: "equal to" },
        { value: "!=", label: "not equal to" },
      ];
    case "number":
      return [
        { value: "==", label: "equal to" },
        { value: "!=", label: "not equal to" },
        { value: ">=", label: "greater than or equal to" },
        { value: "<=", label: "less than or equal to" },
      ];
    case "date":
      return [{ value: "like", label: "between" }];
    case "select":
      return [
        { value: "==", label: "equal to" },
        { value: "!=", label: "not equal to" },
      ];
    case "multiselect":
      return [
        { value: "in", label: "equal to" },
        { value: "notin", label: "not equal to" },
      ];
    default:
      return [{ value: "like", label: "like" }];
  }
};

const getDefaultOperator = (fieldName: string, inputType: string): string => {
  const fieldDefaults: Record<string, string> = {
    title: "like",
    type: "in",
    periodic_synced: "==",
    status: "in",
    created_on: "like",
    added_type: "in",
    file_name: "like",
  };

  return fieldDefaults[fieldName.toLowerCase()] || getOperatorList(inputType)[0]?.value || "like";
};

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  filterList,
  onClose,
  onApplyFilters,
  existingFilters = [],
  currentTab = "all",
}) => {
  const [selectedFilters, setSelectedFilters] = useState<FilterSchema[]>([]);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isShowFilterList, setIsShowFilterList] = useState(true);
  const [loading, setLoading] = useState(false);
  const { clearFilters } = useKnowledgeBaseStore();
  const todayDate = new Date().toISOString().split("T")[0];

  // Preselected mapping
  const getPreselectedTypeForTab = (tab: string): string | string[] | null => {
    switch (tab) {
      case "documents":
        return ["file", "text"];
      case "links":
        return "web-link";
      case "videos":
        return "video";
      case "streams":
        return "stream";
      default:
        return null;
    }
  };

  const getTypeDisplayName = (typeValue: string | string[]): string => {
    const typeDisplayMapping: Record<string, string> = {
      file: "File",
      "web-link": "Web Link",
      video: "Video",
      stream: "Stream",
      text: "Text",
    };

    if (Array.isArray(typeValue)) {
      if (typeValue.length === 0) return "";
      if (typeValue.length === 1) return typeDisplayMapping[typeValue[0]] || typeValue[0];
      return `${typeValue.length} selected`;
    }

    return typeDisplayMapping[typeValue] || (typeValue as string);
  };

  // Initialize only once on mount using existingFilters (so reopen preserves)
  useEffect(() => {
    // If existing filters provided, map them to conditions + selectedSchemas
    if (existingFilters && existingFilters.length > 0) {
      const transformedSchemas: FilterSchema[] = existingFilters
        .map((f) => filterList.find((s) => s.key_name === f.key_name))
        .filter(Boolean) as FilterSchema[];

      const transformedConds: FilterCondition[] = existingFilters.map((f: any) => ({
        id: crypto?.randomUUID?.() || `${f.key_name}-${Math.random().toString(36).slice(2, 9)}`,
        filterField: f.key_name,
        condition: f.operator,
        filterValue: f.key_value,
        keyvalue_to: f.keyvalue_to || "",
      }));

      setSelectedFilters(transformedSchemas);
      setFilterConditions(transformedConds);
      setIsShowFilterList(true);
      setSelectedId(null);
      return;
    }

    // If no existing filters, but a tab preselect exists (only for non-all), preselect type filter
    const preselectedType = getPreselectedTypeForTab(currentTab);
    if (preselectedType && currentTab !== "all") {
      const typeSchema = filterList.find((f) => f.key_name === "type");
      if (typeSchema) {
        setSelectedFilters([typeSchema]);
        setFilterConditions([
          {
            id: crypto?.randomUUID?.() || `type-${Math.random().toString(36).slice(2, 9)}`,
            filterField: "type",
            condition: "in",
            filterValue: Array.isArray(preselectedType) ? preselectedType : [preselectedType],
            keyvalue_to: "",
          },
        ]);
        setIsShowFilterList(true);
        setSelectedId(null);
      }
    } else {
      // start empty
      setSelectedFilters([]);
      setFilterConditions([]);
      setIsShowFilterList(true);
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount

  // Helpers
  const findConditionByField = (fieldName: string) => filterConditions.find((c) => c.filterField === fieldName);

  const addFilter = (field: FilterSchema) => {
    // don't add duplicates by key_name
    if (selectedFilters.some((f) => f.key_name === field.key_name)) return;

    // don't allow adding type when it's preselected for tab
    if (field.key_name === "type" && currentTab !== "all" && getPreselectedTypeForTab(currentTab)) return;

    // Add schema
    setSelectedFilters((prev) => [...prev, field]);

    // create appropriate initial filter condition
    const defaultOperator = getDefaultOperator(field.key_name, field.inputtype);
    const initialValue = field.inputtype === "multiselect" ? [] : "";

    const newCond: FilterCondition = {
      id: crypto?.randomUUID?.() || `${field.key_name}-${Math.random().toString(36).slice(2, 9)}`,
      filterField: field.key_name,
      condition: defaultOperator,
      filterValue: initialValue,
      keyvalue_to: "",
    };

    setFilterConditions((prev) => [...prev, newCond]);
    setSelectedId(newCond.id);
    setIsShowFilterList(false);
  };

  const removeFilterById = (id: string) => {
    // Find filter being removed
    const condToRemove = filterConditions.find((c) => c.id === id);
    if (!condToRemove) return;

    // Don't allow removal if it's the preselected type for the tab
    if (condToRemove.filterField === "type" && currentTab !== "all" && getPreselectedTypeForTab(currentTab)) {
      return;
    }

    setFilterConditions((prev) => prev.filter((c) => c.id !== id));
    setSelectedFilters((prev) => prev.filter((s) => s.key_name !== condToRemove.filterField));

    // Reset UI to show list
    setIsShowFilterList(true);
    setSelectedId(null);
  };

  const updateCondition = (id: string, field: keyof FilterCondition, value: any) => {
    setFilterConditions((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const showInBox = (id: string) => {
    setSelectedId(id);
    setIsShowFilterList(false);

    // Ensure default operator exists
    const cond = filterConditions.find((c) => c.id === id);
    if (cond && !cond.condition) {
      const schema = filterList.find((s) => s.key_name === cond.filterField);
      const defaultOp = schema ? getDefaultOperator(schema.key_name, schema.inputtype) : "like";
      updateCondition(id, "condition", defaultOp);
    }
  };

  const isSelected = (filter: FilterSchema): boolean => {
    const alreadySelected = selectedFilters.some((f) => f.key_name === filter.key_name);

    // Only mark 'type' as selected when it's actually in selectedFilters OR when preselected is active AND we have a condition for type
    if (filter.key_name === "type" && currentTab !== "all") {
      const preselected = getPreselectedTypeForTab(currentTab);
      const hasTypeCondition = filterConditions.some((c) => c.filterField === "type");
      return alreadySelected || (Boolean(preselected) && hasTypeCondition);
    }

    return alreadySelected;
  };

  const handleSubmit = () => {
    setLoading(true);

    const filters = filterConditions
      .filter((c) => {
        if (Array.isArray(c.filterValue)) return c.filterField && c.condition && c.filterValue.length > 0;
        return c.filterField && c.condition && c.filterValue;
      })
      .map((condition) => {
        const schema = filterList.find((f) => f.key_name === condition.filterField);

        let formattedValue = condition.filterValue;

        if (schema?.inputtype === "date" && typeof formattedValue === "string") {
          formattedValue = new Date(formattedValue).toISOString();
        }

        if (schema?.inputtype === "multiselect") {
          if (Array.isArray(formattedValue)) {
            formattedValue = formattedValue.flat().map(String).filter((v) => v !== "");
          } else {
            formattedValue = [String(formattedValue)];
          }
        }

        return {
          key_name: condition.filterField,
          key_value: formattedValue,
          operator: condition.condition,
          inputtype: schema?.inputtype,
        };
      });

    onApplyFilters(filters);
    setLoading(false);
  };

  const isFormValid = filterConditions.every((c) => {
    if (Array.isArray(c.filterValue)) return c.filterField && c.condition && c.filterValue.length > 0;
    return c.filterField && c.condition && c.filterValue;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded shadow-xl w-full max-w-xl h-[100vh] flex flex-col">
        {/* Header */}
        <div className="relative flex justify-between items-center bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-1 px-2 shadow-xl backdrop-blur-lg border-b border-white/10 ">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <h2 className="text-sm  tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Advanced Filter</h2>
              <div className="absolute -bottom-2 left-0 w-12 h-[2px] bg-gradient-to-r from-blue-400 to-indigo-300"></div>
            </div>
          </div>

          <button
            onClick={() => {
              // only call clearFilters when nothing is selected
              if (selectedFilters.length === 0 && existingFilters.length > 0) {
                clearFilters();
                onApplyFilters([]);
              }
              onClose();
            }}
            className="relative rounded-xl p-3 transition-all duration-300 hover:scale-105 group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-sm group-hover:blur-md transition-all duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <span className="text-sm font-medium opacity-0 max-w-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap text-blue-200">Close</span>
              <X className="h-4 w-4 text-blue-300 group-hover:rotate-90 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left */}
          <div className="w-1/2 p-4 border-r-2 border-gray-200 flex flex-col">
            <div className="mb-4">
              <p className="text-gray-700 font-semibold">Advanced filter</p>
              <p className="text-gray-500 text-sm mt-2">Refine your results with custom filters</p>
            </div>

            <div className="flex-1 overflow-auto">
              {selectedFilters.length > 0 ? (
                <div className="space-y-2">
                  {filterConditions.map((cond) => {
                    const selected = selectedFilters.find((s) => s.key_name === cond.filterField);
                    const isPreselectedType = cond.filterField === "type" && currentTab !== "all" && getPreselectedTypeForTab(currentTab);
                    return (
                      <div
                        key={cond.id}
                        className={`flex justify-between items-center p-3 rounded-lg transition-all duration-200 ${
                          isPreselectedType
                            ? "bg-gray-50 border border-gray-200 cursor-not-allowed opacity-75"
                            : selectedId === cond.id
                            ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-500 shadow-indigo-100 cursor-pointer"
                            : "bg-white border border-indigo-200 hover:border-indigo-300 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!isPreselectedType) showInBox(cond.id);
                        }}
                        title={isPreselectedType ? "This filter is automatically applied for this tab and cannot be modified" : "Click to edit filter"}
                      >
                        <div className="flex items-center space-x-3">
                          <label className={`font-medium ${isPreselectedType ? "text-gray-500" : "text-gray-700"}`}>
                            {selected?.label || cond.filterField}
                            {cond.filterValue && (
                              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${isPreselectedType ? "text-gray-500 bg-gray-200" : "text-indigo-600 bg-indigo-50"}`}>
                                {cond.filterField === "type" ? getTypeDisplayName(cond.filterValue) : Array.isArray(cond.filterValue) ? `${cond.filterValue.length} selected` : cond.filterValue}
                              </span>
                            )}
                          </label>
                        </div>

                        {!isPreselectedType ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFilterById(cond.id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 opacity-60 hover:opacity-100"
                            title="Remove filter"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        ) : (
                          <div className="p-2 rounded-lg opacity-30 cursor-not-allowed" title="This filter cannot be removed">
                            <X className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                    <FilterIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="text-center space-y-3 max-w-sm">
                    <h3 className="text-lg font-semibold text-gray-800">No Filters Applied</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Add filters to narrow down your results and find specific items more quickly.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsShowFilterList(true)} disabled={isShowFilterList} className=" text-[10px] sm:text-sm">
                  <Plus className="w-4 h-4" /> Add Filter
                </Button>
              </div>

              <div>
                <Button onClick={handleSubmit} disabled={!isFormValid || loading} className={`${isFormValid ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600  text-[10px] sm:text-sm" : "bg-gray-400 cursor-not-allowed text-[10px] sm:text-sm"}`}>
                  {loading ? "Loading..." : "Apply Filters"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 p-4 bg-gradient-to-br from-slate-50 to-indigo-50">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-bold mb-3 text-lg">{isShowFilterList || selectedFilters.length === 0 ? "Select Filter" : "Edit Filter"}</p>

            {(isShowFilterList || selectedFilters.length === 0) && (
              <div className="grid grid-cols-2 gap-3">
                {filterList.map((field, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all duration-200 ${isSelected(field) ? "bg-gray-100 opacity-50 cursor-not-allowed border-gray-200" : "bg-white/60 border-indigo-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 cursor-pointer hover:shadow-md"}`}
                    onClick={() => !isSelected(field) && addFilter(field)}
                  >
                    <span className="text-sm font-medium text-gray-700">{field.label}</span>
                  </div>
                ))}
              </div>
            )}

            {!isShowFilterList && selectedId && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200 shadow-sm">
                {(() => {
                  const cond = filterConditions.find((c) => c.id === selectedId);
                  const schema = cond ? filterList.find((s) => s.key_name === cond.filterField) : undefined;
                  if (!cond || !schema) return null;

                  return (
                    <>
                      <label className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold mb-4 block">{schema.label}</label>

                      <div className="mb-4">
                        <Select value={cond.condition || ""} onValueChange={(val) => updateCondition(cond.id, "condition", val)}>
                          <SelectTrigger className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300">
                            <SelectValue placeholder="Choose condition" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {getOperatorList(schema.inputtype).map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {schema.inputtype === "textbox" && <Input type="text" value={cond.filterValue || ""} onChange={(e) => updateCondition(cond.id, "filterValue", e.target.value)} placeholder="Enter value" className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300" />}

                      {schema.inputtype === "number" && <Input type="number" value={cond.filterValue || ""} onChange={(e) => updateCondition(cond.id, "filterValue", e.target.value)} placeholder="Enter value" className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300" />}

                      {schema.inputtype === "date" && (
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <div className="text-sm text-indigo-600 font-medium">From</div>
                            <Input type="date" value={cond.filterValue || ""} onChange={(e) => updateCondition(cond.id, "filterValue", e.target.value)} max={todayDate} className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300" />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-indigo-600 font-medium">To</div>
                            <Input type="date" value={cond.keyvalue_to || ""} onChange={(e) => updateCondition(cond.id, "keyvalue_to", e.target.value)} min={cond.filterValue} max={todayDate} className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300" />
                          </div>
                        </div>
                      )}

                      {schema.inputtype === "select" && (
                        <Select value={cond.filterValue || ""} onValueChange={(val) => updateCondition(cond.id, "filterValue", val)}>
                          <SelectTrigger className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300">
                            <SelectValue placeholder="Choose option" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {schema.rowData?.map((option, idx) => (
                              <SelectItem key={idx} value={option.value || option}>
                                {option.label || option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {schema.inputtype === "multiselect" && (
                        <div className="space-y-2">
                          <div className="text-sm text-indigo-600 font-medium mb-2">Select options:</div>
                          <MultiSelectDropdown options={schema.rowData || []} selectedValues={Array.isArray(cond.filterValue) ? cond.filterValue : []} onSelectionChange={(newValues) => updateCondition(cond.id, "filterValue", newValues)} placeholder="Choose options..." />
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilter;