import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

interface DeleteConfirmationDialogProps {
    title: string;
    description: string;
    keyword: string;
    buttonText: string;
    loading: boolean;
    openDeleteDialog: boolean;
    handleCloseModal: () => void;
    handleDelete?: () => void
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ title, description, keyword, buttonText, openDeleteDialog, loading, handleCloseModal, handleDelete }) => {
    const [deleteText, setDeleteText] = useState("");

    // const { toast } = useToast();
    const handleCloseDeleteModal = () => {
        setDeleteText("");
        handleCloseModal();
    }

    const handleDeleteItem = () => {
        handleDelete();
        setDeleteText("")
        handleCloseModal();
    }

    return (
        <Dialog open={openDeleteDialog} onOpenChange={handleCloseDeleteModal}>
            <DialogContent className="max-w-2xl" aria-describedby="">
                <DialogHeader className="flex flex-row items-start border-b border-gray-100">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
                        <TriangleAlert className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="ml-4">
                        <DialogTitle>
                            {title}
                        </DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </div>
                </DialogHeader>
                <h5 className="block text-sm font-medium text-gray-700 mb-2">Type<span className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">"{keyword}"</span> to proceed</h5>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter confirmation text..."
                        value={deleteText}
                        onChange={(e) => setDeleteText(e.target.value)}
                        aria-describedby="confirmation-help"
                        aria-required="true"
                        autoComplete="off"
                        className={cn("block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 text-sm", {
                            "border-green-500 focus:ring-green-500 focus:border-green-500": deleteText === keyword,
                            "border-gray-300 focus:ring-orange-500 focus:border-orange-500": deleteText !== keyword
                        })}
                    />
                    {deleteText === keyword &&
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    }
                </div>
                <div className="py-4 rounded-b-lg flex justify-end space-x-3">
                    <Button variant="destructive" disabled={deleteText !== keyword} onClick={handleDeleteItem}>{loading ? "Loading..." : buttonText}</Button>
                    <Button variant="outline" disabled={loading} onClick={() => handleCloseDeleteModal()}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteConfirmationDialog;