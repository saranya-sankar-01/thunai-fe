import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editedText: string;
  setEditedText: (value: string) => void;
  isUpdating: boolean;
  onSave: () => void;
}

export default function EditDialog({
  open,
  onOpenChange,
  editedText,
  setEditedText,
  isUpdating,
  onSave,
}: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Extracted Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Edit extracted content..."
            className="
              w-full
              min-h-[300px]
              border
              border-primary/25
              focus:border-primary/25
              focus:ring-1
              focus:ring-primary/25
              rounded-md
              p-3
              text-sm
              resize-none
              outline-none
            "
          />

          <div className="flex justify-end gap-2">
              <Button
              size="sm"
              disabled={!editedText || isUpdating}
              onClick={onSave}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button> 
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
