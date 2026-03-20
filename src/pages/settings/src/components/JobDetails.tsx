import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { requestApi } from '../services/authService';
import { errorHandler } from '../lib/utils';
import { useToast } from "@/hooks/use-toast";
import { MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import JobInfo from '../components/JobInfo';
import { getPaginationNumbers } from "../lib/utils";

interface JobDetailsProps {
    selectedApp: ActiveIntegrationApp;
    onNext?: () => void;
}

interface SyncJob {
    job_id: string;
    sync_count: number;
    status: string;
    created: string; // or created_on based on API
    [key: string]: any;
}

const JobDetails: React.FC<JobDetailsProps> = ({ selectedApp }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedJobForView, setSelectedJobForView] = useState<SyncJob | null>(null);
    const pageSize = 50;

    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const tenantId = localStorage.getItem("tenant_id") || "";
    const urlIdentifier = userInfo.urlidentifier || tenantId;

    const getDirectoryJobs = async (page = 1) => {
        setLoading(true);
        const dirInfo = selectedApp?.basicInfo?.dirInfo || {};
        const clientId = dirInfo?.configuration?.client_id;
        const accessKeyId = dirInfo?.configuration?.aws_config?.access_key_id;

        const keyName = accessKeyId ? "access_key_id" : "client_id";
        const keyValue = accessKeyId || clientId;

        if (!keyValue) {
            setLoading(false);
            return;
        }

        const payload = {
            page: { size: pageSize, pageNumber: page - 1 },
            filter: [{ key_name: keyName, key_value: keyValue, operator: "==" }],
            sort: "",
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        try {
            const response = await requestApi(
                "POST",
                "directory/sync/jobs/filter/",
                payload,
                "authService"
            );

            if (response?.data?.status === "success") {
                const result = response.data.data;
                setSyncJobs(result.data || []);
                setTotalItems(result.overall_total || 0);
                setTotalPages(Math.ceil((result.overall_total || 0) / pageSize));
            } else {
                if (response?.data?.message) {
                    toast({ variant: "error", description: response.data.message });
                }
            }
        } catch (error: any) {
            errorHandler(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        const dirInfo = selectedApp?.basicInfo?.dirInfo || {};
        const payload: any = {
            access_key_id: "",
            client_id: dirInfo.client_id || '',
            schema_id: "",
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
            orgId: tenantId,
        };

        if (dirInfo.client_id) payload.client_id = dirInfo.client_id;
        else if (dirInfo.aws_config?.access_key_id) payload.access_key_id = dirInfo.aws_config.access_key_id;

        try {
            const appName = selectedApp?.appName.replace(/ /g, '').toLowerCase();
            const response = await requestApi(
                "POST",
                `${appName}/users/sync/`,
                payload,
                "directoryService"
            );

            if (response?.data?.status === "success") {
                toast({ description: "Sync initiated successfully" });
                getDirectoryJobs(1);
            } else {
                toast({ variant: "error", description: response?.data?.message || "Sync failed" });
            }
        } catch (error: any) {
            errorHandler(error);
        }
    };

    useEffect(() => {
        if (selectedApp) {
            getDirectoryJobs(1);
        }
    }, [selectedApp]);

    if (selectedJobForView) {
        return <JobInfo data={selectedJobForView} onBack={() => setSelectedJobForView(null)} />;
    }

    const paginationNumbers = getPaginationNumbers(currentPage, totalPages);

    return (
        <div className="flex flex-col w-full px-4 mt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-medium">Job Details</div>
                <Button onClick={handleSync} className="bg-blue-600 hover:bg-blue-700">
                    Sync
                </Button>
            </div>

            <div className="border rounded-md shadow-sm bg-white overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto relative">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-gray-50">
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead>Job ID</TableHead>
                                <TableHead>Sync Count</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Sync</TableHead>
                                <TableHead>Actions</TableHead>
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
                            ) : syncJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No Sync Job found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                syncJobs.map((job, index) => (
                                    <TableRow key={index} className="hover:bg-gray-50">
                                        <TableCell className="font-medium text-gray-900">{job.job_id}</TableCell>
                                        <TableCell>{job.sync_count || 0}</TableCell>
                                        <TableCell>{job.status || "NA"}</TableCell>
                                        <TableCell>{new Date(job.created).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white">
                                                    <DropdownMenuItem
                                                        onClick={() => setSelectedJobForView(job)}
                                                        className="text-blue-600 hover:bg-blue-50"
                                                    >
                                                        View
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="py-4 border-t">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => currentPage > 1 && getDirectoryJobs(currentPage - 1).then(() => setCurrentPage(prev => prev - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {paginationNumbers.map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === "..." ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                isActive={page === currentPage}
                                                onClick={() => {
                                                    if (page !== currentPage) {
                                                        const p = typeof page === 'number' ? page : parseInt(page as string);
                                                        getDirectoryJobs(p);
                                                        setCurrentPage(p);
                                                    }
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => currentPage < totalPages && getDirectoryJobs(currentPage + 1).then(() => setCurrentPage(prev => prev + 1))}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetails;
