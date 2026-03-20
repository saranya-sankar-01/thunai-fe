import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCopilotStore } from "../../store/copilotStore";

type SaveConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SaveConversationDialog = ({
  open,
  onOpenChange,
}: SaveConversationDialogProps) => {
  const [name, setName] = useState("");
  const { saveChat, loading, getSavedChats } = useCopilotStore();

  const handleSave = () => {
    if (name.trim()) {
      saveChat(name);
      setName("");
      getSavedChats();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>Save Conversation</DialogTitle>
          <DialogDescription>
            Give this conversation a name so you can find it later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Conversation Name</Label>
            <Input
              id="name"
              placeholder="e.g., Q4 Pipeline Review"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={loading.savingChat} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || loading.savingChat}>
            {loading.savingChat ? "Saving" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
