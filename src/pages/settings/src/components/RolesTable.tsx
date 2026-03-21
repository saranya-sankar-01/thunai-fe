import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRoleStore } from '../store/roleStore';
import { useToast } from '@/hooks/use-toast';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserStore } from "../store/userStore";
import { usePermissions } from "../services/permissionService";

interface RoleFormat {
    roleName: string;
    permissions: string[] | string;
    permissionCount: number | string;
    memberCount: number
}

const RolesTable: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [roleToDelete, setRoleToDelete] = React.useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [showWarningDialog, setShowWarningDialog] = React.useState(false);
    const { loadUsers, usersLoading } = useUserStore();
    const { roles, deleteRole, loading } = useRoleStore();
    const { hasPermission } = usePermissions();


    const getPermissionWeight = (role: RoleFormat) => {
        if (role.permissions === "*" || role.permissions.includes("ALL_PERMISSIONS")) {
            return 9999;
        }
        return typeof role.permissionCount === "number" ? role.permissionCount : 0;
    }

    const handleDeleteClick = async (roleName: string) => {
        try {
            await loadUsers({ filter: [{ key_name: "role", key_value: roleName, operator: "==" }] });
            const currentUsers = useUserStore.getState().users;
            setRoleToDelete(roleName);
            if (currentUsers.length > 0) {
                setShowWarningDialog(true);
            } else {
                setShowDeleteDialog(true);
            }
        } catch (error) {
            toast({
                variant: "error",
                description: "Failed to check if role is assigned to users."
            });
        }
    };

    const confirmDelete = async () => {
        if (!roleToDelete) return;
        await deleteRole(roleToDelete);
        setShowDeleteDialog(false);
        setRoleToDelete(null);
    };

    // console.log(users);

    const rolesData = !loading && Object.entries(roles.role_mapping).map(([roleName, permissions]) => ({
        roleName,
        permissions,
        permissionCount: permissions === "*" ? "All Permissions" : (permissions as string[]).length,
        memberCount: 0,
    }) as RoleFormat).sort((a, b) => getPermissionWeight(b) - getPermissionWeight(a))

    if (loading || usersLoading) return <div className="w-full flex justify-center items-center h-[calc(100vh-380px)]">
        <div className="w-8 h-8 mr-2 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"
        />
        {usersLoading ? "Checking users..." : "Loading..."}
    </div>

    if (!loading && (!rolesData || !rolesData.length)) return <div className="w-full text-center flex items-center p-10">
        <p className="w-full">No Roles found</p>
    </div>

    return (
        <>
            <div className="border rounded-md shadow-sm bg-white overflow-hidden w-full">
                <div className="max-h-[60vh] overflow-y-auto relative">
                    <Table>
                        <TableHeader className="bg-gray-50 hover:bg-gray-50">
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (!loading && rolesData.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No Roles found.
                                    </TableCell>
                                </TableRow>
                            ) : (rolesData.map(role => (
                                <TableRow key={role.roleName} className="hover:bg-gray-50">
                                    <TableCell>
                                        {role.roleName}
                                        {role.roleName === "Super Admin" &&
                                            <span className="text-gray-700 font-medium p-2 bg-blue-100 rounded-full text-[10px] ml-1">Default</span>}
                                    </TableCell>
                                    <TableCell>
                                        {role.permissionCount}
                                        {role.permissionCount !== "All Permissions" && <span className='ml-1'>Permissions</span>}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white">
                                                {hasPermission("accounts_admin", "ALL") &&
                                                    <DropdownMenuItem onClick={() => navigate(`/settings/role-management/edit-role/${role.roleName}`)}>Edit</DropdownMenuItem>}
                                                {hasPermission("accounts_admin", "READ") &&
                                                    <DropdownMenuItem onClick={() => navigate(`/settings/role-management/view-role/${role.roleName}`)}>View</DropdownMenuItem>}
                                                {role.roleName !== 'Super Admin' && role.memberCount === 0 && hasPermission("accounts_admin", "ALL") && (
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDeleteClick(role.roleName)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                </div>
            </div>


            <DeleteConfirmationDialog
                title="Delete Role Confirmation"
                description={`This role "${roleToDelete}" is not assigned to any users. Are you sure you want to delete it?`}
                keyword="Delete"
                buttonText="Delete"
                loading={loading}
                openDeleteDialog={showDeleteDialog}
                handleCloseModal={() => setShowDeleteDialog(false)}
                handleDelete={confirmDelete}
            />

            <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role Restricted</DialogTitle>
                        <DialogDescription>
                            This role is assigned to one or more users. Please reassign the users to clinical or other roles before deleting this role.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowWarningDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default RolesTable;