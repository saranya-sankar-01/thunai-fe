import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { FormValues, OrgUser } from "./UserManagementConfig";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useUserManagementStore } from "../../store/userManagementStore";
import { User } from "../../types/User";
import { useContactStore } from "../../store/contactStore";
import { useEffect } from "react";

type CreateEditUserProps = {
    dialogOpen: boolean;
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingUser: string;
    setEditingUser: React.Dispatch<React.SetStateAction<string | null>>;
    form: UseFormReturn<FormValues>;
}

const CreateEditUser: React.FC<CreateEditUserProps> = ({ dialogOpen, setDialogOpen, editingUser, setEditingUser, form }) => {
    const { assigneeUsers, loadAssigneeUsers } = useContactStore();
    const { users, createUser, updateUser, loading } = useUserManagementStore();

    useEffect(() => {
        loadAssigneeUsers([]);
    }, [loadAssigneeUsers]);

    const handleCloseDialog = () => {
        setDialogOpen(false);
        form.reset();
        setEditingUser(null);
    }

    const handleSubmit = async (values: Record<string, any>) => {
        console.log(values);
        if (editingUser) {
            console.log(values);
            console.log({ ...values, reports_to: [values.reports_to] });
            const success = await updateUser({ ...values, reports_to: [values.reports_to] });
            if (success) {
                setDialogOpen(false);
                form.reset();
                setEditingUser(null);
            }
        } else {
            const success = await createUser(values);
            if (success) {
                setDialogOpen(false);
                form.reset();
                setEditingUser(null);
            }
        }
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="sm:max-w-md" aria-describedby="">
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField control={form.control} name="name" rules={{ required: "Username is required!" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>User Name *</FormLabel>
                                <Select value={field.value} onValueChange={(value) => {
                                    field.onChange(value);
                                    const selectedUser = assigneeUsers.find(user => user.username === value);
                                    if (selectedUser) {
                                        form.setValue("email", selectedUser.emailid);
                                    }
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select User" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {!assigneeUsers.length ? (<SelectGroup><SelectLabel>No Users Found!</SelectLabel></SelectGroup>) :
                                            (assigneeUsers.filter(user => user.is_active !== false).map(user => (
                                                <SelectItem key={user.id} value={user.username}>
                                                    {user.username} ({user.emailid})
                                                </SelectItem>
                                            )))
                                        }
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" rules={{ required: "Email is required!" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input disabled placeholder="Ex. Joey@sitcom.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="role" rules={{ required: "Role is required!" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex. Sales Manager" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="reports_to" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reports To</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Manager" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {!users.length ? (<SelectGroup><SelectLabel>No Users Found!</SelectLabel></SelectGroup>) :
                                                (users.map(user => (
                                                    <SelectItem key={user.id} value={user.email}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                )))
                                            }
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" disabled={loading.creatingUser || loading.updatingUser} onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button disabled={loading.creatingUser || loading.updatingUser}>{editingUser ? 'Save Changes' : 'Add User'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateEditUser;