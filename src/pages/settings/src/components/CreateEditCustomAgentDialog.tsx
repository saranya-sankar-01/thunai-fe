import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormValues } from '../pages/CustomAgent';
import { Button } from '@/components/ui/button';
import { useCustomAgentStore } from '../store/customAgentStore';

type CreateEditCustomAgentDialogProps = {
    form: UseFormReturn<FormValues>;
    editId: string;
    setEditId: React.Dispatch<React.SetStateAction<string>>;
    openDialog: boolean;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateEditCustomAgentDialog: React.FC<CreateEditCustomAgentDialogProps> = ({ form, editId, setEditId, openDialog, setOpenDialog, }) => {
    const { loadCommonWidgets, commonWidgets, updateCustomDomain, createCustomDomain, domainLoading } = useCustomAgentStore();

    useEffect(() => {
        loadCommonWidgets();
    }, [loadCommonWidgets])

    const handleSubmit = async (values: FormValues) => {
        let success: boolean;
        if (editId) {
            success = await updateCustomDomain(values);
        } else {
            success = await createCustomDomain(values);
        }

        if (success) {
            form.reset();
            setOpenDialog(false);
            setEditId(null);
        }
    }

    const handleCloseDialog = () => {
        form.reset();
        setOpenDialog(false);
        setEditId(null)
    }
    return (
        <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
            <DialogContent className="max-w-2xl" aria-describedby="">
                <DialogHeader>
                    <DialogTitle>{editId ? "Edit" : "Create"} Custom Agent Link</DialogTitle>
                </DialogHeader>
                <hr />
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField control={form.control} name="uniquerUserName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Custom Page URL *</FormLabel>
                                <FormControl>
                                    <div className="flex items-center rounded-md border px-3">
                                        <span className="text-sm text-muted-foreground">
                                            connect.thunai.ai/
                                        </span>

                                        <Input className="border-none flex-1 bg-transparent p-2 outline-none" value={field.value} onChange={e => field.onChange(e.target.value)} {...field} />
                                    </div>

                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter description" value={field.value} onChange={(e) => field.onChange(e.target.value)} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="common_widget_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Common Agents</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a common agent" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {commonWidgets.map(widget => (
                                                <SelectItem key={widget.id} value={widget.widget_id}>
                                                    {widget.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="py-4">
                            <h3 className="text-sm text-gray-700 mb-3 font-medium">Customize Theme</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField control={form.control} name="primary_color" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <FormLabel className="text-sm text-gray-600">Primary Color:</FormLabel>
                                        <FormControl >
                                            <div className="flex items-center space-x-2">
                                                <input type="color" value={field.value} onChange={(e) => field.onChange(e.target.value)} {...field} className="w-10 h-10 border rounded cursor-pointer p-1" />
                                                {field.value && <span className="text-sm">{field?.value}</span>}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="secondary_color" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <FormLabel className="text-sm text-gray-600">Secondary Color: </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <input type="color" value={field.value} onChange={(e) => field.onChange(e.target.value)} {...field} className="w-10 h-10 border rounded cursor-pointer p-1" />
                                                {field.value && <span className="text-sm">{field?.value}</span>}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        <div className='flex space-x-3 justify-end'>
                            <Button type='submit' disabled={domainLoading}>{editId ? "Update" : "Create"}</Button>
                            <Button variant='secondary' type='button' disabled={domainLoading} onClick={() => handleCloseDialog()}>Cancel</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateEditCustomAgentDialog