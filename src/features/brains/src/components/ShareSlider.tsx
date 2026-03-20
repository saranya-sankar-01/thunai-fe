import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { getTenantId, requestApi } from '@/services/authService';
import { toast } from 'sonner';

interface Tenant {
  name: string;
  tenant_id: string;
  created: string;
  updated: string;
  created_by: string;
  id: string;
  is_default: boolean;
}

interface ShareSliderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFileIds: string[];

  onClearSelection?: () => void;
}

export const ShareSlider = ({ isOpen, onClose, selectedFileIds, onClearSelection }: ShareSliderProps) => {
  const tenantID = getTenantId()
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && searchTerm) {
      const debounceTimer = setTimeout(() => {
        fetchTenants(searchTerm);
      }, 800);

      return () => clearTimeout(debounceTimer);
    } else if (isOpen && !searchTerm) {
      fetchTenants();
    }
  }, [searchTerm, isOpen]);

  const fetchTenants = async (search?: string) => {
    try {
      setLoading(true);
      const payload = {
        filter: search
          ? [
              {
                key_name: 'name',
                key_value: search,
                operator: 'like',
              },
            ]
          : [],
        page: {
          size: 100,
          page_number: 1,
        },
        sort: 'asc',
        sortby: 'created',
      };

      const response = await requestApi(
        'POST',
        'tenant/filter/',
        payload,
        'accountService'
      );

    
        setTenants(response?.data || []);
        console.log('Fetched tenants:', response.data || []);
      
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error(error?.response?.data?.message  || error?.response?.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTenant = (tenantId: string) => {
    const newSelected = new Set(selectedTenants);
    if (newSelected.has(tenantId)) {
      newSelected.delete(tenantId);
    } else {
      newSelected.add(tenantId);
    }
    setSelectedTenants(newSelected);
  };

  const handleShare = async () => {
    if (selectedTenants.size === 0) {
      toast.error('Please select at least one tenant');
      return;
    }

    if (selectedFileIds.length === 0) {
      toast.error('No files selected to share');
      return;
    }

    try {
      setSharing(true);

      const payload = {
        ids: selectedFileIds,
        shared_tenant_ids: Array.from(selectedTenants),
      };

      const response = await requestApi(
        'POST',
        `${tenantID}/share/knowledgebase/`,
        payload,
        'authService'
      );

        toast.success(
        response?.message || `Successfully shared ${selectedFileIds.length} file${selectedFileIds.length > 1 ? 's' : ''} with ${selectedTenants.size} tenant${selectedTenants.size > 1 ? 's' : ''}`
        );
        
        // Clear file selection
        onClearSelection?.();
        
        // Reset slider state
        setSelectedTenants(new Set());
        setSearchTerm('');
        onClose();

    } catch (error: any) {
      console.error('Error sharing files:', error);
      toast.error(error?.response?.data?.message || error?.response?.message || 'Failed to share files');
    } finally {
      setSharing(false);
    }
  };

  const handleCancel = () => {
    setSelectedTenants(new Set());
    setSearchTerm('');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col gap-0">
        <SheetHeader className="px-6 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Select Projects</SheetTitle>
          </div>
        </SheetHeader>

        <div className="px-6 p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tenants"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading && tenants.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading tenants...</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No tenants found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.filter((tenant) => tenant.tenant_id !== tenantID).map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center space-x-3 py-2 hover:bg-muted/50 rounded-md px-2 cursor-pointer"
                  onClick={() => handleToggleTenant(tenant.tenant_id)}
                >
                  <Checkbox
                    checked={selectedTenants.has(tenant.tenant_id)}
                    onCheckedChange={() => handleToggleTenant(tenant.tenant_id)}
                  />
                  <label className="flex-1 cursor-pointer text-sm font-medium">
                    {tenant.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedTenants.size} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={sharing}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={selectedTenants.size === 0 || sharing}
            >
              {sharing ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
