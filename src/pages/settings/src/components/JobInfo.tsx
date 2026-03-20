import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface JobInfoProps {
    data: any;
    onBack: () => void;
}

const JobInfo: React.FC<JobInfoProps> = ({ data, onBack }) => {
    const filteredData = data?.filtered_data || [];

    const getUserEmail = (user: any) => {
        return user.userPrincipalName || user.email || 'NA';
    };

    const getUserStatus = (user: any) => {
        return user?.status || 'NA';
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center w-full mb-4">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            <div className="border rounded-md shadow-sm bg-white overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-gray-50">
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead>Email ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                        No Records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item: any, index: number) => (
                                    <TableRow key={index} className="hover:bg-gray-50">
                                        <TableCell>{getUserEmail(item)}</TableCell>
                                        <TableCell>{getUserStatus(item)}</TableCell>
                                        <TableCell>
                                            {item.created ? format(new Date(item.created), "MMM dd, yyyy") : 'NA'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default JobInfo;
