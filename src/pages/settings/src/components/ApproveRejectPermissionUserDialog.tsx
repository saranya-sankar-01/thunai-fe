import React, { useEffect } from 'react'
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSchemaStore } from "../store/schemaStore";
import { normalizeFieldName } from "../lib/utils";
import { buildDynamicSchema } from "../lib/schemaUtils";
import { PermissionUser } from "../types/PermissionUser";
import { usePermissionUserStore } from "../store/permissionUserStore";

type ApproveRejectPermissionUserDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editData: PermissionUser;
    setEditData: React.Dispatch<React.SetStateAction<PermissionUser | null>>;
    operation: string;
}

const ApproveRejectPermissionUserDialog: React.FC<ApproveRejectPermissionUserDialogProps> = ({ open, setOpen, editData, setEditData, operation }) => {
    const { schema, loadSchema, loading } = useSchemaStore();
    const { approveRejectUser, loading: loadingPermissions } = usePermissionUserStore();

    const zodSchema = buildDynamicSchema(schema);
    type FormValues = z.infer<typeof zodSchema>;

    const form = useForm({
        resolver: zodResolver(zodSchema),
        defaultValues: {}
    });

    useEffect(() => {
        loadSchema();
    }, [loadSchema]);

    useEffect(() => {

        if (!open || !schema.attribute_mapping) return;

        if (editData) {
            const newValues: Record<string, string> = {};

            schema.attribute_mapping.forEach(attribute => {
                const normalizedKey = normalizeFieldName(attribute.attribute_name);
                const originalKey = attribute.attribute_name;

                let value = editData[originalKey];

                if (attribute.attribute_type === "date" && value) {
                    value = value.substring(0, 10);
                }
                if (attribute.attribute_name === "mobileNumber" && value) {
                    value = value.toString();
                }

                newValues[normalizedKey] = value ?? "";
            })

            form.reset(newValues)
        } else {
            form.reset({})
        }

    }, [schema, editData, form, open]);

    const handleCloseDialog = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset({});
            setEditData?.(null);
        }
        setOpen(isOpen);
    }

    const handleSubmit = async (values: FormValues) => {
        const success = await approveRejectUser(values, operation);
        if (success) {
            form.reset();
            setOpen(false);
            setEditData(null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleCloseDialog}>
            <DialogContent aria-describedby="">
                <DialogHeader>
                    <DialogTitle className="capitalize">{operation} User</DialogTitle>
                </DialogHeader>
                <hr />
                {loading ? <div className="flex justify-center items-center h-[50vh]">
                    <div className="flex flex-col items-center mr-2">
                        <div className="w-10 h-10 border-4 border-t-indigo-500 border-r-indigo-500 border-b-indigo-200 border-l-indigo-200 rounded-full animate-spin"></div>
                    </div>
                    Loading...
                </div> :
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            {schema.attribute_mapping.map(attribute => {
                                const field = normalizeFieldName(attribute.attribute_name);
                                const required = schema.mandatory_attributes.includes(attribute.attribute_name);
                                return (
                                    <FormField key={field} control={form.control} name={field} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="capitalize">{attribute.attribute_name} {required ? "*" : ""}</FormLabel>
                                            <FormControl>
                                                {attribute.attribute_type === "date" ? (
                                                    <Input type="date" {...field} />
                                                ) : attribute.attribute_type === "number" ? (
                                                    <Input type="number" {...field} />
                                                ) : <Input type="text" {...field} />}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )
                            }
                            )}
                            <div className='flex space-x-3 justify-end mt-3'>
                                <Button variant='secondary' type='button' disabled={loadingPermissions} onClick={() => handleCloseDialog(false)}>Cancel</Button>
                                <Button type='submit' disabled={loadingPermissions}>{loadingPermissions ? "Saving..." : "Save"}</Button>
                            </div>
                        </form>
                    </Form>}
            </DialogContent>
        </Dialog>
    )
}

export default ApproveRejectPermissionUserDialog