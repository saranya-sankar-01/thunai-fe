import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCustomSettingsStore } from "../store/customSettingsStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const cloudStorageSchema = z.object({
    storage_type: z.string().optional(),
    credentials: z.object({
        aws_access_key: z.string().optional(),
        aws_secret_key: z.string().optional(),
        aws_bucket_name: z.string().optional(),
        azure_connection_string: z.string().optional(),
        azure_container_name: z.string().optional(),
    })
});

const CloudStorage: React.FC = () => {
    const { toast } = useToast();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const tenantId = userInfo?.default_tenant_id ?? localStorage.getItem('tenant_id');
    const { cloudStorageData, getCloudStorageList, saveCloudStorageConfig, loading } = useCustomSettingsStore();
    const cloudForm = useForm({
        resolver: zodResolver(cloudStorageSchema),
        defaultValues: {
            storage_type: "aws_s3",
            credentials: {
                aws_access_key: '',
                aws_secret_key: '',
                aws_bucket_name: '',
                azure_connection_string: '',
                azure_container_name: '',
            }
        }
    });

    useEffect(() => {
        if (cloudStorageData) {
            cloudForm.reset({
                storage_type: cloudStorageData.storage_type,
                credentials: {
                    aws_access_key: cloudStorageData.storage_type === "aws_s3" ? cloudStorageData.credentials.aws_access_key : '',
                    aws_secret_key: cloudStorageData.storage_type === "aws_s3" ? cloudStorageData.credentials.aws_secret_key : '',
                    aws_bucket_name: cloudStorageData.storage_type === "aws_s3" ? cloudStorageData.credentials.aws_bucket_name : '',
                    azure_connection_string: cloudStorageData.storage_type === "azure_blob" ? cloudStorageData.credentials.azure_connection_string : '',
                    azure_container_name: cloudStorageData.storage_type === "azure_blob" ? cloudStorageData.credentials.azure_container_name : '',
                }
            });
        }
    }, [cloudStorageData, cloudForm]);

    const onCloudSubmit = async (data: any) => {
        const payload = {
            storage_type: data.storage_type,
            credentials: data.storage_type === 'aws_s3'
                ? {
                    aws_access_key: data.credentials.aws_access_key,
                    aws_secret_key: data.credentials.aws_secret_key,
                    aws_bucket_name: data.credentials.aws_bucket_name
                }
                : {
                    azure_connection_string: data.credentials.azure_connection_string,
                    azure_container_name: data.credentials.azure_container_name
                }
        };

        const res = await saveCloudStorageConfig(tenantId, payload);
        if (res.status === 'success') {
            toast({ title: "Success", variant: "success", description: "Cloud storage configuration saved." });
            getCloudStorageList(tenantId);
        }
    };
    return (
        <>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Cloud Storage Integration</h2>
            <Form {...cloudForm}>
                <form onSubmit={cloudForm.handleSubmit(onCloudSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <FormField control={cloudForm.control} name="storage_type" render={({ field }) => (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className={cn(
                                "flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                                field.value === 'aws_s3' && "border-blue-500"
                            )}>
                                <Input
                                    type="radio"
                                    checked={field.value === 'aws_s3'}
                                    onChange={() => field.onChange("aws_s3")}
                                    className="h-4 w-4 text-blue-600 mr-2"
                                />
                                <div className="flex items-center">
                                    <img src="https://storage.googleapis.com/thunai-media/integration-app-logo/aws_s3.png" alt="S3" className="h-8 mr-2" />
                                    <span className="text-gray-700 font-medium">Amazon S3</span>
                                </div>
                            </label>

                            <label className={cn(
                                "flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                                field.value === 'azure_blob' && "border-blue-500"
                            )}>
                                <Input
                                    type="radio"
                                    checked={field.value === 'azure_blob'}
                                    onChange={() => field.onChange("azure_blob")}
                                    className="h-4 w-4 text-blue-600 mr-2"
                                />
                                <div className="flex items-center">
                                    <img src="https://storage.googleapis.com/thunai-media/integration-app-logo/azure_blob.png" alt="Azure" className="h-8 mr-2" />
                                    <span className="text-gray-700 font-medium">Azure Blob Storage</span>
                                </div>
                            </label>
                        </div>
                    )} />

                    <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-3">
                        <h3 className="text-base font-medium text-gray-800 mb-3">
                            {cloudForm.watch('storage_type') === 'aws_s3' ? 'AWS S3 Access Details' : 'Azure Connection Credentials'}
                        </h3>

                        {cloudForm.watch('storage_type') === 'aws_s3' ? (
                            <div key="aws-credentials" className="space-y-3">
                                <FormField control={cloudForm.control} name="credentials.aws_access_key" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Access Key</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="AKIAXXXXXXXXXXXXXXXX" />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={cloudForm.control} name="credentials.aws_secret_key" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Secret Key</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} placeholder="Your secret access key" />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={cloudForm.control} name="credentials.aws_bucket_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bucket Name</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} placeholder="your-bucket-name" />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        ) : (
                            <div key="azure-credentials" className="space-y-3">
                                <FormField control={cloudForm.control} name="credentials.azure_connection_string" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Connection String</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="DefaultEndpointsProtocol=https..." />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={cloudForm.control} name="credentials.azure_container_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Container Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="data-container-01" />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading.connectFileUpload}
                        >
                            {loading.connectFileUpload ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
};

export default CloudStorage;
