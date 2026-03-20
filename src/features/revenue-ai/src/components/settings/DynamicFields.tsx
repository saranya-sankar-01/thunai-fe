import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import MultiSelect from "../ui/multi-select";
import { Checkbox } from "../ui/checkbox";
import { RadioGroupItem } from "../ui/radio-group";
import { Application, ConfigureDynamciFieldInput } from "../../types/Application";
import { useDynamicForms } from "../../hooks/useDynamicForm";
import { FieldValues, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { customAppConfig } from "../../lib/customAppConfig";
import { isFieldsEmpty } from "../../lib/utils";
import { useConfigureStore } from "../../store/configureStore";
import { Button } from "../ui/button";
import { Link2 } from "lucide-react";
import { useCrmStore } from "../../store/crmStore";

type DynamicFieldsProps = {
    application: Application;
    setSelectedApp: React.Dispatch<React.SetStateAction<Application | null>>
}

const ComponentMap: Record<string, React.ElementType> = {
    text: Input,
    select: Select,
    multiselect: MultiSelect,
    checkbox: Checkbox,
    radio: RadioGroupItem,
    toggle: Switch
}



export const DynamicFields: React.FC<DynamicFieldsProps> = ({ application, setSelectedApp }) => {
    const { loadFiles, configureItem } = useConfigureStore();
    const { saveApplicationKeys, loading } = useCrmStore();

    const configureId = useMemo(() => {
        if (!application) return null;

        if (!application.is_connected && !application.action_application_id) {
            return application.action_application_id || null;
        }

        if (application.oauth_flow && !application.is_oauth_connected) {
            return application.application_id;
        }

        if (!isFieldsEmpty(application?.action_fields)) {
            return application.action_application_id;
        }

        if (!isFieldsEmpty(application?.fields)) {
            return application.application_id;
        }

        return application.action_application_id;
    }, [application]);

    const apps = ["slack", "microsoft_teams"];

    const appType: "DYNAMIC_APP" | "CUSTOM_APP" = useMemo(() => {
        if (!application) return;
        return !apps.includes(application?.name)
            ? "DYNAMIC_APP"
            : "CUSTOM_APP";
    }, [application]);

    const isConnectedOrActionApp = application &&
        application?.is_connected || application?.action_application_id || false;

    const isOauthApp = application && application.oauth_flow && !application.is_oauth_connected || false;

    const components = application && isConnectedOrActionApp ? isOauthApp ? application?.configure_dynamic_fields : application?.dynamic_fields : application?.configure_dynamic_fields || [];

    const fields = useMemo(() => {
        if (!application) return [];

        if (appType === "CUSTOM_APP") {
            return customAppConfig.find(app => app.name === application.name)?.components || [];
        }

        return components || [];
    }, [application, appType, components]);

    const savedValues = useMemo(() => {
        if (!application) return;
        return application?.action_application_id ? configureItem?.action_fields || {} : configureItem?.fields || {}
    }, [application, configureItem])

    const { formValues = {}, fieldOptions, fieldLoading, handleValueChange, isVisible } = useDynamicForms(application, fields, savedValues, appType);

    useEffect(() => {
        if (!configureId) return;
        loadFiles(configureId);
    }, [configureId, loadFiles]);

    const resolveOptions = (input: ConfigureDynamciFieldInput) => {
        const fieldName =
            appType === "DYNAMIC_APP" ? input.field : input.formControlName;

        if (fieldOptions[fieldName]) {
            return fieldOptions[fieldName];
        }

        return input.options ?? [];
    };

    const form = useForm<FieldValues>({
        defaultValues: {}
    })

    const onSubmit = async (values: Record<string, any>) => {
        const success = await saveApplicationKeys(application, appType, values);

        if (success) {
            setSelectedApp(null);
        }

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='space-y-6'>
                    {application.dynamic_fields.map((field, i) => (
                        <div
                            className="border border-gray-200 shadow-lg mt-4 rounded-lg overflow-hidden"
                            key={i}
                        >
                            {(field.commonLabel || field.subLabel) && (
                                <div className="flex bg-gray-100 p-4 justify-between items-center">
                                    <div>
                                        <h2 className="font-semibold text-md text-gray-800">
                                            {field.commonLabel}
                                        </h2>
                                        {field.subLabel && (
                                            <p className="text-sm text-gray-600">
                                                {field.subLabel}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-4 p-4">
                                {field.inputs.map((input, inputIndex) => {
                                    const isRadixComponent = ["select", "multiselect", "radio", "toggle"].includes(
                                        input.type
                                    );
                                    const InputCmp = ComponentMap[input.type];

                                    const fieldName = appType === "DYNAMIC_APP" ? input.field : input.formControlName;

                                    if (!InputCmp || !isVisible(input)) return null;

                                    const options = resolveOptions(input);

                                    return (
                                        <FormField key={`${i}-${inputIndex}`} control={form.control} name={fieldName} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{input.label}</FormLabel>
                                                <FormControl>
                                                    <InputCmp {...field} options={options} {...(isRadixComponent ? {
                                                        onValueChange: (value: any) => {
                                                            field.onChange(value);
                                                            handleValueChange(fieldName, value);
                                                        }
                                                    } : {
                                                        onChange: (e: any) => {
                                                            field.onChange(e.target.value);
                                                            handleValueChange(fieldName, e.target.value)
                                                        }
                                                    })} />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                    <Button size="sm" disabled={loading.saving}>
                        <Link2 size={14} className="mr-1" /> {loading.saving ? "Connecting..." : "Connect"}
                    </Button>
                    <Button size="sm" variant="outline" type="button" disabled={loading.saving} onClick={() => { setSelectedApp(null) }}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    )
}