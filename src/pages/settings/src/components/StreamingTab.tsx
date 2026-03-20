import React, { useEffect, useState } from 'react';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ConfirmationDeleteDialog from '../components/DeleteConfirmationDialog';
import { useConfigurationStore } from '../store/configurationStore';

import Topic from "../assets/images/topic.svg";

const schema = z.object({
    topic_name: z.string().min(2, "Key name is required!"),
});

type FormValues = z.infer<typeof schema>;

const StreamingTab: React.FC = () => {
    const { kafkaStreams, loadKafkaStream, loading, deleteKafkaStream, createKafkaStream } = useConfigurationStore();
    const [viewGenerate, setViewGenerate] = useState<boolean>(false);
    const [triggerDelete, setTriggerDelete] = useState<boolean>(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { topic_name: "" }
    })

    const handleSubmit = async (values: FormValues) => {
        await createKafkaStream(values);
        setViewGenerate(false);
    }

    useEffect(() => {
        loadKafkaStream();
    }, [loadKafkaStream])

    if (loading) return <div className="w-full h-60 mt-6 bg-gray-200 rounded-xl animate-pulse" />

    return (
        <div className="overflow-y-auto h-[calc(100vh-230px)] overflow-x-hidden mt-6">
            {!kafkaStreams.enable && (
                <div className="space-y-5 mt-6">
                    <div className="border rounded-lg p-3 flex flex-col items-center space-y-3">
                        <div className="rounded-full bg-gray-200 p-2">
                            <img src={Topic} alt="topic-icon" />
                        </div>
                        <Button onClick={() => setViewGenerate(true)}>Genetate</Button>
                    </div>
                </div>
            )}
            {viewGenerate &&
                <div className="border rounded-lg p-5 mt-6 space-y-4 w-full max-w-lg">
                    <Form {...form}>
                        <h3 className="text-lg font-medium text-textPrimary">Create Streaming Topic</h3>
                        <div className='space-y-2'>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <FormField control={form.control} name="topic_name" rules={{ required: "Topic name is required." }} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Topic Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter topic name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}>
                                </FormField>
                                <div className="flex justify-end space-x-3 pt-3">
                                    <Button variant="outline" onClick={() => setViewGenerate(false)}>Cancel</Button>
                                    <Button type="submit" disabled={!form.getValues("topic_name")}>Generate Topic</Button>
                                </div>
                            </form>
                        </div>
                    </Form>
                </div>
            }

            {kafkaStreams.enable && (
                <div className="w-full mt-4 p-6 bg-white border border-gray-300 rounded-lg shadow-md relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-500 font-medium">Topic Name</span>
                            </div>
                            <h3 className="text-xl font-medium text-textPrimary break-all">
                                {kafkaStreams?.topic_name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                This topic is currently active and receiving data
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" onClick={() => setTriggerDelete(true)}>
                                        <span className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-200">
                                            <Trash />
                                            <span className="ml-1 text-sm hidden sm:inline">Delete</span>
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Delete this topic
                                </TooltipContent>
                            </Tooltip>
                            <ConfirmationDeleteDialog
                                title="Are you sure you want to delete the Brain Streaming Topic?"
                                description="This action will permanently remove all associated schemas across the entire organization and all tenants."
                                keyword="confirm"
                                buttonText="Continue"
                                loading={loading}
                                openDeleteDialog={triggerDelete}
                                handleCloseModal={() => setTriggerDelete(false)}
                                handleDelete={() => deleteKafkaStream()}
                            />
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-blue-800 flex items-center">
                            <Info className='mr-1' />
                            Important Notes:
                        </h4>
                        <ul className="mt-1 text-xs text-blue-700 space-y-1">
                            <li>• Deleting a topic will permanently remove all its data</li>
                            <li>• Ensure no applications are using this topic before deletion</li>
                        </ul>
                    </div>
                </div>
            )}
        </div >
    )
}

export default StreamingTab