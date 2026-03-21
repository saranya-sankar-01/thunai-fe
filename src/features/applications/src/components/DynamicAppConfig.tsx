import { useDynamicFormLogic } from "../hooks/useDynamicFormLogic";
import React from "react";
import CustomTextField from "../components/ui/CustomTextField";
import CustomSelect from "../components/ui/CustomSelect";
import MultiSelectDropdown from "../components/ui/MultiSelectDropdown";
import SalesForceFields from "../components/SalesForceFields";
import CustomCheckbox from "../components/ui/CustomCheckbox";
import RadioButton from "../components/ui/RadioButton";
import OverviewSkeleton from "../components/OverviewSkeleton";
import BottomConfigureBar from "../components/BottomConfigureBar";
import { ApplicationItem, ConfigureDynamicField } from "../types/ApplicationItem";
import { Tooltip } from "@mui/material";
import { Toggle } from "@/components/ui/toggle";

const ComponentMap: Record<string, React.ElementType> = {
  text: CustomTextField,
  select: CustomSelect,
  multiselect: MultiSelectDropdown,
  checkbox: CustomCheckbox,
  radio: RadioButton,
  toggle: Toggle
};

interface DynamicAppConfigProps {
  appType: string;
  loading: boolean;
  fields: ConfigureDynamicField[];
  application: ApplicationItem;
  savedValues: Record<string, any>;
}

const DynamicAppConfig: React.FC<DynamicAppConfigProps> = ({
  appType,
  loading,
  fields,
  application,
  savedValues,
}) => {
  const {
    formValues = {},
    fieldOptions,
    fieldLoading,
    handleValueChange,
    isVisible,
    isSectionVisible,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSavingDisabled,
    isSaving,
    commonSave,
    success,
    shake
  } = useDynamicFormLogic(application, fields, savedValues, appType);
  if (loading) {
    return <OverviewSkeleton />
  }
  return (
    <>
      <div className="space-y-6 h-full">
        {fields?.map((fieldGroup, i) => {
          if (!isSectionVisible(fieldGroup)) return null;
          return <div
            className="border border-gray-200 shadow-lg mt-4 rounded-lg overflow-hidden"
            key={i}
          >
            {(fieldGroup.commonLabel || fieldGroup.subLabel) && (
              <div className="flex bg-gray-100 p-4 justify-between items-center">
                <div>
                  <h2 className="font-semibold text-md text-gray-800">
                    {fieldGroup.commonLabel}
                  </h2>
                  {fieldGroup.subLabel && (
                    <p className="text-sm text-gray-600">
                      {fieldGroup.subLabel}
                    </p>
                  )}
                </div>
                {/* Slack Tooltip SVG logic goes here */}
                {application.name === "slack" && (
                  <Tooltip title={fieldGroup.tooltip}>
                    <div className="flex ml-auto justify-end text-gray-600 cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="8"></line>
                      </svg>
                    </div>
                  </Tooltip>
                )}
              </div>
            )}
            <div className="space-y-4 p-4">
              {fieldGroup.inputs.map((input, inputIndex) => {
                // console.log(input)
                const InputCmp = ComponentMap[input.type];
                const { options, displayValue, returnValue } = fieldOptions[appType === "DYNAMIC_APP" ? input.field : input.formControlName] ?? input.options ?? [];
                // console.log(options)

                if (fieldLoading[appType === "DYNAMIC_APP" ? input.field : input.formControlName]) return <div key={`${i}-${inputIndex}`} className="w-full h-10 bg-gray-300 rounded animate-pulse mb-2"
                  aria-hidden="true"></div>

                if (!InputCmp || !isVisible(input)) return null;

                return (
                  <InputCmp
                    key={`${i}-${inputIndex}`}
                    label={input.label}
                    value={formValues[input.field || input.formControlName]}
                    options={options}
                    onChange={(newValue: any) =>
                      handleValueChange(appType === "DYNAMIC_APP" ? input.field : input.formControlName, newValue)
                    }
                    isLoading={fieldLoading[input.field || input.formControlName]}
                    displayValue={displayValue}
                    returnValue={returnValue}
                  />
                );
              })}
            </div>
          </div>

        }
        )}
        {application.name === "salesforce" && <SalesForceFields />}
        {hasUnsavedChanges && <BottomConfigureBar application={application} onClose={setHasUnsavedChanges} isSavingDisabled={isSavingDisabled} isSaving={isSaving} commonSave={commonSave} success={success} shake={shake} />}
      </div>
    </>
  );
};

export default DynamicAppConfig;
