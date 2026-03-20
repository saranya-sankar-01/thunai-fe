import { Application, ConfigureDynamciFieldInput } from "../types/Application";
import { useAppDependentData } from "./useAppDependentData";
import { useCallback, useEffect, useMemo, useState } from "react";
import { integrationServiceMap } from "../services/integrationServiceMap";
import { useDebounceFn } from "./useDebounceFn";

interface ComponentGroup {
    inputs: ConfigureDynamciFieldInput[]
}

type FormValues = Record<string, any>;

export const useDynamicForms = (application: Application | null, initialFields: ComponentGroup[], initialValues: FormValues, appType: string) => {
    const { fetchAppDependentData } = useAppDependentData(application?.name);
    const [formValues, setFormValues] = useState<FormValues>(initialValues);
    const [fieldOptions, setFieldOptions] = useState<Record<string, any>>({});
    const [fieldLoading, setFieldLoading] = useState<Record<string, boolean>>({});

    const allFields = useMemo(
        () => initialFields?.flatMap((g) => g.inputs),
        [initialFields]
    );

    const getService = integrationServiceMap[application?.name];
    const service = getService?.getState();

    useEffect(() => {
        if (!application) return;
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

    }, [application?.name]);

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
                (!dependentInput ||
                    !dependentInput.value_from)
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
                        application?.name,
                        payload,
                        appType
                    );

                    setFieldOptions((prev) => ({ ...prev, [dependentField]: options }));
                } else if (appType === "CUSTOM_APP") {
                    const options = await fetchAppDependentData(
                        application?.name,
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
                    `Failed to load ${dependentField} options for ${application?.name}:`,
                    error
                );
            } finally {
                setFieldLoading((prev) => ({ ...prev, [dependentField]: false }));
            }
        },
        [application, allFields, fetchAppDependentData, appType]
    );

    const debouncedDependentFetch = useDebounceFn(dependentFetchApi, 500);

    useEffect(() => {
        if (!application) return;
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
        debouncedDependentFetch,
        appType,
    ]);

    const handleValueChange = useCallback(
        (fieldName: string, newValue: any) => {
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

    return {
        formValues,
        fieldOptions,
        fieldLoading,
        handleValueChange,
        isVisible
    };
}