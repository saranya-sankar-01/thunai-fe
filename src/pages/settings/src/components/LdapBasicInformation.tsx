import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Eye, EyeOff, Plus, Minus, Trash2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import MultiSelect from "@/components/ui/Multiselect";
import { useToast } from "@/hooks/use-toast";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { useDirectoryTabStore } from "../store/directoryTabStore";

import VerifiedTick from "../assets/images/verified-tick.svg";

type LdapBasicInformationProps = {
    selectedApp: ActiveIntegrationApp;
}

const userBaseDNRegex = /^([a-zA-Z]+=[^,]+)(,\s*[a-zA-Z]+=[^,]+)*$/;

const schema = z.object({
    client_id: z.string().min(1, "LDAP URL is required."), // Maps to client_id in backend
    adminUsername: z.string().min(1, "Admin Username is required."),
    adminPassword: z.string().min(1, "Admin Password is required."),
    userBaseDN: z.array(z.object({
        value: z.string().regex(userBaseDNRegex, "Invalid User Base DN format")
    })).min(1, "At least one User Base DN is required"),
    groupBaseDN: z.string().optional(),
    privateVPC: z.boolean().default(false),
    is_auto_revoke: z.boolean().default(false),
    group_permission: z.boolean().default(false),
    selectedGroup: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof schema>;

const LdapBasicInformation: React.FC<LdapBasicInformationProps> = ({ selectedApp }) => {
    const { toast } = useToast();
    const [testConfigCheck, setTestConfigCheck] = useState(false);
    const [isFormReadonly, setIsFormReadonly] = useState(false);
    const [groupList, setGroupList] = useState<any[]>([]);

    const { fetchGroups, testConfiguration, addIntegration, triggerSync, fetchUserAttributes, setSelectedApp, loading, selectedStep, setSelectedStep } = useDirectoryTabStore();
    const [buttonStatus, setButtonStatus] = useState<"Test Config" | "Sync Directory" | "Next">("Test Config");
    const [isCancel, setIsCancel] = useState(false);

    // Visibility toggles
    const [showUrl, setShowUrl] = useState(false);
    const [showAdminUser, setShowAdminUser] = useState(false);
    const [showAdminPass, setShowAdminPass] = useState(false);
    const [showGroupBaseDN, setShowGroupBaseDN] = useState(false);

    // Temporary input for adding User Base DN
    const [currentUserBaseDN, setCurrentUserBaseDN] = useState("");
    const [userBaseDNError, setUserBaseDNError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            client_id: selectedApp?.basicInfo?.dirInfo?.client_id || "",
            adminUsername: selectedApp?.basicInfo?.dirInfo?.adminUsername || "",
            adminPassword: selectedApp?.basicInfo?.dirInfo?.adminPassword || "",
            userBaseDN: selectedApp?.basicInfo?.dirInfo?.userBaseDN || [],
            groupBaseDN: selectedApp?.basicInfo?.dirInfo?.groupBaseDN || "",
            privateVPC: selectedApp?.basicInfo?.dirInfo?.privateVPC || false,
            is_auto_revoke: selectedApp?.basicInfo?.dirInfo?.is_auto_revoke || false,
            group_permission: selectedApp?.basicInfo?.dirInfo?.group_permission || false,
            selectedGroup: selectedApp?.basicInfo?.dirInfo?.selectedGroup || []
        }
    });

    const { control, watch, reset, setValue, trigger } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "userBaseDN"
    });

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    const clientId = watch("client_id");
    const groupPermission = watch("group_permission");
    const adminUsername = watch("adminUsername");
    const adminPassword = watch("adminPassword");
    const userBaseDN = watch("userBaseDN");
    const groupBaseDN = watch("groupBaseDN");
    const privateVPC = watch("privateVPC");

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
    }, [clientId, adminUsername, adminPassword, userBaseDN, groupBaseDN, privateVPC]);

    // Fetch groups when permission is enabled
    useEffect(() => {
        if (groupPermission && testConfigCheck && groupList.length === 0) {
            getGroupList();
        }
    }, [groupPermission, testConfigCheck]);

    const handleAddUserBaseDN = () => {
        if (!currentUserBaseDN) return;
        if (!userBaseDNRegex.test(currentUserBaseDN)) {
            setUserBaseDNError("Invalid User Base DN format");
            return;
        }
        const exists = fields.some(f => f.value.toLowerCase() === currentUserBaseDN.toLowerCase());
        if (exists) {
            setUserBaseDNError("This User Base DN already exists");
            return;
        }
        append({ value: currentUserBaseDN });
        setCurrentUserBaseDN("");
        setUserBaseDNError(null);
    };

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
                const groups = result.data?.data?.data?.map((g: any) => ({
                    ...g,
                    id: g.dn,
                    displayName: g.attributes
                })) || [];
                setGroupList(groups);
            }
        } catch (error) {
            console.error("Error fetching groups", error);
        }
    };

    const handleTestConfig = async () => {
        const values = form.getValues();
        const valid = await trigger(["client_id", "adminUsername", "adminPassword", "userBaseDN"]);
        if (!valid) return;

        const payload = {
            client_id: values.client_id,
            admin_username: values.adminUsername,
            admin_password: values.adminPassword,
            userBaseDN: values.userBaseDN,
            groupBaseDN: values.groupBaseDN,
            privateVPC: values.privateVPC,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        const result = await testConfiguration(selectedApp?.app?.appName || "ldap", payload);
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
            configuration: values,
            last_synced_on: new Date().toISOString(),
            created_on: new Date().toISOString(),
            created_by: urlIdentifier,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
            is_auto_revoke: values.is_auto_revoke,
            appType: 'LDAP',
        };

        const result = await addIntegration(payload);
        if (result?.status === "success" || result?.status === true) {
            const syncPayload = {
                ...values,
                groupIds: values.selectedGroup,
                infisigntenantId: tenantId,
                tenantUniqueIdentifier: tenantId,
                urlIdentifier: urlIdentifier,
                is_sync: false,
            };

            const syncResult = await triggerSync(selectedApp.app.appName, syncPayload);
            if (syncResult?.status === "success") {
                const attributesResult = await fetchUserAttributes(selectedApp.app.appName, values.client_id, urlIdentifier, tenantId, values.privateVPC);
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
            adminUsername: selectedApp?.basicInfo?.dirInfo?.adminUsername || "",
            adminPassword: selectedApp?.basicInfo?.dirInfo?.adminPassword || "",
            userBaseDN: selectedApp?.basicInfo?.dirInfo?.userBaseDN || [],
            groupBaseDN: selectedApp?.basicInfo?.dirInfo?.groupBaseDN || "",
            privateVPC: selectedApp?.basicInfo?.dirInfo?.privateVPC || false,
            is_auto_revoke: selectedApp?.basicInfo?.dirInfo?.is_auto_revoke || false,
            group_permission: selectedApp?.basicInfo?.dirInfo?.group_permission || false,
            selectedGroup: selectedApp?.basicInfo?.dirInfo?.selectedGroup || []
        });
    };

    return (
        <div className="flex flex-col mt-8 w-full max-w-3xl">
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>

                    {/* LDAP URL */}
                    <FormField control={form.control} name="client_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">LDAP URL <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showUrl ? "text" : "password"}
                                        placeholder="Ex. ldap://xxx.xxx.xxx.xxx"
                                        disabled={isFormReadonly && testConfigCheck}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowUrl(!showUrl)}
                                    >
                                        {showUrl ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Admin Username */}
                    <FormField control={form.control} name="adminUsername" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Admin Username <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showAdminUser ? "text" : "password"}
                                        placeholder="Ex. admin"
                                        disabled={isFormReadonly && testConfigCheck}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowAdminUser(!showAdminUser)}
                                    >
                                        {showAdminUser ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Admin Password */}
                    <FormField control={form.control} name="adminPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Admin Password <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showAdminPass ? "text" : "password"}
                                        placeholder="Ex. ********"
                                        disabled={isFormReadonly && testConfigCheck}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowAdminPass(!showAdminPass)}
                                    >
                                        {showAdminPass ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* User Base DN */}
                    <div className="flex flex-col space-y-2">
                        <FormLabel className="text-md">User Base DN <span className="text-orange-500">*</span></FormLabel>
                        <div className="flex flex-row space-x-2">
                            <div className="w-full">
                                <Input
                                    value={currentUserBaseDN}
                                    onChange={(e) => setCurrentUserBaseDN(e.target.value)}
                                    placeholder="Ex. ou=Users,dc=example,dc=com"
                                    disabled={isFormReadonly && testConfigCheck}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddUserBaseDN();
                                        }
                                    }}
                                    className={userBaseDNError ? "border-red-500" : ""}
                                />
                                {userBaseDNError && <div className="text-red-500 text-xs mt-1">{userBaseDNError}</div>}
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddUserBaseDN}
                                disabled={(isFormReadonly && testConfigCheck) || !currentUserBaseDN}
                                className="bg-green-500 hover:bg-green-600 rounded-full w-10 h-10 p-0"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* List of Added DNs */}
                        {fields.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {fields.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <span className="text-sm font-medium break-all">{item.value}</span>
                                        <Button
                                            type="button"
                                            onClick={() => remove(index)}
                                            disabled={isFormReadonly && testConfigCheck}
                                            variant="destructive"
                                            className="rounded-full w-8 h-8 p-0"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="text-xs text-gray-500">
                                    {fields.length} User Base DN{fields.length > 1 ? "s" : ""} added
                                </div>
                            </div>
                        )}
                        <FormMessage>
                            {form.formState.errors.userBaseDN?.message || (form.formState.errors.userBaseDN as any)?.root?.message}
                        </FormMessage>
                    </div>

                    {/* Group Base DN */}
                    <FormField control={form.control} name="groupBaseDN" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Group Base DN</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showGroupBaseDN ? "text" : "password"}
                                        placeholder="Ex. ou=Groups,dc=example,dc=com"
                                        disabled={isFormReadonly && testConfigCheck}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowGroupBaseDN(!showGroupBaseDN)}
                                    >
                                        {showGroupBaseDN ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Private VPC */}
                    <FormField control={form.control} name="privateVPC" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Private VPC</FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isFormReadonly && testConfigCheck}
                                />
                            </FormControl>
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

                    {/* Post-Verification sections */}
                    {testConfigCheck && (
                        <div className="flex flex-col mt-6 border-t pt-6 space-y-6">
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
                                disabled={loading.testConfigurationLoading || !clientId || !adminUsername || !adminPassword || fields.length === 0}
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

export default LdapBasicInformation;
