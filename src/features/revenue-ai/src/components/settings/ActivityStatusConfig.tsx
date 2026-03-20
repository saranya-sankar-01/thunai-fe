import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActivityStatusStore } from '../../store/activityStatusStore';

const defaultStatuses = [
  'Connected', 'Voicemail', 'No Answer', 'Busy', 'Wrong Number', 'Left Message', 'Callback Requested', 'Not Interested'
];

interface ActivityStatusConfigProps {
  statuses: string[];
  onStatusesChange: (statuses: string[]) => void;
}

export const ActivityStatusConfig = ({ statuses, onStatusesChange }: ActivityStatusConfigProps) => {
  const { loadActivityStatus, createActivityStatus, deleteActivityStatus, activityStatus, loading } = useActivityStatusStore();
  const [newStatus, setNewStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadActivityStatus();
  }, [loadActivityStatus]);
  // console.log(activityStatus);

  const handleAdd = async () => {
    const trimmed = newStatus.trim();
    if (!trimmed) return;

    createActivityStatus([trimmed]);
    setNewStatus('');
  };

  const handleRemove = (status: string) => {
    deleteActivityStatus(status);
  };

  const handleReset = () => {
    onStatusesChange(defaultStatuses);
    toast({ title: 'Reset', description: 'Activity statuses reset to defaults.' });
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Activity Status Configuration</h2>
            <p className="text-sm text-gray-600">Configure the statuses available when logging an activity on a contact (e.g., calls, outreach).</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Input
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="New status name..."
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={!newStatus.trim() || loading.creatingActivityStatus} size="sm">
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          {loading.loadingActivityStatus ? (<div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>) : (activityStatus.map((status) => (
            <div key={status} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 group">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-gray-400" />
                <span className="text-sm text-gray-800">{status.at(0).toUpperCase() + status.slice(1)}</span>
              </div>
              <button
                disabled={loading.deletingActivityStatus}
                onClick={() => handleRemove(status)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>
          )))}

        </div>

        {/* <Button variant="outline" size="sm" onClick={handleReset}>
          Reset to Defaults
        </Button> */}
      </div>
    </div>
  );
};
