import React, { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { FormValues } from "../components/ApiConfigurationTab"
// import { useToast } from '@/hooks/use-toast'
import { useConfigurationStore } from '../store/configurationStore';

interface ConfigurationCreateEditDialogProps {
    editId: string;
    openDialog: boolean;
    setEditId: React.Dispatch<React.SetStateAction<string>>
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
    form: UseFormReturn<FormValues>;
}


const ConfigurationCreateEditDialog: React.FC<ConfigurationCreateEditDialogProps> = ({ editId, openDialog, setEditId, setOpenDialog, form }) => {
    // const { toast } = useToast();
    const { loading, createApiKey, updateApiKey } = useConfigurationStore();

    const watchIndefiniteValidity = form.watch("indefiniteValidity");

    useEffect(() => {
        if (watchIndefiniteValidity) {
            form.setValue("validity", null);
            form.clearErrors("validity");
        }
    }, [watchIndefiniteValidity, form]);

    const handleSubmit = async (values: FormValues) => {
        delete values.indefiniteValidity;
        let success: boolean = false
        if (editId) {
            success = await updateApiKey({ ...values, id: editId });
        }
        else {
            success = await createApiKey(values);
        }
        if (success) {
            form.reset();
            setOpenDialog(false);
            setEditId(null);
        }
        // toast({ title: "Success", description: `API Key ${editId ? "Updated" : "Created"} Successfully` })
    };

    const handleCloseModal = () => {
        form.reset();
        setOpenDialog(false);
        setEditId(null);
    }
    return (
        <Dialog open={openDialog} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-2xl" aria-describedby="">
                <DialogHeader>
                    <DialogTitle>
                        {`${editId ? "Edit" : "Create"} API Key`}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField control={form.control} name="key_name" rules={{ required: "Key Name is required!" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Create Key Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., ThunAI API" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {!watchIndefiniteValidity &&
                            <FormField control={form.control} name="validity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Validity (In Days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 90" {...field} value={field.value ?? ""} disabled={form.getValues("indefiniteValidity")} onChange={(e) => field.onChange(e.target.value ? +e.target.value : null)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        }
                        <FormField
                            control={form.control}
                            name="indefiniteValidity"
                            render={({ field }) => (
                                <FormItem className="flex items-end space-x-1">
                                    <FormControl>
                                        <input type="checkbox"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    </FormControl>
                                    <FormLabel>Mark as Indefinite Validity</FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex space-x-3 justify-end'>
                            <Button type='submit' disabled={loading}>{editId ? "Update" : "Create"}</Button>
                            <Button variant='secondary' type='button' disabled={loading} onClick={() => handleCloseModal()}>Cancel</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default ConfigurationCreateEditDialog