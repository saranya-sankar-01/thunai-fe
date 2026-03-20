import React, { useState } from 'react'
import { MoreVertical } from "lucide-react"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import ApproveRejectPermissionUserDialog from "../components/ApproveRejectPermissionUserDialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePermissionUserStore } from "../store/permissionUserStore"
import { cn, getPaginationNumbers } from "../lib/utils"
import { PermissionUser } from "../types/PermissionUser"

type DirectoryUsersStatusTableProps = {
    activeTab: string;
}

const DirectoryUsersStatusTable: React.FC<DirectoryUsersStatusTableProps> = ({ activeTab }) => {
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    const [dataToEdit, setDataToEdit] = useState<PermissionUser | null>(null);
    const [operation, setOperation] = useState<"approve" | "reject">("approve");

    const { loading, permissionUsers, totalPages, currentPage, setCurrentPage, openRequest } = usePermissionUserStore();

    const handleEditPermissionUser = async (value: PermissionUser, operator: "approve" | "reject") => {
        await openRequest(value)
        setOpenDialog(true);
        setDataToEdit(value);
        setOperation(operator);
    }

    return (
        <>
            <ApproveRejectPermissionUserDialog open={openDialog} setOpen={setOpenDialog} editData={dataToEdit} setEditData={setDataToEdit} operation={operation} />
            <div className="border rounded-md shadow-sm bg-white overflow-hidden w-full">
                <div className={cn("overflow-y-auto relative", totalPages > 1 ? "max-h-[60vh]" : "max-h-[65vh]")}>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (<TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Loading...
                                    </div>
                                </TableCell>
                            </TableRow>) : (!loading && permissionUsers.length === 0) ? (<TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No Records found.
                                </TableCell>
                            </TableRow>) :
                                (permissionUsers.map(user => (
                                    <TableRow key={user.id} className="hover:bg-gray-50">
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="capitalize">{user.status}</TableCell>
                                        {activeTab === "pending" &&
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="bg-white">
                                                        <DropdownMenuItem onClick={() => handleEditPermissionUser(user, "approve")}>
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditPermissionUser(user, "reject")}>Reject</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        }
                                    </TableRow>
                                )))}
                        </TableBody>
                    </Table>
                </div>
                {totalPages > 1 &&
                    <div className="py-4 border-t">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || loading} />
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
                                    <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || loading} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                }
            </div>
        </>
    )
}

export default DirectoryUsersStatusTable