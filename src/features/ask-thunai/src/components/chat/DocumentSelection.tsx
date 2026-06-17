import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar } from 'lucide-react';
import { Document } from '../../hooks/useDocument';

interface DocumentSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onSelectDocument: (document: Document) => void;
}

export const DocumentSelection = ({
  isOpen,
  onClose,
  documents,
  onSelectDocument
}: DocumentSelectionProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Document to Edit
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-60">
          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No documents available. Create one first by asking the AI to create a document.
              </p>
            ) : (
              documents.map((doc) => (
                <Button
                  key={doc.id}
                  variant="outline"
                  onClick={() => {
                    onSelectDocument(doc);
                    onClose();
                  }}
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};