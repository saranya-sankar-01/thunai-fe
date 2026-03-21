import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelect from '@/components/ui/Multiselect';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '../store/projectsStore';
import { useUserStore } from '../store/userStore';
import { FormValues } from '../components/UsersTab';
import { getDialogPuropse } from '../lib/utils';
import { useRoleStore } from '../store/roleStore';

type CreateEditUserDialogProps = {
    createUserDialog: boolean;
    setCreateUserDialog: React.Dispatch<React.SetStateAction<boolean>>;
    form: UseFormReturn<FormValues>;
    editUserId: string;
    setEditUserId: React.Dispatch<React.SetStateAction<string>>;
    openMode: string
}



const CreateEditUserDialog: React.FC<CreateEditUserDialogProps> = ({ createUserDialog, setCreateUserDialog, form, editUserId, setEditUserId, openMode }) => {
    const { createEditUsers } = useUserStore();
    const { roles, loading: rolesLoading, loadRoles } = useRoleStore();
    const { tenants, loadTenants, loading } = useProjectStore();

    const watchRole = form.watch("role");

    useEffect(() => {
        if (watchRole === "Super Admin" || editUserId) {
            console.log("render")
            form.setValue("default_tenant_id", []);
            form.clearErrors("default_tenant_id");
        }
    }, [watchRole, form, editUserId])

    useEffect(() => {
        loadRoles("");
        loadTenants([]);
    }, [loadRoles, loadTenants]);

    const rolesData = !rolesLoading && roles && roles.role_mapping ? Object.keys(roles.role_mapping) : [];

    const tenantsOptions = tenants.map(tenant => ({
        value: tenant.tenant_id,
        label: tenant.name || "(No Name)"
    }))

    const handleCloseDialog = () => {
        form.reset();
        setCreateUserDialog(false);
        setEditUserId(null);
    }

    const handleSubmit = async (values: FormValues) => {
        console.log(values)
        await createEditUsers(values, editUserId);

        setCreateUserDialog(false);
        form.reset();
    }

    return (
        <Dialog open={createUserDialog} onOpenChange={handleCloseDialog}>
            <DialogContent className="max-w-2xl" aria-describedby="">
                <DialogHeader>
                    <DialogTitle>{getDialogPuropse(openMode)} User</DialogTitle>
                </DialogHeader>
                <hr />

                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField control={form.control} name="username" rules={{ required: "Username is required!" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>User Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Joey Tribbiani" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="emailid" rules={{ required: "Email is required!" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input disabled={editUserId ? true : false} placeholder="Ex. Joey@sitcom.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="role" rules={{ required: "Role is required!" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role *</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {rolesData.map(role => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {(openMode === "create" && watchRole !== "Super Admin") &&
                            <FormField control={form.control} name="default_tenant_id" rules={{ required: "Tenant selection is required" }} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Project</FormLabel>
                                    <FormControl>
                                        <MultiSelect options={tenantsOptions} selectedValues={Array.isArray(field.value) ? field.value : []} onSelectionChange={(values) => field.onChange(values)} placeholder="Tenant" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        }
                        <div className='flex space-x-3 justify-end'>
                            {openMode !== "view" &&
                                <Button type='submit' disabled={loading} >{editUserId ? "Update" : "Create"}</Button>}
                            <Button variant='secondary' type='button' onClick={() => handleCloseDialog()}>Cancel</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateEditUserDialog