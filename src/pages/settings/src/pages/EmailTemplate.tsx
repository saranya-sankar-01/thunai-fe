import React, { useEffect, useRef } from 'react'
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom"
import EmailEditor, { EditorRef } from "react-email-editor"
import { Button } from "@/components/ui/button";
import { useEmailTemplateStore } from "../store/emailTemplateStore";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EmailTemplateDetail } from "../types/EmailTemplateDetail";

const schema = z.object({
    subject: z.string().nonempty("Subject is required!"),
    template_key: z.string().nonempty("Template Key is required!")
})

type FormValues = z.infer<typeof schema>;

const EmailTemplate: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailEditorRef = useRef<EditorRef>(null)
    const { loadEmailTemplate, loading, emailTemplate, updateEmailTemplate } = useEmailTemplateStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            subject: "",
            template_key: ""
        }
    })

    useEffect(() => {
        if (searchParams.get("id")) loadEmailTemplate(searchParams.get("id"))
    }, [loadEmailTemplate, searchParams]);

    useEffect(() => {
        if (emailTemplate) {
            form.setValue("subject", emailTemplate.subject);
            form.setValue("template_key", emailTemplate.template_key)
        }
    }, [emailTemplate, form])

    const onLoad = () => {
        if (emailTemplate && emailEditorRef.current) {
            emailEditorRef.current.editor.loadDesign(emailTemplate.design_object);
        }
    }

    const handleSubmit = (values: FormValues) => {
        emailEditorRef.current.editor.exportHtml(async(data: any) => {
            const exportedHtml = data.html;
            const exportedDesign = data.design;
            const payload: EmailTemplateDetail = {
                id: emailTemplate.id,
                template_key: values.template_key,
                subject: values.subject,
                html: exportedHtml,
                design_object: {
                    counters: exportedDesign.counters,
                    body: exportedDesign.body
                }
            }

            await updateEmailTemplate(payload)

        });
    }

    if (loading) return <div className="flex flex-col items-center justify-center h-[700px]">
        <div
            className="w-8 h-8 mr-2 mb-2 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent">
        </div>
        <p className="text-gray-600 text-sm">Loading template...</p>
    </div>

    return (
        <div className="h-[calc(100vh-100px)] overflow-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex justify-between items-center">
                        <h1 className="text-lg lg:text-2xl font-semibold text-gray-900 mb-1">Update Email Template</h1>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => navigate(-1)}>
                                <ArrowLeft />
                                Back
                            </Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <FormField control={form.control} name="template_key" render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Template Key</FormLabel>
                                <FormControl>
                                    <Input disabled placeholder="Key" {...field} />
                                </FormControl>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="subject" render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Email Subject</FormLabel>
                                <FormControl>
                                    <Input placeholder="Subject" {...field} />
                                </FormControl>
                            </FormItem>
                        )} />
                    </div>
                    <div className="mt-4 border-t-2 border-l-2 border-r-2 rounded-t-2xl bg-gradient-to-r from-violet-200 to-orange-100 shadow-t-xl">
                        <div className="flex p-5">
                            <p className="text-sm font-bold ml-2 text-[#161616]">
                                Please provide the dynamic variables as per the following formatss
                            </p>
                        </div>
                        <div className="flex flex-col ml-6">
                            <div className="flex flex-wrap ml-3">
                                {emailTemplate.variables?.map(variable => (
                                    <div className="flex items-center mr-4 mb-3" key={variable}>
                                        <div className="flex items-center">
                                            <div className="my-auto mr-2 capitalize">{variable}</div>
                                            <div className="border-2 rounded-3xl w-fit px-3 py-2 font-semibold bg-white">
                                                {"{" + "{"} {variable} {"}" + "}"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                    <EmailEditor ref={emailEditorRef} onLoad={onLoad} />
                </form>
            </Form>
        </div>
    )
}

export default EmailTemplate