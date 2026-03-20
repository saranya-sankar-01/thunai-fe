import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { CheckCircle2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { requestApi } from '@/services/authService';
import { errorHandler } from '../lib/utils';
import { useToast } from "@/hooks/use-toast";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";

import VerifiedTick from "../assets/images/verified-tick.svg";
import { useDirectoryTabStore } from "../store/directoryTabStore";
import MultiSelect from '@/components/ui/Multiselect';

type AwsCognitoBasicInformationProps = {
    selectedApp: ActiveIntegrationApp
}

const schema = z.object({
    access_key_id: z.string().min(1, "Access Key ID is required."),
    secret_access_key: z.string().min(1, "Secret Access Key is required."),
    region: z.string().min(1, "Region is required."),
    user_pool_id: z.string().min(1, "User Pool ID is required."),
    is_auto_revoke: z.boolean().default(false),
    group_permission: z.boolean().default(false),
    selectedGroup: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof schema>;

const AwsCognitoBasicInformation: React.FC<AwsCognitoBasicInformationProps> = ({ selectedApp }) => {
    const { toast } = useToast();
    const [testConfigCheck, setTestConfigCheck] = useState(false);
    const [groupList, setGroupList] = useState<any[]>([]);
    const [isFormReadonly, setIsFormReadonly] = useState(false);

    const { fetchGroups, testConfiguration, addIntegration, triggerSync, fetchUserAttributes, setSelectedApp, loading, selectedStep, setSelectedStep } = useDirectoryTabStore();
    const [buttonStatus, setButtonStatus] = useState<"Test Config" | "Sync Directory" | "Next">("Test Config");
    const [isCancel, setIsCancel] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            access_key_id: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.access_key_id ?? "",
            secret_access_key: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.secret_access_key ?? "",
            region: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.region ?? "",
            user_pool_id: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.user_pool_id ?? "",
            is_auto_revoke: selectedApp.basicInfo?.dirInfo?.is_auto_revoke ?? false,
            group_permission: selectedApp.basicInfo?.dirInfo?.configuration?.group_permission ?? false,
            selectedGroup: selectedApp.basicInfo?.dirInfo?.configuration?.selectedGroup ?? []
        }
    });

    const { watch, reset, trigger } = form;
    const groupPermission = watch("group_permission");
    const accessKeyId = watch("access_key_id");
    const secretAccessKey = watch("secret_access_key");
    const region = watch("region");
    const userPoolId = watch("user_pool_id");
    const selectedGroup = watch("selectedGroup");

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    // Reset verification if critical fields change
    useEffect(() => {
        if (testConfigCheck && !isFormReadonly) {
            setTestConfigCheck(false);
            setButtonStatus("Test Config");
            setIsCancel(false);
        }
    }, [accessKeyId, secretAccessKey, region, userPoolId]);

    useEffect(() => {
        if (selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.access_key_id) {
            setTestConfigCheck(true);
            setIsFormReadonly(true);
            setButtonStatus("Next");
        }
    }, [selectedApp]);

    // Fetch groups when permission is enabled
    useEffect(() => {
        if (groupPermission && testConfigCheck && groupList.length === 0) {
            getGroupList();
        }
    }, [groupPermission, testConfigCheck]);

    const getGroupList = async () => {
        if (!accessKeyId) return;

        const payload = {
            query: { access_key_id: accessKeyId, orgId: tenantId },
            filter: [
                {
                    key_name: "access_key_id",
                    operator: "==",
                    key_value: accessKeyId
                }
            ],
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        try {
            const result = await fetchGroups(payload);
            if (result?.status === "success") {
                const groups = result?.data?.data?.[0]?.data || [];
                setGroupList(groups);
            }
        } catch (error) {
            console.error("Error fetching groups", error);
        }
    };

    const handleTestConfig = async () => {
        const values = form.getValues();
        const valid = await trigger(["access_key_id", "secret_access_key", "region", "user_pool_id"]);
        if (!valid) return;

        const payload = {
            access_key_id: values.access_key_id,
            secret_access_key: values.secret_access_key,
            region: values.region,
            user_pool_id: values.user_pool_id,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        const result = await testConfiguration(selectedApp?.app?.appName || "awscognito", payload);
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
                aws_config: {
                    access_key_id: values.access_key_id,
                    secret_access_key: values.secret_access_key,
                    region: values.region,
                    user_pool_id: values.user_pool_id,
                },
                group_permission: values.group_permission,
                selectedGroup: values.selectedGroup,
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
                access_key_id: values.access_key_id,
                groupIds: values.selectedGroup,
                infisigntenantId: tenantId,
                tenantUniqueIdentifier: tenantId,
                urlIdentifier: urlIdentifier,
                is_sync: false,
            };

            const syncResult = await triggerSync(selectedApp.app.appName, syncPayload);
            if (syncResult?.status === "success") {
                const attributesResult = await fetchUserAttributes(selectedApp.app.appName, values.access_key_id, urlIdentifier, tenantId);
                if (attributesResult?.status === "success") {
                    const updatedApp = {
                        ...selectedApp,
                        basicInfo: {
                            attributes: attributesResult.data,
                            dirInfo: { aws_config: values }
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

    const disabledTestConfig = loading.testConfigurationLoading || !accessKeyId || !secretAccessKey || !region || !userPoolId;
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
        reset({
            access_key_id: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.access_key_id ?? "",
            secret_access_key: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.secret_access_key ?? "",
            region: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.region ?? "",
            user_pool_id: selectedApp.basicInfo?.dirInfo?.configuration?.aws_config?.user_pool_id ?? "",
            is_auto_revoke: selectedApp.basicInfo?.dirInfo?.is_auto_revoke ?? false,
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
                href="https://docs.thunai.ai/article/132-aws-cognito-directory-integration-with-thunai"
            >📄 {selectedApp?.app?.appName} Directory Integration</a>
            <Form {...form}>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

                    {/* Access Key ID */}
                    <FormField control={form.control} name="access_key_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Access Key ID <span className="text-orange-500">*</span></FormLabel>
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

                    {/* Secret Access Key */}
                    <FormField control={form.control} name="secret_access_key" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Secret Access Key <span className="text-orange-500">*</span></FormLabel>
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

                    {/* Region */}
                    <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Region <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Ex. us-east-1"
                                    disabled={isFormReadonly && testConfigCheck}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* User Pool ID */}
                    <FormField control={form.control} name="user_pool_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">User Pool ID <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Ex. ap-south-xx_xxxxx"
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
                            {/* Auto Revoke */}
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
                                {/* Group Permission Checkbox */}
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

                                {/* Group Selection */}
                                {groupPermission && (
                                    <FormField control={form.control} name="selectedGroup" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Group from the list</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={groupList.map(g => ({ label: g.GroupName, value: g.GroupName }))}
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
                                disabled={disabledTestConfig}
                            >
                                {loading ? "Testing..." : "Test Config"}
                            </Button>
                        )}

                        {buttonStatus === "Sync Directory" && (
                            <Button
                                type="button"
                                onClick={handleSyncDirectory}
                                disabled={disabledSyncDirectory}
                            >
                                {loading ? "Syncing..." : "Sync Directory"}
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

export default AwsCognitoBasicInformation;
