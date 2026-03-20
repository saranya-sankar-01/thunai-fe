import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFile: File | null;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  isUploading: boolean;
  onUpload: () => void;
}

export default function UploadDialog({
  open,
  onOpenChange,
  selectedFile,
  setSelectedFile,
  isUploading,
  onUpload,
}: UploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          setSelectedFile(null);
        }
      }}
    >
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create New Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);

              const file = e.dataTransfer.files?.[0];
              if (file) {
                setSelectedFile(file);
              }
            }}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all
    ${
      isDragging
        ? "border-blue-500 bg-blue-50"
        : "border-muted-foreground/30 hover:border-blue-500 hover:bg-muted/40"
    }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-3" />

            <p className="text-sm font-medium text-foreground">
              Click to upload or drag and drop
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, DOCX, TXT
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="w-[600px]">
              <div className="flex items-center justify-between gap-3 bg-muted/40 rounded-lg px-4 py-3 border w-full">
                {/* Left Section */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate w-full"
                      title={selectedFile.name}
                    >
                      {selectedFile.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button
              disabled={!selectedFile || isUploading}
              onClick={onUpload}
              className="min-w-[100px]"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
