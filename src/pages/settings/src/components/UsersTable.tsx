import React, { useState } from 'react'
import { MoreVertical } from 'lucide-react'

import UserStatusBadge from '../components/UserStatusBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import ChangeUserPasswordDialog from '../components/ChangeUserPasswordDialog'
import { useUserStore } from '../store/userStore'
import { usePermissions } from "../services/permissionService"
import { cn, getColor, getPaginationNumbers } from '../lib/utils'
import { User } from '../types/User'

type UsersTableProps = {
    onEditUser: (user: User, mode: "edit" | "view") => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ onEditUser }) => {
    const [deactivateUserDialog, setDeactivateUserDialog] = useState<boolean>(false);
    const [changePasswordDialog, setChangePasswordDialog] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { users, usersLoading, currentPage, setCurrentPage, totalPages } = useUserStore();
    const { hasPermission } = usePermissions();

    const handleOpenPasswordDialog = (user: User) => {
        setChangePasswordDialog(true);
        setSelectedUser(user)
    }

    const handleOpenDeactivateDialog = (user: User) => {
        setDeactivateUserDialog(true);
        setSelectedUser(user)
    }

    return (
        <>
            {deactivateUserDialog && <DeleteConfirmationDialog
                title="Deactivate User"
                description="Are you sure you want to deactivate this user? The user will no longer be able to access the system after deactivation."
                keyword="confirm"
                buttonText="Continue"
                loading={usersLoading}
                openDeleteDialog={deactivateUserDialog}
                handleCloseModal={() => setDeactivateUserDialog(false)}
            // handleDelete={() => handleDeleteApiKey(apiKey.id)}
            />}

            {changePasswordDialog && <ChangeUserPasswordDialog
                changePasswordDialog={changePasswordDialog}
                setChangePasswordDialog={setChangePasswordDialog}
                user={selectedUser}
            />}

            <div className="border rounded-md shadow-sm bg-white overflow-hidden w-full">
                <div className={cn("overflow-y-auto relative", totalPages > 1 ? "max-h-[60vh]" : "max-h-[65vh]")} >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead>USERNAME</TableHead>
                                <TableHead>ROLE</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead>ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (!usersLoading && users.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No Users found.
                                    </TableCell>
                                </TableRow>
                            ) :
                                (users.map(user => (
                                    <TableRow key={user.user_id} className="hover:bg-gray-50">
                                        <TableCell className="flex items-center">
                                            <div className="hidden md:block">
                                                <div className="w-8 h-8 flex items-center justify-center rounded-full text-white font-semibold mr-3" style={{ backgroundColor: getColor(user.username) }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="hidden lg:block text-gray-800 font-medium truncate">
                                                    {user.username}
                                                </div>
                                                <div className="hidden lg:block text-gray-500 text-xs truncate">
                                                    {user.emailid}
                                                </div>
                                                <div className="lg:hidden block text-gray-800 font-medium truncate">
                                                    {user.username.slice(0, 9)} {user.username.length > 9 ? '...' : ''}
                                                </div>
                                                <div className="lg:hidden block text-gray-500 text-xs truncate">
                                                    {user.emailid.slice(0, 9)} {user.emailid.length > 9 ? '...' : ''}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.role}
                                        </TableCell>
                                        <TableCell>
                                            <UserStatusBadge status={user.status} />
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-white">
                                                    {hasPermission("accounts_admin", "ALL") && <DropdownMenuItem onClick={() => onEditUser(user, "edit")}>
                                                        Edit
                                                    </DropdownMenuItem>}
                                                    <DropdownMenuItem onClick={() => onEditUser(user, "view")}>View</DropdownMenuItem>
                                                    {hasPermission("accounts_admin", "ALL") &&
                                                        <DropdownMenuItem onClick={() => handleOpenDeactivateDialog(user)}>{user.status === "Active" || user.status === "Onboarded" ? "Deactivate" : "Activate"}</DropdownMenuItem>}
                                                    {hasPermission("accounts_admin", "ALL") &&
                                                        <DropdownMenuItem onClick={() => handleOpenPasswordDialog(user)}>Change Password</DropdownMenuItem>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )))}
                        </TableBody>
                    </Table>
                </div>
                <div className="py-4 border-t">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || usersLoading} />
                            </PaginationItem>
                            {getPaginationNumbers(currentPage, totalPages).map((page, index) => (
                                <PaginationItem key={index}>
                                    {
                                        page === "..." ? <PaginationEllipsis /> : (<PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                                            {page}
                                        </PaginationLink>)
                                    }
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || usersLoading} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </>
    )
}

export default UsersTable