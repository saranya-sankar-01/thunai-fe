import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContactStore } from '../../store/contactStore';
import { Input } from '../ui/input';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkUploadDialog = ({ open, onOpenChange }: BulkUploadDialogProps) => {
  const { bulkUploadContacts, loading, downloadBulkUploadTemplate } = useContactStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleCloseDialog = () => {
    onOpenChange(false);
    setSelectedFile(null);
  }

  const handleUpload = async () => {
    const success = await bulkUploadContacts(selectedFile);
    if (success) {
      handleCloseDialog();
    }

  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload size={20} />
            Bulk Upload Contacts
          </DialogTitle>
          <DialogDescription>Upload a CSV file with contacts. All contacts will be assigned to the selected sales person.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Upload CSV File</Label>
            <Button variant="ghost" size="sm" disabled={loading.downloadingTemplate} onClick={downloadBulkUploadTemplate} className="text-xs text-blue-600">
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
            // onClick={() => fileInputRef.current?.click()}
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
          <Button variant="outline" disabled={loading.contactsBulkUploading} onClick={handleCloseDialog}>Cancel</Button>
          <Button disabled={loading.contactsBulkUploading} onClick={handleUpload}>
            {loading.contactsBulkUploading ? 'Uploading...' : 'Upload Contacts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
