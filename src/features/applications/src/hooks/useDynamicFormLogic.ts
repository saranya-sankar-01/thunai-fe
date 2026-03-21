import { useState, useEffect, useCallback, useMemo } from "react";
import { useBackendService } from "../services/useBackendServices";
import { useDebounceFn } from "../hooks/useDebounceFn"; // Assuming this is defined as per earlier steps
// import { patchMethod, postMethod } from "@/services/apiRequestMethods";
import {
  ApplicationItem,
  ConfigureDynamciFieldInput,
} from "../types/ApplicationItem";
import { isFieldsEmpty } from "../utils/helpers";
import { requestApi } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { integrationServiceMap } from "../services/integrationServiceMap";
import { customAppConfig } from "../utils/customAppConfig";
import { toast } from "sonner";

interface ComponentGroup {
  inputs: ConfigureDynamciFieldInput[];
}
type FormValues = Record<string, any>;

// --- THE CORE LOGIC HOOK ---

export const useDynamicFormLogic = (
  application: ApplicationItem | null, // undefined for new connections (POST)
  initialFields: ComponentGroup[],
  initialValues: FormValues,
  appType: string
) => {
  const navigate = useNavigate();
  const { fetchAppDependentData } = useBackendService(application.name);
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any>>({});
  const [fieldLoading, setFieldLoading] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const allFields = useMemo(
    () => initialFields?.flatMap((g) => g.inputs),
    [initialFields]
  );
  const getService = integrationServiceMap[application.name];
  const service = getService?.getState();
  // --- 1. INITIALIZATION: Set initial form state ---
  useEffect(() => {
    const initialForm: FormValues = {};
    const initialOptions: Record<string, any[]> = {};
    allFields?.forEach((input) => {
      if (appType === "DYNAMIC_APP") {
        // Populate formValues with saved data or default to empty array/string
        initialForm[input.field] =
          initialValues[input.field] ??
          (input.type === "multiselect" ? [] : "");
      }

      if (input.options) {
        initialOptions[
          appType === "DYNAMIC_APP" ? input.field : input.formControlName
        ] = input.options;
      }
    });
    setFormValues(initialForm);
    setFieldOptions((prev) => ({ ...prev, ...initialOptions }));

    // NOTE: We do NOT trigger dependency fetches here.
    // We let the dedicated dependency useEffect (Section 3) handle the initial load
    // once formValues is set.
  }, [initialFields, initialValues, allFields, appType, application.name]);

  // --- 2. CORE DEPENDENCY FETCH API ---

  // This is the actual function that performs the API call, stabilized by useDebounceFn
  const dependentFetchApi = useCallback(
    async (dependentField: string, sourceValues: FormValues) => {
      const dependentInput = allFields.find((i) => {
        if (appType === "DYNAMIC_APP") {
          return i.field === dependentField;
        }
        if (appType === "CUSTOM_APP") {
          return i.formControlName === dependentField;
        }
      });
      if (
        appType === "DYNAMIC_APP" &&
        !dependentInput &&
        !dependentInput.value_from
      )
        return;
      if (appType === "CUSTOM_APP" && !dependentInput) return;

      setFieldLoading((prev) => ({ ...prev, [dependentField]: true }));

      // Construct payload from required source fields (e.g., email, domainName, apiToken)
      let payload: FormValues;
      if (appType === "DYNAMIC_APP") {
        payload = dependentInput.value_from.reduce((acc, key) => {
          acc[key] = sourceValues[key];
          return acc;
        }, {} as FormValues);
      }
      // Add context data (handled by backendService hook if needed globally)

      try {
        // Calls the specialized helper in the backend service
        if (appType === "DYNAMIC_APP") {
          const options = await fetchAppDependentData(
            application.name,
            payload,
            appType
          );

          setFieldOptions((prev) => ({ ...prev, [dependentField]: options }));
        } else if (appType === "CUSTOM_APP") {
          const options = await fetchAppDependentData(
            application.name,
            payload,
            appType,
            dependentInput.function
          );
          setFormValues((prev) => ({
            ...prev,
            [dependentField]: options.value,
          }));

          setFieldOptions((prev) => ({
            ...prev,
            [dependentField]: {
              options: options.options,
              returnValue: dependentInput.returnValue,
              displayValue: dependentInput.displayValue,
            },
          }));
        }

        // OPTIONAL: If the old value is no longer valid, reset the form value
        // For now, we rely on the component retaining the value and showing the new options.
      } catch (error) {
        console.error(
          `Failed to load ${dependentField} options for ${application.name}:`,
          error
        );
      } finally {
        setFieldLoading((prev) => ({ ...prev, [dependentField]: false }));
      }
    },
    [application, allFields, fetchAppDependentData, appType]
  );

  // Stabilize the API call logic using the debounce hook
  const debouncedDependentFetch = useDebounceFn(dependentFetchApi, 500);

  // This effect runs whenever formValues changes and ensures that dependent fields
  // whose requirements are met, but options haven't been loaded, are fetched.
  useEffect(() => {
    // Find ALL fields that need resolution
    allFields?.forEach((dependentInput) => {
      const dependentField =
        appType === "DYNAMIC_APP"
          ? dependentInput.field
          : dependentInput.formControlName;

      const { value_from, function: fetchFunction } = dependentInput;

      if (appType === "DYNAMIC_APP" && !value_from) return;
      if (appType === "CUSTOM_APP" && !fetchFunction) return;
      const allSourcesPresent = value_from?.every(
        (key) =>
          formValues[key] &&
          (Array.isArray(formValues[key]) ? formValues[key].length > 0 : true)
      );
      // Check if this field's options are missing AND it's not currently loading
      const optionsMissing =
        !fieldOptions[dependentField] ||
        fieldOptions[dependentField].length === 0;

      const isLoading = fieldLoading[dependentField];
      if (appType === "DYNAMIC_APP") {
        if (allSourcesPresent && optionsMissing && !isLoading) {
          // Trigger immediate fetch (via debounced function)
          debouncedDependentFetch(dependentField, formValues);
        }
      }
      if (appType === "CUSTOM_APP") {
        if (optionsMissing && !isLoading) {
          debouncedDependentFetch(dependentField, formValues);
        }
      }
    });

    // NOTE: We include fieldOptions and fieldLoading here to ensure the effect re-evaluates
    // when options are successfully fetched or loading state changes, preventing unnecessary fetches.
  }, [
    formValues,
    allFields,
    fieldOptions,
    fieldLoading,
    debouncedDependentFetch,
    appType,
  ]);

  // --- 4. UNIVERSAL CHANGE HANDLER ---

  const triggerShakeAnimation = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
    }, 2000);
  };

  const handleValueChange = useCallback(
    (fieldName: string, newValue: any) => {
      setHasUnsavedChanges(true);
      triggerShakeAnimation();

      setFormValues((prev) => {
        const newValues = { ...prev, [fieldName]: newValue };

        // 1. Trigger dependency resolution for any field relying on 'fieldName'
        allFields.forEach((input) => {
          if (input.value_from?.includes(fieldName)) {
            // Trigger debounced fetch for the dependent field
            debouncedDependentFetch(input.field, newValues);

            // CRITICAL: Immediately destroy options/value of downstream dependent fields
            // that might rely on this one, forcing a fresh load later.
            // setFieldOptions(prevOptions => { delete prevOptions[input.field]; return {...prevOptions}});
            // setFormValues(prevForm => ({ ...prevForm, [input.field]: input.type === 'multiselect' ? [] : '' }));
          }
        });

        return newValues;
      });
    },
    [allFields, debouncedDependentFetch]
  );

  // --- 5. VISIBILITY AND SUBMISSION ---

  const isVisible = useCallback(
    (input: ConfigureDynamciFieldInput) => {
      if (!input.visibleIf) return true;
      // if(application.name === "slack" && formValues.direct_message.is_invite ){
      //   input.visibleIf
      // }
      const controllingValue =
        formValues[input.visibleIf.field || input.visibleIf.formControlName];
      return controllingValue === input.visibleIf.value;
    },
    [formValues]
  );

  const isSectionVisible = (section: any) =>
    section.inputs.some((input: ConfigureDynamciFieldInput) =>
      isVisible(input)
    );

  const isSavingDisabled = useMemo(() => {
    // Disables save if saving is active OR any field is currently fetching options
    return isSaving || Object.values(fieldLoading).some((l) => l);
  }, [isSaving, fieldLoading]);

  const commonSave = useCallback(async () => {
    if (isSavingDisabled) return;
    if (appType === "DYNAMIC_APP") {
      let id: string | null;
      if (application.is_connected) {
        if (application.oauth_flow && !application.is_oauth_connected) {
          id = application.application_id;
        } else if (isFieldsEmpty(application?.action_fields)) {
          id = application.application_id;
        } else {
          id = application.action_application_id;
        }
      } else {
        id = application.action_application_id || null;
      }

      try {
        setIsSaving(true);
        // POST (Create) or PATCH (Update) based on appId presence
        let response: any;
        if (id) {
          const payload = {
            id,
            name: application.name,
            ...formValues,
          };
          response = await requestApi(
            "PATCH",
            "oauth2/app/configure/",
            payload,
            "authService"
          );
        } else {
          const payload = {
            id: application.id,
            name: application.name,
            ...formValues,
          };
          response = await requestApi(
            "POST",
            "oauth2/app/configure/",
            payload,
            "authService"
          );
        }

        setIsSaving(false);
        setHasUnsavedChanges(false);
        if (
          (response.status >= 200 && response.status <= 400) ||
          response.data.status === "success"
        ) {
          setSuccess(true);
          navigate("/");
          toast.success("Configuration saved successfully!");
        }
      } catch (error) {
        setIsSaving(false);
        console.error("Save Failed:", error);
        toast.error("Configuration failed!");
      }
    }
    if (appType === "CUSTOM_APP") {
      try {
        setIsSaving(true);
        const payload = formValues;
        const appConfig = customAppConfig.find(
          (app) => app.name == application.name
        );
        const saveFunctionName = service[appConfig.saveFunction];
        saveFunctionName(payload);
        setIsSaving(false);
        setHasUnsavedChanges(false);
      } catch (error: any) {
        setIsSaving(false);
        console.error("Save Failed:", error);
        toast.error("Configuration failed!");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application, formValues, isSavingDisabled]);

  console.log(fieldOptions, "OPTIONS")

  return {
    formValues,
    fieldOptions,
    fieldLoading,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSavingDisabled,
    isSaving,
    handleValueChange,
    commonSave,
    isVisible,
    isSectionVisible,
    success,
    shake,
  };
};
