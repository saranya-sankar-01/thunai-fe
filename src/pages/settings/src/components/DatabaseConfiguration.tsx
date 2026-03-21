import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Copy, Cpu, Loader2, Server, TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCustomSettingsStore } from "../store/customSettingsStore";
import { useToast } from "@/hooks/use-toast";

const databaseSchema = z.object({
    database_uri: z.string().min(1, "Database URI is required"),
    type: z.array(z.string()).min(1, "At least one storage type must be selected"),
    prefix: z.string().optional(),
    status: z.string().optional(),
});



const DatabaseConfiguration: React.FC = () => {
    const { toast } = useToast();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const tenantId = userInfo?.default_tenant_id ?? localStorage.getItem('tenant_id');
    const { connectDatabaseStep, setConnectDatabaseStep, submitForwardRule, saveDatabaseConfig, getForwardRule, getDatabaseList, getCloudStorageList, pollForwardRule, databaseData, downloadForwardJson, loading } = useCustomSettingsStore();
    const dbForm = useForm({
        resolver: zodResolver(databaseSchema),
        defaultValues: {
            database_uri: '',
            type: [],
            prefix: '',
            status: ''
        }
    });

    const handleJsonDownload = useCallback(async (path: string) => {
        const blob = await downloadForwardJson(path);
        if (blob) {
            setConnectDatabaseStep('DATABASE');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = path.split('/').pop() || 'forward_manager.json';
            a.click();
            window.URL.revokeObjectURL(url);
            toast({ title: "Success", description: "Forward rule configuration downloaded." });
        }
    }, [downloadForwardJson, setConnectDatabaseStep, toast]);

    const startPolling = useCallback((prefix: string) => {
        const poll = async () => {
            const res = await pollForwardRule(tenantId, prefix);
            if (res.status === 'success') {
                handleJsonDownload(res.file_path);
            } else {
                setTimeout(poll, 30000);
            }
        };
        poll();
    }, [handleJsonDownload, pollForwardRule, tenantId]);

    useEffect(() => {
        if (tenantId) {
            getForwardRule(tenantId).then((data) => {
                if (data) {
                    dbForm.reset({
                        prefix: data.forwarding_rule_prefix || '',
                        status: data.status || '',
                        database_uri: '',
                        type: []
                    });
                    if (data.message.status === 'done') {
                        getDatabaseList(tenantId).then(() => {
                            if (databaseData) {
                                dbForm.setValue('database_uri', databaseData.database_uri);
                                dbForm.setValue('type', databaseData.type || []);
                            }
                        });
                        setConnectDatabaseStep('DATABASE');
                    } else if (data.message.status === 'started' || data.message.status === 'pending') {
                        setConnectDatabaseStep('DATAPOOLING');
                        startPolling(data.forwarding_rule_prefix);
                    }
                }
            });
            getCloudStorageList(tenantId);
        }
    }, [databaseData, dbForm, getCloudStorageList, getDatabaseList, getForwardRule, setConnectDatabaseStep, startPolling, tenantId]);

    useEffect(() => {
        if (databaseData) {
            dbForm.setValue('database_uri', databaseData.database_uri || '');
            dbForm.setValue('type', databaseData.type || []);
        }
    }, [databaseData, dbForm]);

    const onDbSubmit = async (data: any) => {
        console.log("data", data);
        if (connectDatabaseStep === 'PREFIX') {
            if (data.status === 'started' || data.status === 'pending') {
                setConnectDatabaseStep('DATAPOOLING');
                startPolling(data.prefix);
                return;
            }
            const res = await submitForwardRule(tenantId, { prefix: data.prefix });
            if (res.status === 'success') {
                setConnectDatabaseStep('DATAPOOLING');
                startPolling(data.prefix);
            }
        } else {
            const res = await saveDatabaseConfig(tenantId, data);
            if (res.status === 'success') {
                toast({ title: "Success", description: "Database connected successfully." });
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: "Copied to clipboard" });
    };

    return (
        <Form {...dbForm}>
            <form onSubmit={dbForm.handleSubmit(onDbSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {connectDatabaseStep === 'PREFIX' && (
                    <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 space-y-4">
                        {!loading.getForwardRule ? (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-gray-700">Private Service Connect Endpoint Prefix</h3>
                                    <Button variant="ghost" type="button" onClick={() => copyToClipboard(dbForm.watch('prefix'))}>
                                        <Copy />
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">Find this on the VPC Networks page in the Google Cloud Platform.</p>
                                <Input className="xl:w-[60%]" {...dbForm.register("prefix")} />
                            </>
                        ) : (
                            <div className="animate-pulse flex flex-col gap-4">
                                <div className="h-4 bg-blue-100 rounded w-1/4"></div>
                                <div className="h-12 bg-blue-50 rounded w-full"></div>
                            </div>
                        )}
                    </div>
                )}

                {connectDatabaseStep === 'DATABASE' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-gray-900">Database URI</Label>
                            <Input
                                {...dbForm.register("database_uri")}
                                placeholder="mongodb://user:pass@host:27017/database"
                                className="h-14 font-mono text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-gray-50/30"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-gray-900">Storage Type Configuration</Label>
                            <div className="grid gap-4">
                                <label className={cn(
                                    "group flex items-start p-6 rounded-2xl border transition-all duration-300 cursor-pointer",
                                    dbForm.watch('type').includes('vectorstore') ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50/50"
                                )}>
                                    <input
                                        type="checkbox"
                                        value="vectorstore"
                                        className="h-5 w-5 mt-1 border-gray-300 text-blue-600 rounded-md focus:ring-blue-500"
                                        checked={dbForm.watch('type').includes('vectorstore')}
                                        onChange={(e) => {
                                            const current = dbForm.getValues('type');
                                            if (e.target.checked) dbForm.setValue('type', [...current, 'vectorstore']);
                                            else dbForm.setValue('type', current.filter(t => t !== 'vectorstore'));
                                        }}
                                    />
                                    <div className="ml-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Cpu className={cn("h-5 w-5", dbForm.watch('type').includes('vectorstore') ? "text-blue-600" : "text-gray-400")} />
                                            <span className="font-bold text-gray-900">Vector Storage</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Optimized for storing embeddings and semantic indices. Powers semantic search, RAG-driven responses, and conceptual data matching.
                                        </p>
                                    </div>
                                </label>

                                <label className={cn(
                                    "group flex items-start p-6 rounded-2xl border transition-all duration-300 cursor-pointer",
                                    dbForm.watch('type').includes('transactional') ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50/50"
                                )}>
                                    <input
                                        type="checkbox"
                                        value="transactional"
                                        className="h-5 w-5 mt-1 border-gray-300 text-blue-600 rounded-md focus:ring-blue-500"
                                        checked={dbForm.watch('type').includes('transactional')}
                                        onChange={(e) => {
                                            const current = dbForm.getValues('type');
                                            if (e.target.checked) dbForm.setValue('type', [...current, 'transactional']);
                                            else dbForm.setValue('type', current.filter(t => t !== 'transactional'));
                                        }}
                                    />
                                    <div className="ml-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TableIcon className={cn("h-5 w-5", dbForm.watch('type').includes('transactional') ? "text-blue-600" : "text-gray-400")} />
                                            <span className="font-bold text-gray-900">Transactional Data</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Standard structured data storage (CSV, JSON, Avro). Ideal for real-time AI workflows, analytics, and structured record keeping.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {connectDatabaseStep === 'DATAPOOLING' && (
                    <div className="flex flex-col items-center justify-center p-12 bg-blue-50/30 rounded-3xl border border-dashed border-blue-200 animate-in zoom-in-95 duration-700">
                        <div className="relative mb-6">
                            <div className="h-20 w-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <Server className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Configuring Private Link</h2>
                        <p className="text-gray-600 text-center max-w-sm leading-relaxed">
                            Wait several minutes as we generate your secure connection bridge. The configuration file will download automatically once ready.
                        </p>
                    </div>
                )}

                {connectDatabaseStep !== 'DATAPOOLING' && (
                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading.connectDatabase || loading.dataPooling}
                        >
                            {loading.connectDatabase || loading.dataPooling ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                connectDatabaseStep === 'PREFIX' ? 'Next' : 'Connect & Save'
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
};

export default DatabaseConfiguration;