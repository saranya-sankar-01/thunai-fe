import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { errorHandler, cn } from '../lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDirectoryTabStore } from "../store/directoryTabStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { timeZone } from '../lib/constants';

interface SchedularProps {
    selectedApp: ActiveIntegrationApp;
    onNext?: () => void;
}

const formSchema = z.object({
    jobperiod: z.enum(["onetime", "periodically"]),
    period: z.enum(["hours", "day"]).optional(),
    fromTime: z.string().optional(),
    timeZone: z.string().optional(),
}).refine(data => {
    if (data.jobperiod === "periodically" && data.period === "day") {
        return !!data.fromTime && !!data.timeZone;
    }
    return true;
}, {
    message: "Start Time and Time Zone are required for daily schedule",
    path: ["fromTime"] // Highlight fromTime, (or both)
});

type FormValues = z.infer<typeof formSchema>;

const Schedular: React.FC<SchedularProps> = ({ selectedApp, onNext }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const { fetchIntegrationDetails, saveScheduler, applySchedulerRules } = useDirectoryTabStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jobperiod: "onetime",
            period: "hours",
            fromTime: "",
            timeZone: "",
        }
    });

    const { watch, setValue, control } = form;
    const jobperiod = watch("jobperiod");
    const period = watch("period");

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    useEffect(() => {
        const fetchSchedulerData = async () => {
            const dirInfo = selectedApp?.basicInfo?.dirInfo || {};
            const id = dirInfo.configuration?.client_id || dirInfo.configuration?.aws_config?.access_key_id;

            if (!id) {
                setInitialLoading(false);
                return;
            }

            try {
                // We might need to fetch existing scheduler info if available.
                // Angular uses 'sharedDataService.data$' or 'requireData'. 
                // Let's assume we can fetch it from integration detail or scheduler endpoint?
                // The Angular component uses 'scheduler' input or data from shared service.
                // We'll optimistically try fetching integration info again or just default to new.
                // Assuming `integration/get` returns scheduler data as well as seen in Policies component step.
                // data shared via service in Angular version (sharedDataService).
                // We reuse fetchIntegrationDetails as it fetches the 'scheduler' node too.
                const result = await fetchIntegrationDetails(id, urlIdentifier);

                console.log(result);
                if (result?.status === "success" && result.data) {
                    const data = result.data;
                    if (data.scheduler) {
                        setValue("jobperiod", data.scheduler.scheduler_type);
                        if (data.scheduler.scheduler_type === "periodically" && data.scheduler.periodically) {
                            if (data.scheduler.periodically.everyHour) {
                                setValue("period", "hours");
                            } else if (data.scheduler.periodically.everyDay) {
                                setValue("period", "day");
                                setValue("fromTime", data.scheduler.periodically.fromTime || "");
                                setValue("timeZone", data.scheduler.periodically.timeZone || "");
                            }
                        }
                    }
                }

            } catch (error) {
                console.error("Error fetching scheduler info", error);
            } finally {
                setInitialLoading(false);
            }
        }
        fetchSchedulerData();
    }, [selectedApp, urlIdentifier, setValue]);

    const handleApplyRules = async (schedulerPayload: any, accessKeyId: string, clientId: string) => {
        const payload = {
            access_key_id: accessKeyId,
            client_id: clientId,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: "entrans",
            urlIdentifier: "entrans"
        };

        console.log(payload);

        // Filter out undefined keys
        if (!payload.access_key_id) delete (payload as any).access_key_id;
        if (!payload.client_id) delete (payload as any).client_id;

        try {
            const result = await applySchedulerRules(payload);

            if (result?.status === "success") {
                toast({
                    title: "Success",
                    variant: "success",
                    description: "Scheduler saved and rules applied successfully",
                });
                // if (onNext) onNext();
            } else {
                toast({
                    variant: "error",
                    description: result?.message || "Failed to apply rules",
                });
            }

        } catch (error: any) {
            errorHandler(error);
        }
    }

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        const dirInfo = selectedApp?.basicInfo?.dirInfo || {};
        let client_id = dirInfo?.configuration?.client_id;
        let access_key_id = dirInfo?.configuration?.aws_config?.access_key_id;

        console.log(client_id, access_key_id);

        // Construct payload
        const payload: any = {
            scheduler_type: values.jobperiod,
            periodically: {
                everyHour: false,
                everyDay: false,
                fromTime: "",
                timeZone: "",
            },
            schedulerRules: [],
            orgId: urlIdentifier,
            created_on: new Date().toISOString(),
            created_by: urlIdentifier,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: "entrans",
            urlIdentifier: "entrans",
        };

        if (client_id) payload.client_id = client_id;
        if (access_key_id) payload.access_key_id = access_key_id;

        if (values.jobperiod === "periodically") {
            payload.periodically = {
                everyHour: values.period === "hours",
                everyDay: values.period === "day",
                fromTime: values.fromTime || "",
                timeZone: values.timeZone || "",
            };
        }

        try {
            const result = await saveScheduler(payload);
            console.log(result);
            if (result?.status === "success" || result?.status === true) {
                // Proceed to apply rules
                await handleApplyRules(payload, access_key_id, client_id);
            } else {
                toast({
                    variant: "error",
                    description: result?.message || "Failed to save scheduler",
                });
            }
        } catch (error: any) {
            errorHandler(error);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="p-4 flex justify-center">Loading scheduler settings...</div>;
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-4xl mt-6 px-4">
                <div className="text-xl font-medium mb-4">Scheduler</div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Job Period Radio Group */}
                        <FormField
                            control={control}
                            name="jobperiod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <div className="flex flex-row space-x-4">
                                            <div
                                                onClick={() => field.onChange("onetime")}
                                                className={cn(
                                                    "cursor-pointer border rounded-md px-8 py-3 w-72 flex items-center hover:border-indigo-500 transition-colors",
                                                    field.value === "onetime" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                                                )}
                                            >
                                                <div className="w-4 h-4 mr-2">
                                                    <Input
                                                        type="radio"
                                                        checked={field.value === "onetime"}
                                                        onChange={() => field.onChange("onetime")}
                                                        className="h-4 w-4 p-0 shadow-none border-gray-300 rounded-full focus:ring-0"
                                                    />
                                                </div>
                                                <FormLabel className="font-light cursor-pointer">One Time</FormLabel>
                                            </div>

                                            <div
                                                onClick={() => field.onChange("periodically")}
                                                className={cn(
                                                    "cursor-pointer border rounded-md px-8 py-3 w-72 flex items-center hover:border-indigo-500 transition-colors",
                                                    field.value === "periodically" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                                                )}
                                            >
                                                <div className="w-4 h-4 mr-2">
                                                    <Input
                                                        type="radio"
                                                        checked={field.value === "periodically"}
                                                        onChange={() => field.onChange("periodically")}
                                                        className="h-4 w-4 p-0 shadow-none border-gray-300 rounded-full focus:ring-0"
                                                    />
                                                </div>
                                                <FormLabel className="font-light cursor-pointer">Periodically</FormLabel>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Period Selection (Hours vs Day) */}
                        {jobperiod === "periodically" && (
                            <div className="mt-6 space-y-4">
                                <div className="text-md font-light">Select period</div>
                                <FormField
                                    control={control}
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem className="space-y-0">
                                            <FormControl>
                                                <div className="flex flex-row space-x-2">
                                                    <div
                                                        onClick={() => field.onChange("hours")}
                                                        className={cn(
                                                            "cursor-pointer border rounded-md px-4 py-2 w-40 flex items-center hover:border-indigo-500 transition-colors",
                                                            field.value === "hours" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                                                        )}
                                                    >
                                                        <input
                                                            type="radio"
                                                            checked={field.value === "hours"}
                                                            onChange={() => field.onChange("hours")}
                                                            className="mr-2"
                                                        />
                                                        <span className="font-light">Every Hour</span>
                                                    </div>

                                                    <div
                                                        onClick={() => field.onChange("day")}
                                                        className={cn(
                                                            "cursor-pointer border rounded-md px-4 py-2 w-40 flex items-center hover:border-indigo-500 transition-colors",
                                                            field.value === "day" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                                                        )}
                                                    >
                                                        <input
                                                            type="radio"
                                                            checked={field.value === "day"}
                                                            onChange={() => field.onChange("day")}
                                                            className="mr-2"
                                                        />
                                                        <span className="font-light">Every Day</span>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Daily Settings */}
                                {period === "day" && (
                                    <div className="flex flex-row mt-4 border p-5 rounded-md gap-6">
                                        <FormField
                                            control={control}
                                            name="fromTime"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="font-light text-sm">Start Time</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="time"
                                                            {...field}
                                                            className="w-40"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="timeZone"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col flex-1">
                                                    <FormLabel className="font-light text-sm">Time Zone</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select time zone" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white h-80">
                                                            {timeZone.map((tz, i) => (
                                                                <SelectItem key={i} value={tz.text}>
                                                                    {tz.text}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end mt-8 mb-10">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Scheduling..." : "Finish"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default Schedular;
