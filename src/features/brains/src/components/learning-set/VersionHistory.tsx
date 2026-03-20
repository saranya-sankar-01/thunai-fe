// import React, { useState } from 'react';
// import { 
//   ArrowLeft, Clock, User, GitCommit, FileText, CheckCircle2, 
//   AlertTriangle, Filter, Search, Zap, ArrowRight, Shield, FileJson, 
//   Hash, Layout
// } from 'lucide-react';
// interface InstructionSetHistoryProps {
//   onBack: () => void;
//   setId?: string;
// }
// // --- Types based on User JSON ---
// interface Impact {
//   learning_set_id: string;
//   tag: string; // 'resolve' | 'detect' | 'ingest'
//   impact_summary: string;
//   details: Record<string, any>;
// }
// interface DocumentHistoryItem {
//   id: string;
//   tenant_id: string;
//   context_obj_id: string;
//   learning_sets: string[];
//   impacts: Impact[];
//   created: string;
//   updated: string | null;
// }
// // --- Mock Data ---
// const DOCUMENT_HISTORY_DATA: DocumentHistoryItem[] = [
//   {
//     "id": "692d4397743ba46d7cb246c1",
//     "tenant_id": "thunai1756813944616",
//     "context_obj_id": "6929a6bc1237012c54414e18", // Mock: Pricing_Guide_v2.pdf
//     "learning_sets": ["69297a9ba7f27660f9f5f98a"],
//     "impacts": [
//         {
//             "learning_set_id": "Thunai Learning",
//             "tag": "resolve",
//             "impact_summary": "Resolved Thunai's pricing to $20 (document states $25)",
//             "details": {
//                 "resolved_value": "$20",
//                 "document_value": "$25",
//                 "confidence_score": 0.98,
//                 "strategy": "authoritative_source_override"
//             }
//         }
//     ],
//     "created": "2025-12-01T07:28:23.226000",
//     "updated": null
//   },
//   {
//     "id": "782d4397743ba46d7cb246c2",
//     "tenant_id": "thunai1756813944616",
//     "context_obj_id": "8819b5cc1237012c54414f22", // Mock: Vendor_Liability_Clause.docx
//     "learning_sets": ["69297a9ba7f27660f9f5f98a"],
//     "impacts": [
//         {
//             "learning_set_id": "Thunai Learning",
//             "tag": "detect",
//             "impact_summary": "Identified missing mandatory liability cap clause",
//             "details": {
//                 "missing_entity": "Liability_Cap",
//                 "severity": "High",
//                 "section_reference": "2.1.4",
//                 "suggested_action": "manual_review"
//             }
//         },
//         {
//              "learning_set_id": "Thunai Learning",
//              "tag": "ingest",
//              "impact_summary": "Extracted effective dates for graph metadata",
//              "details": {
//                  "start_date": "2025-01-01",
//                  "end_date": "2026-01-01",
//                  "extraction_method": "regex_pattern_v2"
//              }
//         }
//     ],
//     "created": "2025-12-01T08:15:00.000000",
//     "updated": null
//   },
//   {
//       "id": "993d4397743ba46d7cb246c3",
//       "tenant_id": "thunai1756813944616",
//       "context_obj_id": "1129c6dd1237012c54414g33", // Mock: Competitor_Analysis.pdf
//       "learning_sets": ["69297a9ba7f27660f9f5f98a"],
//       "impacts": [], // No impacts, clean ingest
//       "created": "2025-12-01T09:30:45.000000",
//       "updated": null
//   }
// ];
// const MOCK_FILENAMES: Record<string, string> = {
//     "6929a6bc1237012c54414e18": "Pricing_Guide_v2.pdf",
//     "8819b5cc1237012c54414f22": "Vendor_Liability_Clause.docx",
//     "1129c6dd1237012c54414g33": "Competitor_Analysis.pdf"
// };
// export const VersionHistory: React.FC<InstructionSetHistoryProps> = ({ onBack, setId }) => {
//   const [activeTab, setActiveTab] = useState<'activity' | 'versions'>('activity');
//   const formatDate = (dateString: string) => {
//       return new Date(dateString).toLocaleString('en-US', {
//           month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
//       });
//   };
//   const renderImpactDetails = (tag: string, details: Record<string, any>) => {
//       const entries = Object.entries(details);
//       if (entries.length === 0) return null;
//       return (
//           <div className="mt-3">
//               <div className="bg-white/60 rounded-lg border border-gray-200/60 overflow-hidden text-sm">
//                   {entries.map(([key, value], index) => (
//                       <div 
//                         key={key} 
//                         className={`flex items-start justify-between px-3 py-2 ${
//                             index !== entries.length - 1 ? 'border-b border-gray-100/60' : ''
//                         }`}
//                       >
//                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{key.replace(/_/g, ' ')}</span>
//                           <div className="flex-1 text-right ml-4">
//                               <span className="text-xs font-mono text-gray-700 break-all">
//                                 {typeof value === 'object' ? JSON.stringify(value) : String(value)}
//                               </span>
//                           </div>
//                       </div>
//                   ))}
//               </div>
//           </div>
//       );
//   };
//   const getTagStyles = (tag: string) => {
//       switch(tag.toLowerCase()) {
//           case 'resolve': return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: <Zap size={14} /> };
//           case 'detect': return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: <Search size={14} /> };
//           case 'ingest': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: <FileText size={14} /> };
//           default: return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700', icon: <Layout size={14} /> };
//       }
//   };
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
//        {/* Header */}
//        <div className="border-b border-gray-200 px-6 py-4 bg-white sticky top-0 z-10">
//           <div className="flex items-center gap-4 mb-6">
//             <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
//                 <ArrowLeft size={20} />
//             </button>
//             <div>
//                 <h2 className="text-lg font-semibold text-gray-900">Protocol History</h2>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs border border-gray-200">ID: {DOCUMENT_HISTORY_DATA[0].tenant_id}</span>
//                 </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-8">
//              <button 
//                 onClick={() => setActiveTab('activity')}
//                 className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
//              >
//                 <FileText size={16} /> Document Impacts
//              </button>
//              <button 
//                 onClick={() => setActiveTab('versions')}
//                 className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'versions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
//              >
//                 <GitCommit size={16} /> Set Versions
//              </button>
//           </div>
//       </div>
//       <div className="flex-1 overflow-y-auto bg-gray-50/50">
//         {activeTab === 'activity' ? (
//             <div className="p-6 max-w-4xl mx-auto space-y-8">
                
//                 {/* Timeline Stats Summary */}
//                 <div className="flex items-center justify-between mb-4 px-2">
//                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
//                         <Clock size={14} /> Recent Processing Events
//                      </h3>
//                      <div className="flex gap-2">
//                         <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 font-medium">{DOCUMENT_HISTORY_DATA.length} Events</span>
//                         <button className="text-xs text-blue-600 hover:underline">Download JSON</button>
//                      </div>
//                 </div>
//                 {/* Event Stream */}
//                 <div className="space-y-6">
//                     {DOCUMENT_HISTORY_DATA.map((item) => (
//                         <div key={item.id} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-gray-200 last:before:hidden">
                            
//                             {/* Timeline Dot */}
//                             <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
//                                 <div className="w-2 h-2 rounded-full bg-gray-400"></div>
//                             </div>
//                             {/* Event Card */}
//                             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
//                                 {/* Card Header: Document Context */}
//                                 <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <div className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
//                                             <FileText size={16} />
//                                         </div>
//                                         <div>
//                                             <div className="text-sm font-bold text-gray-900">
//                                                 {MOCK_FILENAMES[item.context_obj_id] || item.context_obj_id}
//                                             </div>
//                                             <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
//                                                 ID: {item.context_obj_id}
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
//                                         <Clock size={12} /> {formatDate(item.created)}
//                                     </div>
//                                 </div>
//                                 {/* Card Body: Impacts */}
//                                 <div className="p-5 space-y-4">
//                                     {item.impacts.length === 0 ? (
//                                         <div className="text-center py-4 text-gray-400 text-sm italic flex flex-col items-center">
//                                             <CheckCircle2 size={24} className="mb-2 opacity-20" />
//                                             Processed without modification
//                                         </div>
//                                     ) : (
//                                         item.impacts.map((impact, idx) => {
//                                             const style = getTagStyles(impact.tag);
//                                             return (
//                                                 <div key={idx} className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
//                                                     <div className="flex items-start justify-between mb-2">
//                                                         <div className="flex items-center gap-2">
//                                                             <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border ${style.border} ${style.text}`}>
//                                                                 {style.icon} {impact.tag}
//                                                             </span>
//                                                             <span className="text-xs font-medium text-gray-500">via {impact.learning_set_id}</span>
//                                                         </div>
//                                                     </div>
                                                    
//                                                     <p className="text-sm text-gray-900 font-medium leading-relaxed">
//                                                         {impact.impact_summary}
//                                                     </p>
//                                                     {/* Dynamic Details Renderer */}
//                                                     {impact.details && renderImpactDetails(impact.tag, impact.details)}
//                                                 </div>
//                                             );
//                                         })
//                                     )}
//                                 </div>
                                
//                                 {/* Footer: Technical Meta */}
//                                 <div className="px-5 py-2 bg-slate-50 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400 font-mono overflow-x-auto">
//                                     <span className="flex items-center gap-1"><Hash size={10} /> Evt: {item.id}</span>
//                                     {item.learning_sets.length > 0 && (
//                                         <span className="flex items-center gap-1"><Zap size={10} /> Sets: {item.learning_sets.join(', ')}</span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         ) : (
//             // Version History Placeholder (kept for fallback)
//             <div className="p-12 text-center">
//                 <div className="inline-flex p-4 rounded-full bg-gray-100 text-gray-400 mb-4">
//                     <GitCommit size={32} />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900">Version History</h3>
//                 <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
//                     Track changes to the instruction sets themselves. (Switch to Document Impacts tab for the requested view).
//                 </p>
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, User, GitCommit, FileText, CheckCircle2, 
  AlertTriangle, Filter, Search, Zap, ArrowRight, Shield, FileJson, 
  Hash, Layout
} from 'lucide-react';
import { getTenantId, requestApi } from '@/services/authService';
import { toast } from "sonner";

interface InstructionSetHistoryProps {
  onBack: () => void;
  setId?: string; 
}

interface Impact {
  learning_set_id: string;
  tag: 'resolve' | 'detect' | 'ignore' | string; 
  impact_summary: string;
  details: Record<string, any>;
}

interface DocumentHistoryItem {
  id: string;
  tenant_id: string;
  context_obj_id: string;
  file_name: string; 
  learning_set_ids: string[]; 
  impacts: Impact[];
  created: string;
  updated: string | null;
}

export const VersionHistory: React.FC<InstructionSetHistoryProps> = ({ onBack, setId }) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'versions'>('activity');
  const [documentHistory, setDocumentHistory] = useState<DocumentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = getTenantId()
  const learningSetId =  setId; 

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await requestApi('GET',`brain/learning-history/${tenantId}/${learningSetId}/`,null,'brainService')
        if ( Array.isArray(response.data)) {
          setDocumentHistory(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch data.");
        }
      } catch (e: any) {
        setError(e?.response?.data?.message);
        console.error("Error fetching version history:", e);
        toast.error(e?.response?.data?.message)
    
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [tenantId, learningSetId]); 

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  const renderImpactDetails = (tag: string, details: Record<string, any>) => {
      const entries = Object.entries(details);
      if (entries.length === 0) return null;
      return (
          <div className="mt-3">
              <div className="bg-white/60 rounded-lg border border-gray-200/60 overflow-hidden text-sm">
                  {entries.map(([key, value], index) => (
                      <div 
                        key={key} 
                        className={`flex items-start justify-between px-3 py-2 ${
                            index !== entries.length - 1 ? 'border-b border-gray-100/60' : ''
                        }`}
                      >
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{key.replace(/_/g, ' ')}</span>
                          <div className="flex-1 text-right ml-4">
                              <span className="text-xs font-mono text-gray-700 break-all">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const getTagStyles = (tag: string) => {
      switch(tag.toLowerCase()) {
          case 'resolve': return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: <Zap size={14} /> };
          case 'detect': return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: <Search size={14} /> };
          case 'ignore': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: <FileText size={14} /> };
          default: return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-700', icon: <Layout size={14} /> };
      }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
       {/* Header */}
       <div className="border-b border-gray-200 px-6 py-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Protocol History</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs border border-gray-200">ID: {tenantId}</span>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
             <button 
                onClick={() => setActiveTab('activity')}
                className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
                <FileText size={16} /> Document Impacts
             </button>
             {/* <button 
                onClick={() => setActiveTab('versions')}
                className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'versions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
                <GitCommit size={16} /> Set Versions
             </button> */}
          </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        {activeTab === 'activity' ? (
            <div className="p-6 max-w-4xl mx-auto space-y-8">
                
                {/* Timeline Stats Summary */}
                <div className="flex items-center justify-between mb-4 px-2">
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} /> Recent Processing Events
                     </h3>
                     <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 font-medium">{documentHistory.length} Events</span>
                        {/* You might want to implement a download JSON functionality here */}
                        {/* <button className="text-xs text-blue-600 hover:underline">Download JSON</button> */}
                     </div>
                </div>
                {/* Loading, Error, or Event Stream */}
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading history...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">Error: {error}</div>
                ) : documentHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No document impacts found for this set.</div>
                ) : (
                    <div className="space-y-6">
                        {documentHistory.map((item) => (
                            <div key={item.id} className="relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-gray-200 last:before:hidden">
                                
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                </div>
                                {/* Event Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Card Header: Document Context */}
                                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {item.file_name || item.context_obj_id} {/* Use file_name from API */}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                                                    ID: {item.context_obj_id}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-100">
                                            <Clock size={12} /> {formatDate(item.created)}
                                        </div>
                                    </div>
                                    {/* Card Body: Impacts */}
                                    <div className="p-5 space-y-4">
                                        {item.impacts.length === 0 ? (
                                            <div className="text-center py-4 text-gray-400 text-sm italic flex flex-col items-center">
                                                <CheckCircle2 size={24} className="mb-2 opacity-20" />
                                                Processed without modification
                                            </div>
                                        ) : (
                                            item.impacts.map((impact, idx) => {
                                                const style = getTagStyles(impact.tag);
                                                return (
                                                    <div key={idx} className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border ${style.border} ${style.text}`}>
                                                                    {style.icon} {impact.tag}
                                                                </span>
                                                                <span className="text-xs font-medium text-gray-500">via {impact.learning_set_id}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-sm text-gray-900 font-medium leading-relaxed">
                                                            {impact.impact_summary}
                                                        </p>
                                                        {/* Dynamic Details Renderer */}
                                                        {impact.details && renderImpactDetails(impact.tag, impact.details)}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    
                                    {/* Footer: Technical Meta */}
                                    <div className="px-5 py-2 bg-slate-50 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400 font-mono overflow-x-auto">
                                        <span className="flex items-center gap-1"><Hash size={10} /> Evt: {item.id}</span>
                                        {item.learning_set_ids.length > 0 && ( // Use learning_set_ids from API
                                            <span className="flex items-center gap-1"><Zap size={10} /> Sets: {item.learning_set_ids.join(', ')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <GitCommit size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Set Versions</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
                    Track changes to the instruction sets themselves. (Switch to Document Impacts tab for the requested view).
                </p>
            </div>
        )}
      </div>
    </div>
  );
};
