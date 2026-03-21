import React from 'react'
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSsoStore } from "../store/ssoStore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import WarningIcon from "../assets/images/warning-icon.svg";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

const SsoConfigurationsList: React.FC = () => {
    const {
        loading,
        ssoConfigurations,
        deleteSsoConfiguration,
        loadSsoConfigurations,
        setSelectedSso,
        setIsEdit,
        setAppID
    } = useSsoStore();
    const { toast } = useToast();

    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const handleEdit = (config: any) => {
        setSelectedSso(config.type);
        setIsEdit(true);
        setAppID(config.id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const result = await deleteSsoConfiguration(deleteId);
        if (result?.status === 'success') {
            toast({ variant: "success", title: "Success", description: "Configuration deleted successfully" });
            loadSsoConfigurations();
        } else {
            toast({ variant: "error", description: result?.message || "Delete failed" });
        }
        setDeleteId(null);
    };

    if (!loading.loadSso && !ssoConfigurations.length) return <div className="mt-4 text-center text-gray-500">
        No data found.
    </div>

    if (loading.loadSso) return <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 mr-2 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading providers...</span>
    </div>

    return (
        <>
            <div className="flex justify-start gap-2 flex-col p-2 mt-4 mb-4 h-[calc(100vh-225px)] overflow-y-auto">
                {ssoConfigurations.map(config => (
                    <div className="w-3/4" key={config.id}>
                        <div className="bg-white p-2 rounded-xl border border-gray-300 shadow-sm flex flex-col md:flex-row items-center justify-between">
                            <div className="rounded-full h-12 w-12 p-2 overflow-hidden flex justify-center items-center bg-[#f0f0f0] mb-2 md:mb-0 md:mr-4">
                                {config.logo &&
                                    <img
                                        src={config.logo}
                                        alt={config.provider_name}
                                        className="object-contain h-10 w-10"
                                    />}
                                {!config.logo &&
                                    <h1 className="font-medium text-xl text-black">
                                        {config?.provider_name?.charAt(0).toUpperCase() || ''}
                                    </h1>
                                }
                            </div>

                            <div className="flex-1 mb-2 md:mb-0 md:mr-4 text-center md:text-left">
                                <p className="text-sm text-[#4e4e4e]">
                                    {config.provider_name}
                                    <span
                                        className="bg-blue-100 ml-2 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                                    >
                                        {config.type}
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center justify-center md:justify-end">
                                {!config.is_configured &&
                                    <div title="Incomplete setup — finish all steps to continue." className="mr-4">
                                        <img src={WarningIcon} alt="Warning" className="h-5 w-5" />
                                    </div>}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white">
                                        <DropdownMenuItem onClick={() => handleEdit(config)}>
                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setDeleteId(config.id)} className="text-red-600">
                                            <Trash className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Delete Confirmation Modal */}
            <DeleteConfirmationDialog
                openDeleteDialog={!!deleteId}
                handleCloseModal={() => setDeleteId(null)}
                buttonText="Continue"
                description="Once deleted, this configuration cannot be recovered"
                title="Do you want to delete the File?"
                handleDelete={handleDelete}
                keyword="confirm"
                loading={loading.deleteSso}
            />
        </>
    )
}

export default SsoConfigurationsList