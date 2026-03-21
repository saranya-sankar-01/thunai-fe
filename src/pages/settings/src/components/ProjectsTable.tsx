import React from 'react'
import { Building, FolderOpen } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectStore } from "../store/projectsStore";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getPaginationNumbers } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { usePermissions } from "../services/permissionService";

type ProjectsTableProps = {
    setOpenDialg: (open: boolean) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ setOpenDialg }) => {
    const { hasPermission } = usePermissions();
    const { tenants, loading, currentPage, setCurrentPage, totalPages } = useProjectStore();

    if (!loading && !tenants?.length) {
        return <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4 max-w-sm">
                You don't have any projects yet. Create your first project to get started.
            </p>
            {hasPermission("accounts_admin", "ALL") && <Button onClick={() => setOpenDialg(true)}>
                + Create Project
            </Button>}
        </div>
    }

    return (
        <div className="border rounded-md shadow-sm bg-white overflow-hidden w-full">
            <div className="max-h-[70vh] overflow-y-auto relative">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead>Name</TableHead>
                            <TableHead className='items-center'>Lead</TableHead>
                            <TableHead className='text-right'>Last Update</TableHead>
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
                        ) : (tenants.map(tenant => (
                            <TableRow key={tenant.id}>
                                <TableCell className='flex items-center space-x-2'>
                                    <div className='w-5 h-5 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <Building className='w-5 h-5 text-blue-600' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <span className='text-sm font-semibold text-gray-900 block truncate'>{tenant.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='space-x-2'>
                                        <span className='truncate'>{tenant.created_by || "N/A"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className='text-right'>
                                    <div className='space-x-3 text-gray-500'>
                                        <span className='text-[10px] md:text-sm'>{new Date(tenant.updated).toLocaleString()}</span>
                                    </div>
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
        </div>
    )
}

export default ProjectsTable