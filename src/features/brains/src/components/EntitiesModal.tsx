import { useState, useEffect } from 'react';
import { X, Trash2, Loader2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTenantId, requestApi } from '@/services/authService';

interface Entity {
  id: string;
  name: string;
  tenant_id: string;
  created: string;
  updated: string;
}

interface EntitiesModalProps {
  onClose: () => void;
}

const EntitiesModal = ({ onClose }: EntitiesModalProps) => {
  const tenantID = getTenantId()
  const [entities, setEntities] = useState<Entity[]>([]);
  const [newEntityName, setNewEntityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingEntity, setAddingEntity] = useState(false);
  const [deletingEntityId, setDeletingEntityId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    setLoading(true);
    const payload = {
      filter: [],
      page: { size: 10, page_number: 1 },
      sort: "dsc",
      sortby: "created"
    };
    try {
      const response = await requestApi('POST', `${tenantID}/entities/filter/`, payload, "authService");
      const result = response
      setEntities(result.data.data);
    } catch (error) {
      console.error('Error fetching entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntity = async () => {
    if (!newEntityName.trim()) return;
    
    setAddingEntity(true);
    try {
      const payload = { name: newEntityName };
      const response = await requestApi('POST', `${tenantID}/entities/`, payload, "authService");
      
      if (response) {
        setNewEntityName('');
        fetchEntities();
      }
    } catch (error) {
      console.error('Error adding entity:', error);
    } finally {
      setAddingEntity(false);
    }
  };

  const deleteEntity = async (id: string) => {
    setDeletingEntityId(id);
    try {
      const response = await requestApi('DELETE', `${tenantID}/entities/?id=${id}`, null, "authService");
      
      if (response) {
        fetchEntities();
      }
    } catch (error) {
      console.error('Error deleting entity:', error);
    } finally {
      setDeletingEntityId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[60vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between py-3 px-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">Entities</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Add Entity Section - Fixed */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-700">Add New Entity</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter entity name"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEntity()}
                className="flex-1"
              />
              <Button 
                onClick={addEntity} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={addingEntity || !newEntityName.trim()}
              >
                {addingEntity ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Add'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Entities List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : entities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No entities found. Add your first entity above.
              </div>
            ) : (
              entities.map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-base font-medium text-gray-900">{entity.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntity(entity.id)}
                    disabled={deletingEntityId === entity.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingEntityId === entity.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntitiesModal;
