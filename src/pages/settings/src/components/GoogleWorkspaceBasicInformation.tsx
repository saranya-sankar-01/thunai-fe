import React, { useEffect, useState, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { CheckCircle2, Trash2, Upload } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { useDirectoryTabStore } from "../store/directoryTabStore";
import VerifiedTick from "../assets/images/verified-tick.svg";

type GoogleWorkspaceBasicInformationProps = {
    selectedApp: ActiveIntegrationApp
}

const schema = z.object({
    client_id: z.string().min(1, "Client ID is required."),
    userEmail: z.string().email("Invalid Email ID format.").min(1, "Email ID is required."),
    is_auto_revoke: z.boolean().default(false),
    // Hidden fields derived from the JSON file
    private_key: z.string().optional(),
    client_email: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;

const GoogleWorkspaceBasicInformation: React.FC<GoogleWorkspaceBasicInformationProps> = ({ selectedApp }) => {
    const { toast } = useToast();
    const [testConfigCheck, setTestConfigCheck] = useState(false);
    const [isFormReadonly, setIsFormReadonly] = useState(false);
    const [fileName, setFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { testConfiguration, addIntegration, triggerSync, fetchUserAttributes, setSelectedApp, loading, selectedStep, setSelectedStep } = useDirectoryTabStore();
    const [buttonStatus, setButtonStatus] = useState<"Test Config" | "Sync Directory" | "Next">("Test Config");
    const [isCancel, setIsCancel] = useState(false);
    const [googleData, setGoogleData] = useState<any>({});

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            client_id: "",
            userEmail: "",
            is_auto_revoke: false,
            private_key: "",
            client_email: ""
        }
    });

    const { watch, reset, setValue, trigger } = form;
    const userEmail = watch("userEmail");
    const clientId = watch("client_id");

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    useEffect(() => {
        if (selectedApp.basicInfo?.dirInfo?.client_id || selectedApp.basicInfo?.dirInfo?.googleConfig) {
            setTestConfigCheck(true);
            setIsFormReadonly(true);
            setButtonStatus("Next");
            if (selectedApp.basicInfo.dirInfo.googleConfig) {
                const config = selectedApp.basicInfo.dirInfo.googleConfig;
                setGoogleData(config);
                reset({
                    client_id: config.client_id || selectedApp.basicInfo.dirInfo.client_id,
                    userEmail: config.userEmail || selectedApp.basicInfo.dirInfo.userEmail,
                    is_auto_revoke: selectedApp.basicInfo.dirInfo.is_auto_revoke || false,
                    private_key: config.private_key,
                    client_email: config.client_email
                });
            }
        }
    }, [selectedApp]);

    // Reset verification if critical fields change
    useEffect(() => {
        if (testConfigCheck && !isFormReadonly) {
            setTestConfigCheck(false);
            setButtonStatus("Test Config");
            setIsCancel(false);
        }
    }, [userEmail, clientId]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const parts = file.name.split('.');
        if (parts.length > 2) {
            toast({
                variant: "error",
                title: "Error",
                description: "Filename with two extensions is not supported due security restrictions",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: "error",
                title: "Error",
                description: "The file size exceeds the limit of 5MB. Please upload a smaller file.",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                setGoogleData(data);
                setValue("client_id", data.client_id || "");
                setValue("private_key", data.private_key || "");
                setValue("client_email", data.client_email || "");
                setFileName(file.name);
                trigger("client_id");
            } catch (error) {
                console.error("Error parsing JSON", error);
                toast({
                    variant: "error",
                    title: "Error",
                    description: "Invalid JSON file content.",
                });
            }
        };
        reader.readAsText(file);
    };

    const removeFile = () => {
        setFileName("");
        setGoogleData({});
        setValue("client_id", "");
        setValue("private_key", "");
        setValue("client_email", "");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleTestConfig = async () => {
        const values = form.getValues();
        const valid = await trigger(["client_id", "userEmail"]);
        if (!valid) return;

        const payload = {
            client_id: values.client_id,
            userEmail: values.userEmail,
            private_key: googleData?.private_key,
            client_email: googleData?.client_email,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        const result = await testConfiguration(selectedApp?.app?.appName || "googleworkspace", payload);
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
        }
    };

    const handleSyncDirectory = async () => {
        const values = form.getValues();
        const payload = {
            integrationType: selectedApp.app.appName,
            orgId: tenantId,
            orgName: urlIdentifier,
            configuration: {
                client_id: values.client_id,
                googleConfig: {
                    ...googleData,
                    userEmail: values.userEmail
                }
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
                            dirInfo: {
                                ...values,
                                googleConfig: {
                                    ...googleData,
                                    userEmail: values.userEmail
                                }
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
        // Re-patch original values if needed
        if (selectedApp.basicInfo?.dirInfo?.googleConfig) {
            const config = selectedApp.basicInfo.dirInfo.googleConfig;
            reset({
                client_id: config.client_id || selectedApp.basicInfo.dirInfo.client_id,
                userEmail: config.userEmail || selectedApp.basicInfo.dirInfo.userEmail,
                is_auto_revoke: selectedApp.basicInfo.dirInfo.is_auto_revoke || false,
                private_key: config.private_key,
                client_email: config.client_email
            });
        }
    };

    return (
        <div className="flex flex-col mt-8 w-full max-w-3xl">
            <div className="text-xl">Add Basic Information</div>
            <a
                className="text-blue-700 font-light mb-5"
                target="_blank"
                href="https://docs.thunai.ai/article/133-google-workspace-directory-integration-with-thunai"
            >📄 {selectedApp?.app?.appName} Directory Integration</a>
            <Form {...form}>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>

                    {/* JSON Config File */}
                    <div className="flex flex-col">
                        <div className="text-md font-medium mb-2">JSON config File <span className="text-orange-500">*</span></div>
                        <div className="w-full flex flex-row">
                            <div className="flex items-center justify-start w-full">
                                <div className="flex flex-row bg-[#ebf0ff] border border-blue-700 rounded h-10 w-full items-center relative">
                                    <label className="flex items-center justify-center text-blue-700 cursor-pointer w-full h-full">
                                        {!fileName ? (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                <span className="text-sm font-medium">Upload</span>
                                            </>
                                        ) : (
                                            <span className="text-sm px-4 truncate">{fileName}</span>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".json"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={isFormReadonly && testConfigCheck}
                                        />
                                    </label>
                                </div>

                                {fileName && !(isFormReadonly && testConfigCheck) && (
                                    <div className="flex justify-center ml-4">
                                        <Trash2
                                            className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                                            onClick={removeFile}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-xs mt-1 text-gray-500"><span className="text-orange-500 mr-1">*</span>Only JSON type file is accepted</div>
                    </div>

                    {/* Client ID */}
                    <FormField control={form.control} name="client_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Client ID <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Ex. 80809-32123-3123-213-321312"
                                    disabled={true} // Always read-only as it comes from file
                                    {...field}
                                    className="bg-gray-50"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Email ID */}
                    <FormField control={form.control} name="userEmail" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-md">Email ID <span className="text-orange-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    placeholder="Enter Google Workspace Super Admin Email ID"
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

                    {/* Additional Options (Auto Revoke) */}
                    {testConfigCheck && (
                        <div className="flex flex-col mt-6 border-t pt-6 space-y-6">
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
                                disabled={loading.testConfigurationLoading || !watch("client_id") || !watch("userEmail")}
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

export default GoogleWorkspaceBasicInformation;
