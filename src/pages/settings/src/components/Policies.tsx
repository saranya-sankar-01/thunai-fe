import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { errorHandler } from '../lib/utils';
import { useToast } from "../hooks/useToast";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useDirectoryTabStore } from "../store/directoryTabStore";

interface PoliciesProps {
    selectedApp: ActiveIntegrationApp;
    onNext?: () => void;
}

const policySchema = z.object({
    keyname: z.string().min(1, "Attribute is required"),
    operator: z.string().min(1, "Operator is required"),
    keyvalue: z.string().min(1, "Value is required"),
    is_include_user: z.string().min(1, "Action is required"),
});

const formSchema = z.object({
    policies: z.array(policySchema)
});

type FormValues = z.infer<typeof formSchema>;

const Policies: React.FC<PoliciesProps> = ({ selectedApp, onNext }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [attributes, setAttributes] = useState<string[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const { fetchIntegrationDetails, savePolicies } = useDirectoryTabStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            policies: []
        }
    });

    const { control, handleSubmit } = form;
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "policies"
    });

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    console.log(selectedApp);

    const operators = [
        { key: 'Contains', value: 'contains' },
        { key: 'Does not Contains', value: 'doesnotcontains' },
        { key: '=', value: '=' },
        { key: '!=', value: '!=' }
    ];

    const actions = ['Include', 'Exclude'];

    useEffect(() => {
        const loadPolicies = async () => {
            const dirInfo = selectedApp?.basicInfo?.dirInfo || {};
            const id = dirInfo.configuration?.client_id || dirInfo.configuration?.aws_config?.access_key_id;

            if (!id) {
                setInitialLoading(false);
                return;
            }

            try {
                // Fetch mapped attributes and existing policies
                const result = await fetchIntegrationDetails(id, urlIdentifier);

                console.log(result);

                if (result?.status === "success" && result.data) {
                    const data = result.data;

                    // Process attributes
                    if (data.attributemappings?.mapped_attributes?.[0]) {
                        const mappedAttrs = data.attributemappings.mapped_attributes[0];
                        const validAttributes = Object.keys(mappedAttrs).filter(key => mappedAttrs[key] !== null);
                        setAttributes(validAttributes);
                    }

                    // Process existing policies
                    if (data.policy?.rules && Array.isArray(data.policy.rules)) {
                        const existingPolicies = data.policy.rules.map((rule: any) => ({
                            keyname: rule.keyname,
                            keyvalue: rule.keyvalue,
                            operator: rule.operator,
                            is_include_user: rule.is_include_user ? 'Include' : 'Exclude'
                        }));
                        if (existingPolicies.length > 0) {
                            replace(existingPolicies);
                        } else {
                            // Angular adds one empty policy by default if none exist? 
                            // React usually prefers clean slate, but let's match Angular behavior if we want guidance.
                            // Angular code: "if (this.requireData?.policies) ... else { this.addPolicy() }"
                            append({ keyname: '', operator: '', keyvalue: '', is_include_user: '' });
                        }
                    } else if (fields.length === 0) {
                        append({ keyname: '', operator: '', keyvalue: '', is_include_user: '' });
                    }
                }
            } catch (error) {
                console.error("Error fetching integration details", error);

                // Fallback: Add one empty policy even if fetch fails, so UI isn't empty
                if (fields.length === 0) {
                    append({ keyname: '', operator: '', keyvalue: '', is_include_user: '' });
                }
            } finally {
                setInitialLoading(false);
            }
        };

        loadPolicies();
    }, [selectedApp, urlIdentifier]); // Removing 'append' and 'replace' from deps to avoid loops, though they are stable.

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const dirInfo = selectedApp?.basicInfo?.dirInfo || {};
        const clientId = dirInfo.client_id || dirInfo.aws_config?.access_key_id;

        // Filter out completely empty policies if user left one blank?
        // zod resolver handles validation, so invalid forms won't submit. 
        // Angular "Remove Policy and Continue" suggested implicit skipping of invalid ones, but explicit "Submit" button validates.

        let rules = values.policies.map(p => ({
            keyname: p.keyname,
            keyvalue: p.keyvalue,
            operator: p.operator,
            inputType: 'text',
            is_include_user: p.is_include_user === 'Include'
        }));

        // If rules is empty but form valid (empty array), it's a skip effectively.
        const payload = {
            rules,
            is_enabled: rules.length > 0,
            client_id: clientId,
            orgId: tenantId
        };

        try {
            const result = await savePolicies(payload);

            if (result?.status === "success") {
                toast({
                    title: "Success",
                    variant: "success",
                    description: rules.length > 0 ? "Policies saved successfully" : "Policies skipped",
                });
                if (onNext) onNext();
            } else {
                toast({
                    variant: "error",
                    description: result?.message || "Failed to save policies",
                });
            }
        } catch (error: any) {
            errorHandler(error);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="p-4 flex justify-center">Loading policies...</div>;
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-5xl mt-6 px-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-xl font-medium">Policies</div>
                    <Button
                        type="button"
                        onClick={() => append({ keyname: '', operator: '', keyvalue: '', is_include_user: '' })}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add More Policy
                    </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-6 text-sm">
                    <span className="font-bold">Note:</span> Policies define rules and conditions to manage user inclusion in the directory based on specific attributes, such as mobile numbers or email IDs. Each policy consists of an attribute, a comparison operator, a value to match, and the corresponding action. Only users meeting the policy criteria will be added to the directory.
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="border p-4 rounded-lg shadow-sm bg-white relative">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Attribute */}
                                    <FormField
                                        control={form.control}
                                        name={`policies.${index}.keyname`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Selected Attributes</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select an attribute" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white">
                                                        {attributes.map(attr => (
                                                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Operator */}
                                    <FormField
                                        control={form.control}
                                        name={`policies.${index}.operator`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Operator</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose Option" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white">
                                                        {operators.map(op => (
                                                            <SelectItem key={op.value} value={op.value}>{op.key}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Value */}
                                    <FormField
                                        control={form.control}
                                        name={`policies.${index}.keyvalue`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Value</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Value" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Action */}
                                    <FormField
                                        control={form.control}
                                        name={`policies.${index}.is_include_user`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Actions</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose Option" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white">
                                                        {actions.map(action => (
                                                            <SelectItem key={action} value={action}>{action}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Remove Policy
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {fields.length === 0 && (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                No policies added. All users matching the criteria will be processed.
                            </div>
                        )}

                        <div className="flex justify-end mt-6 mb-10">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : (fields.length > 0 ? "Save & Next" : "Skip & Next")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default Policies;
