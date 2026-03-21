import React, { useState } from 'react'
import { CloudUpload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsersDirectoryStore } from "../store/usersDirectoryStore";
import { cn } from "@/lib/utils";

type BulkUploadDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({ open, setOpen }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [openUploadResponseDialog, setUploadResponseDialog] = useState<boolean>(false);
    const [uploadResult, setUploadResult] = useState<string>("")

    const { uploadFile, loadingFile, downloadTemplate, downloadingTemplate } = useUsersDirectoryStore();
    
    const handleUploadFile = async () => {
        const result = await uploadFile(selectedFile);

        if (result.status === "success") {
            setUploadResult(result.message ?? "");
            setOpen(false);
            setUploadResponseDialog(true);
        }
    }
    return (
        <>
            <Dialog open={openUploadResponseDialog} onOpenChange={setUploadResponseDialog}>
                <DialogContent aria-describedby="">
                    <DialogHeader>
                        <DialogTitle>File uploading status</DialogTitle>
                        <DialogDescription>{uploadResult}</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 flex items-center justify-center">
                        <Button onClick={() => setUploadResponseDialog(false)}>OK</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent aria-describedby="">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>Bulk Upload</DialogTitle>
                        <Button onClick={downloadTemplate}>{downloadingTemplate ? "Downloading..." : "Download Template"}</Button>
                    </DialogHeader>
                    <hr />
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload File</h3>
                            <Button variant="ghost" onClick={() => setSelectedFile(null)} className={cn(selectedFile && "text-red-600")}>
                                Remove file
                            </Button>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-2">
                            <Input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                accept=".xls,.xlsx"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedFile(file);
                                    }
                                }}
                            />
                            <label htmlFor="fileInput" className="flex flex-col items-center justify-center cursor-pointer">
                                <CloudUpload className="text-gray-400 mb-1 text-xl" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to browse</span> or drag and drop
                                </p>
                                {selectedFile &&
                                    <p className="mt-1 text-xs font-medium text-gray-900 dark:text-white">
                                        {selectedFile.name}
                                    </p>
                                }
                            </label>
                        </div>
                        <div className="w-full flex items-center justify-end gap-3 mt-6">
                            <Button disabled={loadingFile} onClick={handleUploadFile}>
                                {loadingFile ? "Uploading..." : "Upload File"}
                            </Button>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default BulkUploadDialog