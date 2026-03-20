import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Download } from 'lucide-react';
import { Input } from '../ui/input';
import { useOpportunityStore } from '../../store/opportunityStore';
import { Contact } from '../../types/Contact';

interface BulkUploadOpportunitiesProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact?: Contact;
}

export const BulkUploadOpportunities = ({ open, onOpenChange, contact }: BulkUploadOpportunitiesProps) => {
    const { downloadBulkuploadTemplate, loading, bulkUploadOpportunities, loadOpportunity, loadListviewOpportunites } = useOpportunityStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null)


    const handleUpload = async () => {
        const success = await bulkUploadOpportunities(selectedFile);
        if (success) {
            onOpenChange(false);
            if (contact) {
                await loadOpportunity([{ key_name: "associated_contacts.email", operator: "==", key_value: contact.email }], "");
            } else {
                await loadListviewOpportunites([], "");
            }
        }

    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload size={20} />
                        Bulk Upload Opportunities
                    </DialogTitle>
                    <DialogDescription>Upload a CSV file with opportunities.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label>Upload CSV File</Label>
                        <Button variant="ghost" size="sm" disabled={loading.downloadingTemplate} onClick={downloadBulkuploadTemplate} className="text-xs text-blue-600">
                            <Download size={14} className="mr-1" />
                            {loading.downloadingTemplate ? 'Downloading...' : 'Download Template'}
                        </Button>
                    </div>
                    <Input type="file" id='fileInput' accept=".csv" onChange={(e) => {
                        {
                            const file = e.target.files?.[0];
                            if (file) {
                                setSelectedFile(file);
                            }
                        }
                    }} className="hidden" />
                    <label htmlFor="fileInput"
                        className="border-2 block border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    >
                        {selectedFile ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                                <FileText size={16} />
                                {selectedFile.name}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                                Click to upload CSV file
                            </div>
                        )}
                    </label>
                    {selectedFile &&
                        <div className='w-full text-right'>
                            <Button className='p-0 h-auto text-destructive text-right hover:bg-white hover:text-destructive' variant='ghost' onClick={() => setSelectedFile(null)}>Remove file</Button>
                        </div>
                    }
                </div>

                <DialogFooter>
                    <Button variant="outline" disabled={loading.opportunitiesBulkUploading} onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button disabled={loading.opportunitiesBulkUploading} onClick={handleUpload}>
                        {loading.opportunitiesBulkUploading ? 'Uploading...' : 'Upload Opportunities'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
