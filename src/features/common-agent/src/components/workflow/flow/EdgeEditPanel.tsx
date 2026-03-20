
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Edge } from '@xyflow/react';

interface EdgeEditPanelProps {
  edge: Edge | null;
  onSave: (id: string, condition: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EdgeEditPanel({ edge, onSave, onDelete, onClose }: EdgeEditPanelProps) {
  const [condition, setCondition] = useState('');

  useEffect(() => {
    if (edge) {
      setCondition(edge.label as string || '');
    }
  }, [edge]);

  if (!edge) return null;

  const handleSave = () => {
    onSave(edge.id, condition);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-50">
      <div className="bg-gray-900 w-full max-w-md rounded-md shadow-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between bg-gray-800 p-3 border-b border-gray-700">
          <h3 className="font-medium text-white">Edit Connection</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={16} className="text-gray-400" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="condition" className="text-sm font-medium text-white">Condition</label>
            <Input 
              id="condition" 
              value={condition} 
              onChange={(e) => setCondition(e.target.value)} 
              placeholder="e.g. response == 'Nike'"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="text-sm text-gray-400">
            Connect nodes with conditions like:<br/>
            <code>response == 'Nike'</code> or <code>response != 'Adidas'</code>
          </div>
        </div>
        
        <div className="border-t border-gray-700 p-4 flex justify-between">
          <Button 
            variant="destructive" 
            onClick={() => {
              onDelete(edge.id);
              onClose();
            }}
          >
            Delete
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
