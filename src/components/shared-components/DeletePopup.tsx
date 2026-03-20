import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteCategoryDialogProps {
  deleting: { id: string; name: string }[] | null;
  isDeletingCategory: boolean;
  handleDeleteCategory: (category: { id: string; name: string }[]) => void;
  setDeleting: (category: null) => void;
}

const DeletePopup: React.FC<DeleteCategoryDialogProps> = ({
  deleting,
  isDeletingCategory,
  handleDeleteCategory,
  setDeleting,
}) => {
  return (
    <AlertDialog open={!!deleting}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            Delete
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
  onClick={() => deleting && handleDeleteCategory(deleting)}
  disabled={isDeletingCategory}
  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
>
  {isDeletingCategory ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Deleting...
    </>
  ) : (
    <>
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </>
  )}
</AlertDialogAction>

          <AlertDialogCancel
            onClick={() => setDeleting(null)}
            disabled={isDeletingCategory}
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePopup;
