import React from 'react'
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormValues } from "../components/SchemaTab";

import TrashIcon from "../assets/images/dustbin.svg";
import { useSchemaStore } from "../store/schemaStore";

type CreateEditAttributeDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    form: UseFormReturn<FormValues>;
    checkDuplicate: (value: string) => void;
    duplicate: boolean;
    editId: string;
    setEditId: React.Dispatch<React.SetStateAction<string | null>>;
}

const CreateEditAttributeDialog: React.FC<CreateEditAttributeDialogProps> = ({ open, setOpen, form, checkDuplicate, duplicate, editId, setEditId }) => {
    const { createAttributes, updateAttribute, loading } = useSchemaStore();

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "attributes"
    })

    const addNewAttributes = () => {
        append({ attribute_name: "", attribute_type: "" })
    }

    const handleClose = () => {
        setOpen(false);
        form.reset();
    }

    const handleSubmit = async (values: FormValues) => {
        let success: boolean;
        if (editId) {
            success = await updateAttribute({ ...values.attributes[0], id: editId });
        } else {
            success = await createAttributes(values.attributes);
        }

        if (success) {
            setOpen(false);
            setEditId(null);
            form.reset();
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl" aria-describedby="">
                <DialogHeader>
                    <DialogTitle>Create New Attributes</DialogTitle>
                </DialogHeader>
                <hr />
                <Form {...form}>
                    <form className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto" onSubmit={form.handleSubmit(handleSubmit)}>
                        {fields.map((field, i) => (
                            <React.Fragment key={field.id}>
                                <div className="bg-blue-50 p-4 mb-5 rounded-lg flex items-center shadow-sm">
                                    <div className="flex w-full gap-4 items-center">
                                        <div className="w-full md:w-1/2">
                                            <FormField control={form.control} name={`attributes.${i}.attribute_name`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Attribute Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} maxLength={30} placeholder="Enter Attribute name" value={field.value} onChange={(e) => { field.onChange(e.target.value); checkDuplicate(e.target.value) }} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <FormField control={form.control} name={`attributes.${i}.attribute_type`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Attribute Type</FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Attribute Type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                <SelectItem value="text">Text</SelectItem>
                                                                <SelectItem value="file">File</SelectItem>
                                                                <SelectItem value="date">Date</SelectItem>
                                                                <SelectItem value="number">Number</SelectItem>
                                                                <SelectItem value="array">Array</SelectItem>
                                                                <SelectItem value="button">Button</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        {fields.length > 1 && (
                                            <Button variant="ghost" className="flex justify-end" onClick={() => remove(i)}>
                                                <img src={TrashIcon} alt="Remove" className="w-6 h-6 cursor-pointer" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {duplicate && <div className="text-xs text-center leading-6 text-white flex justify-center p-2 bg-red-500 rounded-md mt-3"> This attribute name already exists!</div>}
                            </React.Fragment>
                        ))}

                        <Button type="button" className="w-full" onClick={addNewAttributes}>+ Add More Attributes</Button>
                        <div className='flex space-x-3 justify-end'>
                            <Button type='submit' disabled={duplicate || loading}>{loading ? "Saving..." : "Save"}</Button>
                            <Button variant='secondary' type='button' onClick={handleClose}>Cancel</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateEditAttributeDialog