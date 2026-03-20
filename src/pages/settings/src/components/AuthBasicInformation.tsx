import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { useDirectoryTabStore } from "../store/directoryTabStore";
import VerifiedTick from "../assets/images/verified-tick.svg";
import MultiSelect from '@/components/ui/Multiselect';

type AuthBasicInformationProps = {
    selectedApp?: ActiveIntegrationApp;
}

const schema = z.object({
    client_id: z.string().min(1, "Client ID is required."),
    client_secret: z.string().min(1, "Client Secret is required."),
    domain_url: z.string().min(1, "Domain URL is required."),
    is_auto_revoke: z.boolean().default(false),
    group_permission: z.boolean().default(false),
    selectedGroup: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof schema>;

const AuthBasicInformation: React.FC<AuthBasicInformationProps> = ({ selectedApp }) => {
    const { toast } = useToast();
    const [testConfigCheck, setTestConfigCheck] = useState(false);
    const [isFormReadonly, setIsFormReadonly] = useState(false);
    const [groupList, setGroupList] = useState<any[]>([]);

    const { fetchGroups, testConfiguration, addIntegration, triggerSync, fetchUserAttributes, setSelectedApp, loading, selectedStep, setSelectedStep } = useDirectoryTabStore();
    const [buttonStatus, setButtonStatus] = useState<"Test Config" | "Sync Directory" | "Next">("Test Config");
    const [isCancel, setIsCancel] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            client_id: selectedApp?.basicInfo?.dirInfo?.client_id || "",
            client_secret: selectedApp?.basicInfo?.dirInfo?.client_secret || "",
            domain_url: selectedApp?.basicInfo?.dirInfo?.domain_url || "",
            is_auto_revoke: selectedApp?.basicInfo?.dirInfo?.is_auto_revoke || false,
            group_permission: selectedApp?.basicInfo?.dirInfo?.group_permission || false,
            selectedGroup: selectedApp?.basicInfo?.dirInfo?.selectedGroup || [],
        }
    });

    const { watch, reset, trigger } = form;
    const groupPermission = watch("group_permission");
    const clientId = watch("client_id");
    const clientSecret = watch("client_secret");
    const domainUrl = watch("domain_url");
    const selectedGroup = watch("selectedGroup");

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    useEffect(() => {
        if (selectedApp?.basicInfo?.dirInfo?.client_id) {
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
    }, [clientId, clientSecret, domainUrl]);

    // Fetch groups when permission is enabled
    useEffect(() => {
        if (groupPermission && testConfigCheck && groupList.length === 0) {
            getGroupList();
        }
    }, [groupPermission, testConfigCheck]);

    const getGroupList = async () => {
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
                const groups = result?.data?.data || [];
                setGroupList(groups);
            }
        } catch (error) {
            console.error("Error fetching groups", error);
        }
    };

    const handleTestConfig = async () => {
        const values = form.getValues();
        const valid = await trigger(["client_id", "client_secret", "domain_url"]);
        if (!valid) return;

        const payload = {
            client_id: values.client_id,
            client_secret: values.client_secret,
            domain_url: values.domain_url,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        const result = await testConfiguration(selectedApp?.app?.appName || "auth0", payload);
        if (result?.status === "success") {
            setTestConfigCheck(true);
            setIsFormReadonly(true);
            setButtonStatus("Sync Directory");
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
            orgId: tenantId,
            orgName: urlIdentifier,
            configuration: {
                ...values,
                grant_type: 'client_credentials'
            },
            last_synced_on: new Date().toISOString(),
            created_on: new Date().toISOString(),
            created_by: urlIdentifier,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
            is_auto_revoke: values.is_auto_revoke,
        };

        const result = await addIntegration(payload);
        if (result?.status === "success" || result?.status === true) {
            const syncPayload = {
                client_id: values.client_id,
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
                            dirInfo: values
                        }
                    };
                    setSelectedApp(updatedApp);
                    setButtonStatus("Next");
                    toast({
                        variant: "success",
                        title: "Success",
                        description: "Directory Synced Successfully",
                    });
                    setSelectedStep(selectedStep + 1);
                }
            }
        }
    };

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
        reset({
            client_id: selectedApp?.basicInfo?.dirInfo?.client_id || "",
            client_secret: selectedApp?.basicInfo?.dirInfo?.client_secret || "",
            domain_url: selectedApp?.basicInfo?.dirInfo?.domain_url || "",
            is_auto_revoke: selectedApp?.basicInfo?.dirInfo?.is_auto_revoke || false,
            group_permission: selectedApp?.basicInfo?.dirInfo?.group_permission || false,
            selectedGroup: selectedApp?.basicInfo?.dirInfo?.selectedGroup || [],
        });
    };

    return (
        <div className="flex flex-col mt-8 w-full max-w-3xl">
            <div className="text-xl">Add Basic Information</div>
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
                                    disabled={isFormReadonly && testConfigCheck}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Domain URL */}
                    <FormField control={form.control} name="domain_url" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Domain URL <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Enter Domain URL"
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

                    {/* Additional Options (Auto Revoke & Permissions) */}
                    {testConfigCheck && (
                        <div className="flex flex-col border-t pt-6 space-y-6">
                            <h3 className="text-md font-medium">Permissions <span className="text-orange-500">*</span></h3>

                            <FormField control={form.control} name="is_auto_revoke" render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Enable Auto Deletion for User</FormLabel>
                                </FormItem>
                            )} />

                            <div className="flex flex-col space-y-4">
                                <FormField control={form.control} name="group_permission" render={({ field }) => (
                                    <FormItem className="flex justify-start items-center space-x-2 space-y-0 rounded-md border p-2">
                                        <FormControl>
                                            <Input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="w-4 h-4"
                                            />
                                        </FormControl>
                                        <FormLabel> Read Users By Group</FormLabel>
                                    </FormItem>
                                )} />

                                {groupPermission && (
                                    <FormField control={form.control} name="selectedGroup" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Group from the list</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={groupList.map(g => ({ label: g.name, value: g.id }))}
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
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-2">
                        {buttonStatus !== "Test Config" && (
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
                                disabled={loading.testConfigurationLoading || !clientId || !clientSecret || !domainUrl}
                            >
                                {loading.testConfigurationLoading ? "Testing..." : "Test Config"}
                            </Button>
                        )}

                        {buttonStatus === "Sync Directory" && (
                            <Button
                                type="button"
                                onClick={handleSyncDirectory}
                                disabled={loading.syncDirectoryLoading}
                            >
                                {loading.syncDirectoryLoading ? "Syncing..." : "Sync Directory"}
                            </Button>
                        )}

                        {buttonStatus === "Next" && (
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
                                variant="ghost"
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

export default AuthBasicInformation;
