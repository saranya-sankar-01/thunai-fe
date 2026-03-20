import { create } from 'zustand';
import {  getTenantId, requestApi } from '@/services/authService';
import { KnowledgeBaseItem } from '@/types/KnowledgeBaseItem';
import { toast } from 'sonner';

interface KnowledgeBaseStore {
  knowledgeBaseItems: KnowledgeBaseItem[];
  loading: boolean;
loadFiles: (filterType: string, page?: number, size?: number, advancedFilters?: any[],searchQuery?: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
    currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  appliedFilters: any[];
  setAppliedFilters: (filters: any[]) => void; 
  clearFilters: () => void; 
   credits: number,
     lastActiveTab: string; 
  setLastActiveTab: (tab: string) => void; 
  knowledgeGraphSubTab: string;
  setKnowledgeGraphSubTab: (subTab: string) => void;
  processing:number
    
}

export const useKnowledgeBaseStore = create<KnowledgeBaseStore>((set, get) => ({
  processing:0,
    lastActiveTab: 'all', // Initial value
  setLastActiveTab: (tab: string) => set({ lastActiveTab: tab }),
  knowledgeGraphSubTab: 'explorer', // Initial sub-tab
  setKnowledgeGraphSubTab: (subTab: string) => set({ knowledgeGraphSubTab: subTab }),
  knowledgeBaseItems: [],
  loading: false,
currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10,

  setLoading: (loading: boolean) => set({ loading }),
setCurrentPage: (page: number) => set({ currentPage: page }),
 setAppliedFilters: (filters: any[]) => set({ appliedFilters: filters }), 
  clearFilters: () => set({ appliedFilters: [] }), 
  appliedFilters: [],
  credits:0,
loadFiles: async (filterType: string,page=1,size=10,advancedFilters = [],searchQuery='') => {
  const tenantID = getTenantId();
    try {
      set({ loading: true });
      
      let filterArray: any[] = [];
      
      if (filterType !== 'all'  && advancedFilters.length === 0) {
        let typeValue: string[];
        switch (filterType) {
          case 'documents':
            typeValue = ['file','text'];
            break;
          case 'links':
            typeValue = ['web-link'];
            break;
          case 'videos':
            typeValue = ['video'];
            break;
          case 'images':
            typeValue = ['image'];
            break;
            case 'streams':
            typeValue = ['stream'];
            break;  
            case 'audios':
            typeValue = ['audio'];
            break;
          default:
            typeValue = ['file'];
        }

        filterArray = [
          {
            "key_name": "type",
            "key_value": typeValue,
            "operator": "in",
            "inputtype": "multiselect"
          }
        ];
      }
 if (advancedFilters && advancedFilters.length > 0) {
        filterArray = [...filterArray, ...advancedFilters];
      }
      const requestBody = {
        "filter": filterArray,
        "page": {
          "size": size,
          "page_number": page
        },
        "sort": "desc",
        "sortby": "updated",
         ...(searchQuery && { "q": searchQuery })
      };

      const response = await requestApi(
        "POST", 
        `brain/knowledge-base/${tenantID}/filter/`, 
        requestBody, 
        "brainService"
      );
      
           const result: KnowledgeBaseItem[] = response.data?.context_data || [];
      const total = response.data?.total || 0;
      const totalPages = Math.ceil(total / size);
       const credits = response.data?.credits || 0;
       const processing = response.data.is_processing || 0;
      
      set({ 
        knowledgeBaseItems: result,
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        pageSize: size, appliedFilters: advancedFilters,
         credits: credits,
         processing:processing
      });

    } catch (error: any) {
      console.error("Load content error:", error);
      toast.error(error?.response?.data?.messge || error?.response?.message || "Failed to load")
    } finally {
      set({ loading: false });
    }
  }
}));