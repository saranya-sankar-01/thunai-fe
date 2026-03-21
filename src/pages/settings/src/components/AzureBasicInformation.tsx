import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/ui/Multiselect";
import { Switch } from "@/components/ui/switch";
import { useDirectoryTabStore } from "../store/directoryTabStore";
import { errorHandler } from '../lib/utils';
import { useToast } from "@/hooks/use-toast";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";

import VerifiedTick from "../assets/images/verified-tick.svg";

type AzureBasicInformationProps = {
    selectedApp: ActiveIntegrationApp;
}

const schema = z.object({
    client_id: z.string().min(1, "Client ID is required."),
    client_secret: z.string().min(1, "Client Secret is required."),
    tenant_id: z.string().min(1, "Tenant ID is required."),
    group_permission: z.boolean().default(false),
    selectedGroup: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof schema>;

const AzureBasicInformation: React.FC<AzureBasicInformationProps> = ({ selectedApp }) => {
    const { toast } = useToast();
    const [testConfigCheck, setTestConfigCheck] = useState(false);
    const [groupList, setGroupList] = useState<any[]>([]);
    const [isFormReadonly, setIsFormReadonly] = useState(false);

    const { selectedStep, setSelectedStep, loading } = useDirectoryTabStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            client_id: selectedApp.basicInfo?.dirInfo?.configuration?.client_id ?? "",
            client_secret: selectedApp.basicInfo?.dirInfo?.configuration?.client_secret ?? "",
            tenant_id: selectedApp.basicInfo?.dirInfo?.configuration?.tenant_id ?? "",
            group_permission: selectedApp.basicInfo?.dirInfo?.configuration?.group_permission ?? false,
            selectedGroup: selectedApp.basicInfo?.dirInfo?.configuration?.selectedGroup ?? []
        }
    });

    const { watch, trigger } = form;
    const groupPermission = watch("group_permission");
    const clientId = watch("client_id");
    const clientSecret = watch("client_secret");
    const tenantIdField = watch("tenant_id");
    const selectedGroup = watch("selectedGroup");

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    const { fetchGroups, testConfiguration, addIntegration, triggerSync, fetchUserAttributes, setSelectedApp } = useDirectoryTabStore();
    const [buttonStatus, setButtonStatus] = useState<"Test Config" | "Sync Directory" | "Next">("Test Config");
    const [isCancel, setIsCancel] = useState(false);

    useEffect(() => {
        if (selectedApp.basicInfo?.dirInfo?.configuration?.client_id) {
            setTestConfigCheck(true);
            setIsFormReadonly(true);
            setButtonStatus("Next");
        }
    }, [selectedApp]);

    // Reset verification if critical fields change
    useEffect(() => {
        if (testConfigCheck && !isFormReadonly) {
            setTestConfigCheck(false);
            setButtonStatus("Test Config");
            setIsCancel(false);
        }
    }, [clientId, clientSecret, tenantIdField]);

    // Fetch groups when permission is enabled
    useEffect(() => {
        if (groupPermission && testConfigCheck && groupList.length === 0) {
            getGroupList();
        }
    }, [groupPermission, testConfigCheck]);

    const getGroupList = async () => {
        if (!clientId) return;

        const payload = {
            query: { client_id: clientId, orgId: tenantId },
            filter: [
                {
                    key_name: "client_id",
                    operator: "==",
                    key_value: clientId
                }
            ],
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        try {
            const result = await fetchGroups(payload);
            if (result?.status === "success") {
                setGroupList(result.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching groups", error);
        }
    };

    const handleTestConfig = async () => {
        const values = form.getValues();
        const valid = await form.trigger(["client_id", "client_secret", "tenant_id"]);
        if (!valid) return;

        const payload = {
            client_id: values.client_id,
            client_secret: values.client_secret,
            tenant_id: values.tenant_id,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        const result = await testConfiguration(selectedApp?.app?.appName || "azure", payload);
        if (result?.status === "success") {
            setTestConfigCheck(true);
            setButtonStatus("Sync Directory");
            setIsFormReadonly(true);
            setIsCancel(false);
            toast({
                variant: "success",
                title: "Success",
                description: "Configuration Verified Successfully",
            });
            if (values.group_permission) {
                getGroupList();
            }
        }
    };

    const handleSyncDirectory = async () => {
        const values = form.getValues();
        const payload = {
            integrationType: selectedApp.app.appName,
            orgId: urlIdentifier,
            orgName: urlIdentifier,
            configuration: {
                client_id: values.client_id,
                client_secret: values.client_secret,
                tenant_id: values.tenant_id,
                scopes: 'User.Read',
                grant_type: 'client_credentials',
                group_permission: values.group_permission,
                selectedGroup: values.selectedGroup,
            },
            last_synced_on: new Date().toISOString(),
            created_on: new Date().toISOString(),
            created_by: urlIdentifier,
            infisigntenantId: tenantId,
            urlIdentifier: urlIdentifier,
        };

        const result = await addIntegration(payload);
        if (result?.status === "success" || result?.status === true) {
            const syncPayload = {
                client_id: values.client_id,
                group_ids: values.selectedGroup,
                infisigntenantId: tenantId,
                tenantUniqueIdentifier: tenantId,
                urlIdentifier: urlIdentifier,
                is_sync: false,
            };

            const syncResult = await triggerSync(selectedApp.app.appName, syncPayload);
            if (syncResult?.status === "success") {
                const attributesResult = await fetchUserAttributes(selectedApp.app.appName, values.client_id, urlIdentifier, tenantId);
                if (attributesResult?.status === "success") {
                    const updatedApp = {
                        ...selectedApp,
                        basicInfo: {
                            attributes: attributesResult.data,
                            dirInfo: {
                                configuration: values
                            }
                        }
                    };
                    setSelectedApp(updatedApp);
                    setButtonStatus("Next");
                    toast({
                        variant: "success",
                        title: "Success",
                        description: "Directory Synced Successfully",
                    });
                    // Advance to user mapping automatically
                    setSelectedStep(selectedStep + 1);
                }
            }
        }
    };

    const disabledTestConfig = loading.testConfigurationLoading || !clientId || !clientSecret || !tenantIdField || (groupPermission && (!selectedGroup || selectedGroup.length === 0));
    const disabledSyncDirectory = loading.syncDirectoryLoading || (groupPermission && (!selectedGroup || selectedGroup.length === 0));

    const handleSubmit = () => {
        if (buttonStatus === "Test Config") {
            handleTestConfig();
        } else if (buttonStatus === "Sync Directory") {
            handleSyncDirectory();
        } else if (buttonStatus === "Next") {
            setSelectedStep(selectedStep + 1);
        }
    };

    const handleEditConfig = () => {
        setIsFormReadonly(false);
        setTestConfigCheck(false);
        setButtonStatus("Test Config");
        setIsCancel(true);
    };

    const handleCancelConfig = () => {
        setIsFormReadonly(true);
        setTestConfigCheck(true);
        setButtonStatus("Next");
        setIsCancel(false);
        // Reset form to original values
        form.reset({
            client_id: selectedApp.basicInfo?.dirInfo?.configuration?.client_id ?? "",
            client_secret: selectedApp.basicInfo?.dirInfo?.configuration?.client_secret ?? "",
            tenant_id: selectedApp.basicInfo?.dirInfo?.configuration?.tenant_id ?? "",
            group_permission: selectedApp.basicInfo?.dirInfo?.configuration?.group_permission ?? false,
            selectedGroup: selectedApp.basicInfo?.dirInfo?.configuration?.selectedGroup ?? []
        });
    };

    return (
        <div className="flex flex-col mt-8 w-full max-w-3xl">
            <div className="text-xl">Add Basic Information</div>
            <a
                className="text-blue-700 font-light mb-5"
                target="_blank"
                href="https://docs.thunai.ai/article/134-azure-ad-directory-integration-with-thunai"
            >📄 {selectedApp?.app?.appName} Directory Integration</a>
            <Form {...form}>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

                    {/* Client ID */}
                    <FormField control={form.control} name="client_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Client ID <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Ex. 80809-32123-3123-213-321312"
                                    disabled={isFormReadonly && testConfigCheck}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Client Secret */}
                    <FormField control={form.control} name="client_secret" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Client Secret <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Ex. 80809-32123-3123-213-321312"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Tenant ID */}
                    <FormField control={form.control} name="tenant_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Tenant ID <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Ex. 80809-32123-3123-213-321312"
                                    disabled={isFormReadonly && testConfigCheck}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Verify Status */}
                    <div className="flex items-center">
                        {testConfigCheck && (
                            <div className="flex flex-row items-center text-green-600">
                                <img src={VerifiedTick} className="w-5 h-5 mr-2" />
                                <span>Verified</span>
                            </div>
                        )}
                    </div>

                    {/* Permissions Section - Only show if verified */}
                    {testConfigCheck && (
                        <div className="flex flex-col mt-6 border-t pt-6 space-y-6">
                            <h3 className="text-md font-medium">Permissions <span className="text-orange-500">*</span></h3>

                            {/* Group Permission Checkbox */}
                            <FormField control={form.control} name="group_permission" render={({ field }) => (
                                <FormItem className="flex justify-start items-center space-x-2 space-y-0 rounded-md border p-2">
                                    <FormControl>
                                        <Input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(e) => {
                                                field.onChange(e.target.checked);
                                                setButtonStatus("Sync Directory");
                                            }}
                                            className="w-4 h-4"
                                        />
                                    </FormControl>
                                    <FormLabel> Read Users By Group</FormLabel>
                                </FormItem>
                            )} />

                            {/* Group Selection - Only if permission checked */}
                            {groupPermission && (
                                <FormField control={form.control} name="selectedGroup" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Group from the list</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={groupList.map(g => ({ label: g.displayName, value: g.id }))}
                                                selectedValues={field.value || []}
                                                onSelectionChange={field.onChange}
                                                placeholder="Select Group"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-2">
                        {(buttonStatus !== "Test Config" && selectedStep === 1) && (
                            <Button
                                type="button"
                                onClick={handleEditConfig}
                            >
                                Edit Config
                            </Button>
                        )}

                        {buttonStatus === "Test Config" && (
                            <Button
                                type="button"
                                onClick={handleTestConfig}
                                disabled={disabledTestConfig}
                            >
                                {loading.testConfigurationLoading ? "Testing..." : "Test Config"}
                            </Button>
                        )}

                        {buttonStatus === "Sync Directory" && !groupPermission && (
                            <Button
                                type="button"
                                onClick={handleSyncDirectory}
                                disabled={disabledSyncDirectory}
                            >
                                {loading.syncDirectoryLoading ? "Syncing..." : "Sync Directory"}
                            </Button>
                        )}

                        {(buttonStatus === "Next" && groupPermission) && (
                            <Button
                                type="button"
                                onClick={() => setSelectedStep(selectedStep + 1)}
                            >
                                Next
                            </Button>
                        )}

                        {isCancel && buttonStatus === "Test Config" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelConfig}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AzureBasicInformation;