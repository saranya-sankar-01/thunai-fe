import React, { useEffect, useState } from 'react'
import { FormValues } from '../pages/CustomAgent';
import { UseFormReturn } from 'react-hook-form';
import { Copy, Inbox, MessageSquareText, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCustomAgentStore } from '../store/customAgentStore';
import { CustomDomain } from '../types/CustomDomain';

type CustomAgentSectionProps = {
    setEditId: React.Dispatch<React.SetStateAction<string>>;
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
    form: UseFormReturn<FormValues>;
}

const CustomAgentSection: React.FC<CustomAgentSectionProps> = ({ setEditId, form, setOpenDialog }) => {
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string|null>(null);
    const { customDomains, loadCustomDomains, deleteCustomDomain, domainLoading } = useCustomAgentStore();

    useEffect(() => {
        loadCustomDomains();
    }, [loadCustomDomains]);

    const openEditDialog = (domain: CustomDomain) => {
        form.setValue("title", domain.title);
        form.setValue("description", domain.description);
        form.setValue("common_widget_id", domain.common_widget_Id);
        form.setValue("uniquerUserName", domain.uniquerUserName);
        form.setValue("primary_color", domain.primary_color ?? "#000000");
        form.setValue("secondary_color", domain.secondary_color ?? "#000000");
        setOpenDialog(true);
        setEditId(domain._id)
    }

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url)
    }

    const handleOpenDelete = (id: string) => {
        setOpenDelete(true);
        setDeleteId(id);
    }

    const handleDeleteWidget = () => {
        deleteCustomDomain(deleteId);
        setOpenDelete(false);
    }

    if (domainLoading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <div className="flex flex-col items-center mr-2">
                <div className="w-10 h-10 border-4 border-t-indigo-500 border-r-indigo-500 border-b-indigo-200 border-l-indigo-200 rounded-full animate-spin"></div>
            </div>
            Loading...
        </div>
    )
    if (!domainLoading && !customDomains.length) return (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Agents Found</h3>
            <p className="text-gray-500 mb-6 max-w-md text-center">You haven't created any agents yet. Get started by creating your first custom agent.</p>
        </div>
    )
    return (
        <>
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="max-w-2xl" aria-describedby="">
                    <DialogHeader>
                        <DialogTitle>Delete Link Confirmation</DialogTitle>
                        <DialogDescription>
                            Deleting this link will impact all users accessing it. Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex space-x-3 justify-end'>
                        <Button variant='secondary' disabled={domainLoading} onClick={() => setOpenDelete(false)}>Cancel</Button>
                        <Button disabled={domainLoading} onClick={handleDeleteWidget}>{domainLoading ? "Loading..." : "Delete"}</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="overflow-y-auto h-[100vh - 250px] mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-4">
                    {customDomains.map(domain => (
                        <div key={domain._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow h-64 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <MessageSquareText className='text-gray-600' />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreVertical />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-white">
                                        <DropdownMenuItem onClick={() => openEditDialog(domain)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenDelete(domain._id)}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{domain.title}</h3>
                            <div className="flex-grow pr-2">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {domain.description}
                                </p>
                            </div>
                            <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
                                <span className="truncate flex-grow pr-2">connect.thunai.ai/{domain.uniquerUserName}</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" onClick={() => handleCopy(`connect.thunai.ai/${domain.uniquerUserName}`)}>
                                            <Copy />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Copy link
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default CustomAgentSection