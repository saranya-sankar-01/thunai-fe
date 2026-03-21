import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { MoreVertical } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from "@/components/ui/pagination"
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog"
import { useEmailTemplateStore } from "../store/emailTemplateStore"
import { cn, getPaginationNumbers } from "../lib/utils"

const EmailTemplatesTable: React.FC = () => {
    const navigate = useNavigate();
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null)
    const { emailTemplates = [], setCurrentPage, currentPage, totalPages, loading, resetTemplate } = useEmailTemplateStore();


    const handleDeleteTemplate = (id: string) => {
        setIdToDelete(id);
        setDeleteConfirm(true);
    }

    if (loading) return <div className="py-10 text-center text-gray-500">
        Loading templates...
    </div>

    if (!loading && !emailTemplates.length) return <div className="px-6 py-10 text-center text-gray-500">
        No templates found
    </div>


    return (
        <>
            <DeleteConfirmationDialog
                openDeleteDialog={deleteConfirm}
                buttonText="Continue"
                description="Reset Template"
                keyword="confirm"
                title="Reset Template Confirmation"
                loading={loading}
                handleCloseModal={() => setDeleteConfirm(false)}
                handleDelete={() => resetTemplate(idToDelete)}
            />
            <div className="border rounded-md shadow-sm bg-white overflow-hidden w-full mt-4">
                <div className={cn("overflow-y-auto relative", totalPages > 1 ? "max-h-[65vh]" : "max-h-[70vh]")}>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead>Template Name</TableHead>
                                <TableHead>Created On</TableHead>
                                <TableHead>Updated On</TableHead>
                                <TableHead>Actions</TableHead>
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
                            </TableRow>) : (!loading && emailTemplates.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No Email Templates found.
                                    </TableCell>
                                </TableRow>
                            ) : (emailTemplates.map(template => (
                                <TableRow key={template.id} className="hover:bg-gray-50">
                                    <TableCell className="text-primary hover:underline cursor-pointer text-xs md:text-sm break-words" onClick={() => navigate(`/settings/email-templates/create?id=${template.id}`)}>{template.template_key}</TableCell>
                                    <TableCell>{format(new Date(template.created), "MMM dd, yyyy, hh:mm aa")}</TableCell>
                                    <TableCell>{format(new Date(template.updated), "MMM dd, yyyy, hh:mm aa")}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white">
                                                <DropdownMenuItem onClick={() => navigate(`/settings/email-templates/create?id=${template.id}`)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>Reset</DropdownMenuItem>
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

export default EmailTemplatesTable