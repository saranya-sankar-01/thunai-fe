import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import PermissionCard from '../components/PermissionCard';
import { useRoleStore } from '../store/roleStore'
import { useToast } from '@/hooks/use-toast';

type PermissionsTabProps = {
    roleName?: string;
    method?: 'create' | 'edit' | 'view';
}

const schema = z.object({
    roleName: z.string().min(1, "Role name is required").max(30, "Role name too long"),
    selectedPermissions: z.record(z.string(), z.string())
})

type FormValues = z.infer<typeof schema>;

const PermissionsTab: React.FC<PermissionsTabProps> = ({ roleName, method = 'view' }) => {
    const { loadRolePermissions, rolePermissions, permissionLoading, saveRole, creatingRole } = useRoleStore();
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            roleName: roleName || "",
            selectedPermissions: {}
        }
    });

    const { control, handleSubmit, setValue, watch, reset } = form;
    const selectedPermissions = watch("selectedPermissions");

    useEffect(() => {
        loadRolePermissions();
    }, [loadRolePermissions]);

    useEffect(() => {
        if (!permissionLoading && rolePermissions.permissions) {
            const initialPermissions: Record<string, string> = {};

            // Set default permissions as "ALL" for new role, matching Angular's initial state
            Object.keys(rolePermissions.permissions).forEach(key => {
                initialPermissions[key] = method === 'create' ? "ALL" : "No Access";
            });

            if (roleName && rolePermissions.role_mapping[roleName]) {
                const roleMapping = rolePermissions.role_mapping[roleName];

                if (roleName === "Super Admin" && roleMapping === "*") {
                    // All permissions "ALL"
                } else if (Array.isArray(roleMapping)) {
                    roleMapping.forEach((perm: string) => {
                        const [key, level] = perm.split(':');
                        if (key) initialPermissions[key] = level || "No Access";
                    });
                }
            }
            reset({
                roleName: roleName || "",
                selectedPermissions: initialPermissions
            });
        }
    }, [permissionLoading, rolePermissions, roleName, reset]);

    const onSubmit = async (values: FormValues) => {
        const hasAtLeastOneValidPermission = Object.values(values.selectedPermissions).some(
            (val) => val === 'READ' || val === 'ALL'
        );

        if (!hasAtLeastOneValidPermission) {
            toast({
                variant: "error",
                description: "At least one permission must be set to Read or All"
            });
            return;
        }
        const filteredPermissions = Object.entries(values.selectedPermissions)
            .filter(([_, value]) => value !== "No Access") // Exclude empty values
            .map(([key, value]) => `${key}:${value}`);

        const payload = {
            role: values.roleName,
            role_access: filteredPermissions,
        };

        await saveRole(payload, method);
        navigate('/settings/user-management');
    };

    const formatPermissionName = (permissionKey: string): string => {
        return permissionKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    const permissionsList = !permissionLoading && rolePermissions.permissions ? Object.entries(rolePermissions.permissions).map(([key, value]) => ({
        key,
        name: formatPermissionName(key),
        description: value.description,
        displayName: value.display_name,
    })) : [];

    if (permissionLoading) return <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full animate-spin border-4 border-solid border-blue-500 border-t-transparent mb-2"></div>
            <span className="text-gray-600">Loading permissions...</span>
        </div>
    </div>
    console.log(creatingRole);
    return (
        <div className="my-8">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {method !== 'view' && !roleName && (
                        <FormField
                            control={control}
                            name="roleName"
                            render={({ field }) => (
                                <FormItem className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                    <FormLabel className="sm:w-32">Role Name *</FormLabel>
                                    <div className="flex-1 max-w-md">
                                        <FormControl>
                                            <Input placeholder="Enter Role name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Permissions <span className="text-orange-500">*</span></h3>
                        <p className="text-sm text-gray-500 mt-1">Select access levels for each permission</p>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(100vh-450px)] pr-2 space-y-3">
                        {permissionsList.map(permission => (
                            <PermissionCard
                                key={permission.key}
                                permission={permission}
                                value={selectedPermissions[permission.key]}
                                onChange={(val) => setValue(`selectedPermissions.${permission.key}`, val)}
                                readOnly={method === 'view'}
                            />
                        ))}
                    </div>

                    {method !== 'view' && (
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={creatingRole}>
                                {creatingRole ? "Saving..." : (method === 'edit' ? "Update Role" : "Create Role")}
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </div>
    )
}

export default PermissionsTab;