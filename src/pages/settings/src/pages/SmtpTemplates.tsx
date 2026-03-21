import React from 'react'
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import PageTitle from "../components/PageTitle"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSmtpStore } from "../store/smtpStore"

const schema = z.object({
    is_enabled: z.boolean().default(false),
    provider: z.enum(["thunai", "custom_smtp", "custom_api"]),
    from: z.string().email("Invalid email id"),
    cc: z.string().optional(),
    bcc: z.string().optional(),
    smtp_host: z.string().optional(),
    smtp_api_host: z.string().optional(),
    smtp_port: z.string().optional(),
    smtp_username: z.string().optional(),
    smtp_password: z.string().optional(),
    smtp_use_tls: z.boolean().default(false),
    smtp_use_ssl: z.boolean().default(false),
    smtp_auth_required: z.boolean().default(false),
    api_host: z.string().optional(),
    api_port: z.string().optional(),
    api_username: z.string().optional(),
    api_password: z.string().optional(),
    api_use_tls: z.boolean().default(false),
    api_use_ssl: z.boolean().default(false),
    api_auth_required: z.boolean().default(false)
});

type FormValues = z.infer<typeof schema>;

const SmtpTemplates: React.FC = () => {
    const { loading, saveSMTPSettings } = useSmtpStore();
    const parsedSchema = schema.transform((data) => ({
        ...data,
        cc: data.cc
            ? data.cc.split(",").map(v => v.trim()).filter(Boolean)
            : [],
        bcc: data.bcc
            ? data.bcc.split(",").map(v => v.trim()).filter(Boolean)
            : [],
    }));

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            is_enabled: false,
            provider: "thunai",
            from: "",
            cc: "",
            bcc: "",
        }
    });

    const watchProvider = form.watch("provider");


    const handleSubmit = async (values: FormValues) => {
        const parsed = parsedSchema.parse(values);

        // Base payload (shared fields)
        const basePayload = {
            provider: parsed.provider,
            is_enabled: parsed.is_enabled,
            from: parsed.from,
            cc: parsed.cc,
            bcc: parsed.bcc,
        };

        // Thunai → nothing to save
        if (parsed.provider === "thunai") {
            await saveSMTPSettings(basePayload);
        }

        // Custom SMTP
        if (parsed.provider === "custom_smtp") {
            await saveSMTPSettings({
                ...basePayload,
                smtp_host: parsed.smtp_host,
                smtp_api_host: parsed.smtp_api_host,
                smtp_port: parsed.smtp_port,
                smtp_username: parsed.smtp_username,
                smtp_password: parsed.smtp_password,
                smtp_use_tls: parsed.smtp_use_tls,
                smtp_use_ssl: parsed.smtp_use_ssl,
                smtp_auth_required: parsed.smtp_auth_required,
            });
        }

        // Custom API
        if (parsed.provider === "custom_api") {
            await saveSMTPSettings({
                ...basePayload,
                api_host: parsed.api_host,
                api_port: parsed.api_port,
                api_username: parsed.api_username,
                api_password: parsed.api_password,
                api_use_tls: parsed.api_use_tls,
                api_use_ssl: parsed.api_use_ssl,
                api_auth_required: parsed.api_auth_required,
            });
        }
    };

    console.log(watchProvider)
    return (
        <>
            <div className="text-sm text-gray-400 mb-6">
                Configuration <span className="mx-2">›</span> SMTP Settings
            </div>
            <PageTitle title="SMTP Settings" />
            <hr />
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField control={form.control} name="is_enabled" render={({ field }) => (
                        <FormItem className="flex justify-between items-center">
                            <FormLabel className="text-xl">Enable SMTP</FormLabel>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="provider" render={({ field }) => (
                        <FormItem className="flex justify-between items-center">
                            <FormLabel className="text-xl flex-1">SMTP Provider</FormLabel>
                            <FormControl>
                                <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value} >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Choose Provider" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="thunai">Thunai</SelectItem>
                                        <SelectItem value="custom_smtp">Custom SMTP</SelectItem>
                                        <SelectItem value="custom_api">Custom API</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="from" render={({ field }) => (
                        <FormItem>
                            <FormLabel>From Email *</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter sender email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="cc" render={({ field }) => (
                        <FormItem>
                            <FormLabel>CC</FormLabel>
                            <FormControl>
                                <Input placeholder="Comma separated emails (ex: a@x.com, b@y.com)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="bcc" render={({ field }) => (
                        <FormItem>
                            <FormLabel>BCC</FormLabel>
                            <FormControl>
                                <Input placeholder="Comma separated emails" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {watchProvider === "custom_smtp" &&
                        <div className="mt-10 p-5 border rounded-lg bg-gray-50 overflow-y-auto max-h-[400px]">
                            <h2 className="text-xl font-semibold mb-4">Custom SMTP Configuration</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <FormField control={form.control} name="smtp_host" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SMTP Host</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="smtp_api_host" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Host</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="smtp_port" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SMTP Port</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="smtp_username" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="smtp_password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="flex gap-6 mt-4">
                                <FormField control={form.control} name="smtp_use_tls" render={({ field }) => (
                                    <FormItem className="flex justify-between items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="space-y-0">TLS</FormLabel>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="smtp_use_ssl" render={({ field }) => (
                                    <FormItem className="flex justify-between items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="space-y-0">SSL</FormLabel>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="smtp_auth_required" render={({ field }) => (
                                    <FormItem className="flex justify-between items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="space-y-0">Authentication</FormLabel>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    }
                    {watchProvider === "custom_api" &&
                        <div className="mt-10 p-5 border rounded-lg bg-gray-50 overflow-y-auto max-h-[400px]">
                            <h2 className="text-xl font-semibold mb-4">Custom SMTP Configuration</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <FormField control={form.control} name="api_host" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Host</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="api_port" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Port</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="api_username" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="api_password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="flex gap-6 mt-4">
                                <FormField control={form.control} name="api_use_tls" render={({ field }) => (
                                    <FormItem className="flex justify-between items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="space-y-0">TLS</FormLabel>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="api_use_ssl" render={({ field }) => (
                                    <FormItem className="flex justify-between items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="space-y-0">SSL</FormLabel>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="api_auth_required" render={({ field }) => (
                                    <FormItem className="flex justify-between items-center gap-2">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="space-y-0">Authentication</FormLabel>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    }
                    <Button type="submit">{loading ? "Creating..." : "Create Identity"}</Button>
                </form>
            </Form>
        </>
    )
}

export default SmtpTemplates