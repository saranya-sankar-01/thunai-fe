
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Bot, 
  Settings, 
  Trash2, 
  Plus,
  List,
  Code
} from "lucide-react";
import ConfirmationModal from "../../../components/workflow/common-components/popup";
import { useState } from "react";

interface ControlPanelProps {
  onGenerateWithAI: () => void;
  onToggleConversationFlow: () => void;
  isConversationFlowEnabled: boolean;
  onDeleteSelected: () => void;
  onAddNode: () => void;
}

export default function ControlPanel({
  onGenerateWithAI,
  onToggleConversationFlow,
  isConversationFlowEnabled,
  onDeleteSelected,
  onAddNode,
}: ControlPanelProps) {
 const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleConfirmDelete = () => {
    onDeleteSelected();
    closeModal();
  };
   return (
    <>
      <div className="flex items-center space-x-4 bg-background p-3 rounded-md">
        <Button
          variant="outline"
          className="shadow-xl border-white bg-white text-black hover:bg-gray-300 hover:shadow-2xl hover:text-black"
          onClick={onGenerateWithAI}
        >
          <Bot size={18} className="mr-2" /> Generate with AI
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-white text-black shadow-xl border-white hover:bg-gray-300 hover:shadow-2xl hover:text-black "
          onClick={onAddNode}
        >
          <Plus size={18} />
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="bg-white text-black shadow-xl border-white hover:bg-gray-300 hover:shadow-2xl hover:text-black"
          onClick={openModal}
        >
          <Trash2 size={18} />
        </Button>
      </div>

      {isModalOpen && (
        <ConfirmationModal
          message={
            "Are you absolutely sure?\n\nThis action cannot be undone. This will permanently delete all nodes and edges in your current conversation flow and create a single starting node."
          }
          onConfirm={handleConfirmDelete}
          onCancel={closeModal}
        />
      )}
    </>
  );
}