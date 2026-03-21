import React, { useState } from 'react'
import { MoreVertical } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog"
import { useUsersDirectoryStore } from "../store/usersDirectoryStore"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { cn, getPaginationNumbers } from "../lib/utils"
import { UserDirectory } from "../types/UserDirectory"

type UsersDirectoryTableProps = {
    handleEditDialog: (user: UserDirectory) => void;
}

const UsersDirectoryTable: React.FC<UsersDirectoryTableProps> = ({ handleEditDialog }) => {
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [selectDelete, setSelectDelete] = useState<string | null>(null);
    const { users, loading, currentPage, setCurrentPage, totalPages, deleteUser } = useUsersDirectoryStore();

    const handleDeleteUser = (id: string) => {
        setOpenDeleteDialog(true);
        setSelectDelete(id)
    }

    return (
        <>
            <DeleteConfirmationDialog
                title="Delete User"
                description="Are you sure you want to delete this User? This action cannot be undone."
                buttonText="Delete"
                keyword="delete"
                loading={loading}
                openDeleteDialog={openDeleteDialog}
                handleCloseModal={() => setOpenDeleteDialog(false)}
                handleDelete={() => deleteUser(selectDelete)}
            />
            <div className="border rounded-md shadow-sm bg-white overflow-hidden w-full">
                <div className={cn("overflow-y-auto relative", totalPages > 1 ? "max-h-[60vh]" : "max-h-[65vh]")}>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead>EMAIL ID</TableHead>
                                <TableHead>NAME</TableHead>
                                <TableHead>CREATED DATE</TableHead>
                                <TableHead>ACTIONS</TableHead>
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
                            ) : (!loading && users.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No Users found.
                                    </TableCell>
                                </TableRow>
                            ) : (users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.name || "NA"}</TableCell>
                                    <TableCell>{format(new Date(user.created), "MMM dd, yyyy, hh:mm aa")}</TableCell>
                                    {/* <TableCell>{new Intl.DateTimeFormat("en-US", {
                            timeZone: "Asia/Kolkata",
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        }).format(new Date(user.created))}</TableCell> */}
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white">
                                                <DropdownMenuItem onClick={() => handleEditDialog(user)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
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

export default UsersDirectoryTable