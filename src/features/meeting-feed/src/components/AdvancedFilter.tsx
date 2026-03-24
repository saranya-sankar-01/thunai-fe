import React, { useState, useEffect } from "react";
import { X, Plus, Filter as FilterIcon } from "lucide-react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {getLocalStorageItem, requestApi } from "@/services/authService";

interface FilterSchema {
  key_name: string;
  key_value?: string;
  operator?: string;
  label: string;
  inputtype: "textbox" | "select" | "multiselect" | "date" | "number";
  rowData?: any[];
}

interface FilterCondition {
  filterField: string;
  condition: string;
  filterValue: any;
  keyvalue_to?: string;
}

interface AdvancedFilterProps {
  filterList: FilterSchema[];
  onClose: () => void;
  existingFilters?: any[];
  updateFilters?: (filters: any[]) => void;
  onApiResponse?: (responseData: any, payload?: any, callFilter?: boolean) => void;
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
      const option = options.find(
        (opt) => (opt.value || opt) === selectedValues[0]
      );
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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" data-multiselect-dropdown>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300 rounded-md px-3 py-2 text-left flex items-center justify-between hover:border-indigo-200 transition-colors"
      >
        <span className="text-sm text-gray-700 truncate">
          {getDisplayText()}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
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
                className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors ${isSelected ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                  }`}
              >
                <span className="text-sm">{optionLabel}</span>
                {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
            );
          })}

          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options available
            </div>
          )}
        </div>
      )}

      {selectedValues.length > 0 && (
        <div className="text-xs text-indigo-600 mt-1">
          {selectedValues.length} option{selectedValues.length !== 1 ? "s" : ""}{" "}
          selected
        </div>
      )}
    </div>
  );
};

const getOperatorList = (
  inputType: string
): { value: string; label: string }[] => {
  switch (inputType) {
    case "textbox":
      return [
        { value: "like", label: "contains" },
        { value: "notlike", label: "does not contain" },
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
    category: "in",
    sentiment: "in",
    status: "in",
    credits: "==",
    call_scores: "==",
    duration: "==",
    created: "like",
    shared_doc: "in",
    user_id: "in",
  };

  return (
    fieldDefaults[fieldName.toLowerCase()] ||
    getOperatorList(inputType)[0]?.value ||
    "like"
  );
};

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  filterList,
  onClose,
  existingFilters = [],
  updateFilters,
  onApiResponse,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<FilterSchema[]>([]);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    []
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isShowFilterList, setIsShowFilterList] = useState(true);
  const [loading, setLoading] = useState(false);


  // console.log( callFilter);


  const todayDate = new Date().toISOString().split("T")[0];

  const url = new URL(window.location.href);
  const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

  // Initialize state from existingFilters
  useEffect(() => {
    if (existingFilters.length > 0) {
      setSelectedFilters(existingFilters);

      // Initialize filter conditions from existing filters
      const initialConditions = existingFilters.map((filter) => ({
        filterField: filter.key_name,
        condition:
          filter.operator ||
          getDefaultOperator(filter.key_name, filter.inputtype),
        filterValue: filter.key_value || "",
        keyvalue_to: "",
      }));
      setFilterConditions(initialConditions);
    } else {
      setSelectedFilters([]);
      setFilterConditions([]);
    }
    // NOTE: filterList is intentionally excluded from deps — it is not used
    // inside this effect and including it caused spurious re-runs (new array
    // reference on every parent render) that reset typed filter values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingFilters]);

  const addFilter = (field: FilterSchema) => {
    if (selectedFilters.some((f) => f.key_name === field.key_name)) {
      return;
    }

    const newSelectedFilters = [...selectedFilters, field];
    setSelectedFilters(newSelectedFilters);

    const defaultOperator = getDefaultOperator(field.key_name, field.inputtype);

    let initialValue;
    if (field.inputtype === "multiselect") {
      initialValue = [];
    } else {
      initialValue = "";
    }

    const newCondition: FilterCondition = {
      filterField: field.key_name,
      condition: defaultOperator,
      filterValue: initialValue,
      keyvalue_to: "",
    };

    // Use functional updater to avoid stale closure — ensures Filter 1's
    // typed value (held in the latest state) is not overwritten.
    setFilterConditions((prev) => [...prev, newCondition]);
    setSelectedIndex(newSelectedFilters.length - 1);
    setIsShowFilterList(false);
    // Do NOT call updateFilters here — doing so updates the parent's
    // existingFilters prop, which re-triggers the init useEffect and
    // overwrites the typed values of already-configured filters.
    // The parent is notified only when Apply is clicked (handleSubmit).
  };

  const removeFilter = (index: number) => {
    const newSelectedFilters = selectedFilters.filter((_, i) => i !== index);
    const newConditions = filterConditions.filter((_, i) => i !== index);

    setSelectedFilters(newSelectedFilters);
    setFilterConditions(newConditions);

    setIsShowFilterList(true);
    setSelectedIndex(null);
    // Do NOT call updateFilters here for the same reason as addFilter.
  };

  const updateCondition = (
    index: number,
    field: keyof FilterCondition,
    value: any
  ) => {
    // Use functional updater to always operate on the latest state,
    // preventing stale-closure overwrites when updates are batched.
    setFilterConditions((prev) => {
      const newConditions = [...prev];
      newConditions[index] = { ...newConditions[index], [field]: value };
      return newConditions;
    });
  };

  const showInBox = (filter: FilterSchema, index: number) => {
    setSelectedIndex(index);
    setIsShowFilterList(false);

    if (!filterConditions[index].condition) {
      const defaultOperator = getDefaultOperator(
        filter.key_name,
        filter.inputtype
      );
      updateCondition(index, "condition", defaultOperator);
    }
  };

  const isSelected = (filter: FilterSchema): boolean => {
    return selectedFilters.some((f) => f.key_name === filter.key_name);
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Update parent with final filters before API call
    if (updateFilters) {
      updateFilters(selectedFilters);
    }

    try {
      const filters = filterConditions
        .filter((condition) => {
          // Use the same validation as isFormValid
          if (Array.isArray(condition.filterValue)) {
            return condition.filterField && condition.condition;
            // Removed: && condition.filterValue.length > 0
          }
          return (
            condition.filterField &&
            condition.condition &&
            condition.filterValue
          );
        })
        .map((condition) => {
          // Look up schema by key_name, NOT by map-index.
          // After .filter(), the index resets to 0 for the filtered subset,
          // so selectedFilters[index] would point to the wrong schema when
          // any earlier condition was dropped — causing Filter 1 to vanish
          // from the payload.
          const schema = selectedFilters.find(
            (f) => f.key_name === condition.filterField
          );
          let formattedValue = condition.filterValue;

          // Format date if needed
          if (
            schema?.inputtype === "date" &&
            typeof formattedValue === "string"
          ) {
            formattedValue = new Date(formattedValue).toISOString();
          }

          if (schema?.inputtype === "multiselect") {
            if (Array.isArray(formattedValue)) {
              formattedValue = (formattedValue as any[]).flat(1);
              formattedValue = formattedValue.map((item: any) => String(item));
            } else {
              formattedValue = [formattedValue];
            }
            formattedValue = (formattedValue as string[]).filter(
              (val: string) => val !== ""
            );
          }

          return {
            key_name: condition.filterField,
            key_value: formattedValue,
            operator: condition.condition,
            inputtype: schema?.inputtype,
          };
        });

      // Create the main payload with added_type filter and selected filters
      const payload = {
        filter: [
          {
            key_name: "added_type",
            key_value: [
              "user",
              "periodic_sync",
              "recording",
              "ai-bot",
              "research",
              "meet-record",
              "teams-record",
              "zoom-record",
              "webex-record",
            ],
            operator: "in",
          },
          ...filters,
        ],
        page: {
          size: 10,
          page_number: 1,
        },
        sort: "desc",
        sortby: "created",
      };

      // Send the filter API request
      const res = await requestApi(
        "POST",
        `${tenant_id}/callagent/filter/`,
        payload,
        "authService"
      );

      if (onApiResponse && res) {
        onApiResponse(res, payload, true);
      }

      // Close only after successful API call
      onClose();
    } catch (error) {
      console.error("Filter API error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setIsShowFilterList(true);
    onClose();
  };

  const isFormValid = filterConditions.some((condition) => {
    // Multiselect fields → require at least 1 selected value
    if (Array.isArray(condition.filterValue)) {
      return (
        condition.filterField &&
        condition.condition &&
        condition.filterValue.length > 0
      );
    }

    // Other fields → require non-empty string/value
    return (
      condition.filterField &&
      condition.condition &&
      condition.filterValue !== "" &&
      condition.filterValue !== null &&
      condition.filterValue !== undefined
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="bg-white rounded shadow-xl w-full max-w-xl h-[100vh] flex flex-col">
        {/* Header */}
        <div className="relative flex justify-between items-center bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-1 px-2 shadow-xl backdrop-blur-lg border-b border-white/10 ">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <h2 className="text-sm  tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Advanced Filter
              </h2>
              <div className="absolute -bottom-2 left-0 w-12 h-[2px] bg-gradient-to-r from-blue-400 to-indigo-300"></div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="relative rounded-xl p-3 transition-all duration-300 hover:scale-105 group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-sm group-hover:blur-md transition-all duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <span className="text-sm font-medium opacity-0 max-w-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap text-blue-200">
                Close
              </span>
              <X className="h-4 w-4 text-blue-300 group-hover:rotate-90 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="w-1/2 p-4 border-r-2 border-gray-200 flex flex-col">
            <div className="mb-4">
              <p className="text-gray-700 font-semibold">Advanced filter</p>
              <p className="text-gray-500 text-sm mt-2">
                Refine your results with custom filters
              </p>
            </div>

            <div className="flex-1 overflow-auto">
              {selectedFilters.length > 0 ? (
                <div className="space-y-2">
                  {selectedFilters.map((selected, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center p-3 rounded-lg transition-all duration-200 ${selectedIndex === i
                        ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-500 shadow-indigo-100 cursor-pointer"
                        : "bg-white border border-indigo-200 hover:border-indigo-300 cursor-pointer"
                        }`}
                      onClick={() => showInBox(selected, i)}
                    >
                      <div className="flex items-center space-x-3">
                        <label className="font-medium text-gray-700">
                          {selected.label}
                          {filterConditions[i]?.filterValue && (
                            <span className="ml-2 text-xs px-2 py-1 rounded-full text-indigo-600 bg-indigo-50">
                              {Array.isArray(filterConditions[i].filterValue)
                                ? `${filterConditions[i].filterValue.length} selected`
                                : filterConditions[i].filterValue}
                            </span>
                          )}
                        </label>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFilter(i);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 opacity-60 hover:opacity-100"
                        title="Remove filter"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                    <FilterIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="text-center space-y-3 max-w-sm">
                    <h3 className="text-lg font-semibold text-gray-800">
                      No Filters Applied
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Add filters to narrow down your results and find specific
                      items more quickly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              {selectedFilters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsShowFilterList(true)}
                  disabled={isShowFilterList}
                  className="px-6 py-2 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Filter
                </Button>
              )}

              {selectedFilters.length > 0 && (
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  className={`${isFormValid
                    ? "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    : "bg-gray-400 cursor-not-allowed text-[10px] sm:text-sm"
                    }`}
                >
                  {loading ? "Applying..." : "Apply Filters"}
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 p-4 bg-gradient-to-br from-slate-50 to-indigo-50">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-bold mb-3 text-lg">
              {isShowFilterList || selectedFilters.length === 0
                ? "Select Filter"
                : "Edit Filter"}
            </p>

            {/* Available Filters List */}
            {(isShowFilterList || selectedFilters.length === 0) && (
              <div className="grid grid-cols-2 gap-3">
                {filterList.map((field, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all duration-200 ${isSelected(field)
                      ? "bg-gray-100 opacity-50 cursor-not-allowed border-gray-200"
                      : "bg-white/60 border-indigo-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 cursor-pointer hover:shadow-md"
                      }`}
                    onClick={() => !isSelected(field) && addFilter(field)}
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Filter Configuration */}
            {!isShowFilterList &&
              selectedIndex !== null &&
              selectedFilters[selectedIndex] && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200 shadow-sm">
                  <label className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold mb-4 block">
                    {selectedFilters[selectedIndex].label}
                  </label>

                  {/* Condition Select */}
                  <div className="mb-4">
                    <Select
                      value={filterConditions[selectedIndex]?.condition || ""}
                      onValueChange={(value) =>
                        updateCondition(selectedIndex, "condition", value)
                      }
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-2 border-indigo-100 ">
                        <SelectValue placeholder="Choose condition" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {getOperatorList(
                          selectedFilters[selectedIndex].inputtype
                        ).map((operator) => (
                          <SelectItem
                            key={operator.value}
                            value={operator.value}
                          >
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Input Fields based on type */}
                  {selectedFilters[selectedIndex].inputtype === "textbox" && (
                    <Input
                      type="text"
                      value={filterConditions[selectedIndex]?.filterValue || ""}
                      onChange={(e) =>
                        updateCondition(
                          selectedIndex,
                          "filterValue",
                          e.target.value
                        )
                      }
                      placeholder="Enter value"
                      className="w-full bg-slate-50 border-2 border-indigo-100 "
                    />
                  )}

                  {selectedFilters[selectedIndex].inputtype === "number" && (
                    <Input
                      type="number"
                      value={filterConditions[selectedIndex]?.filterValue || ""}
                      onChange={(e) =>
                        updateCondition(
                          selectedIndex,
                          "filterValue",
                          e.target.value
                        )
                      }
                      placeholder="Enter value"
                      className="w-full bg-slate-50 border-2 border-indigo-100 "
                    />
                  )}

                  {selectedFilters[selectedIndex].inputtype === "date" && (
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-indigo-600 font-medium">
                          From
                        </div>
                        <Input
                          type="date"
                          value={
                            filterConditions[selectedIndex]?.filterValue || ""
                          }
                          onChange={(e) =>
                            updateCondition(
                              selectedIndex,
                              "filterValue",
                              e.target.value
                            )
                          }
                          max={todayDate}
                          className="w-full bg-slate-50 border-2 border-indigo-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-indigo-600 font-medium">
                          To
                        </div>
                        <Input
                          type="date"
                          value={
                            filterConditions[selectedIndex]?.keyvalue_to || ""
                          }
                          onChange={(e) =>
                            updateCondition(
                              selectedIndex,
                              "keyvalue_to",
                              e.target.value
                            )
                          }
                          min={filterConditions[selectedIndex]?.filterValue}
                          max={todayDate}
                          className="w-full bg-slate-50 border-2 border-indigo-100"
                        />
                      </div>
                    </div>
                  )}

                  {selectedFilters[selectedIndex].inputtype === "select" && (
                    <Select
                      value={filterConditions[selectedIndex]?.filterValue || ""}
                      onValueChange={(value) =>
                        updateCondition(selectedIndex, "filterValue", value)
                      }
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-2 border-indigo-100 ">
                        <SelectValue placeholder="Choose option" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {selectedFilters[selectedIndex].rowData?.map(
                          (option, idx) => (
                            <SelectItem
                              key={idx}
                              value={option.value || option}
                            >
                              {option.label || option}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}

                  {selectedFilters[selectedIndex].inputtype ===
                    "multiselect" && (
                      <div className="space-y-2">
                        <div className="text-sm text-indigo-600 font-medium mb-2">
                          Select options:
                        </div>
                        <MultiSelectDropdown
                          options={selectedFilters[selectedIndex].rowData || []}
                          selectedValues={
                            Array.isArray(
                              filterConditions[selectedIndex]?.filterValue
                            )
                              ? filterConditions[selectedIndex].filterValue
                              : []
                          }
                          onSelectionChange={(newValues) => {
                            updateCondition(
                              selectedIndex,
                              "filterValue",
                              newValues
                            );
                          }}
                          placeholder="Choose options..."
                        />
                      </div>
                    )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};