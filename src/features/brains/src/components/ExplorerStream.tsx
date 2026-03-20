import React from 'react';
import { ExplorerStreamType } from '@/types/ExplorerStreamType';
import { FileText, Loader2, CheckCircle2, XCircle, Clock, Activity, BrainCircuit, RefreshCcw, ChevronsRight } from 'lucide-react';
import ISTTimeWithMin from './shared-components/ISTTimeWithMin';
import ISTTime from './shared-components/ISTTime';

interface ProcessMonitorProps {
  processes: ExplorerStreamType[];
   onClose?: () => void
}

export const ExplorerStream: React.FC<ProcessMonitorProps> = ({ processes,onClose }) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "failed": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <Loader2 className="animate-spin text-blue-600" size={16} />;
      case "completed": return <CheckCircle2 className="text-emerald-600" size={16} />;
        case "pending": return <Loader2 className="text-yellow-600" size={16} />;
      case "failed": return <XCircle className="text-red-600" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getTaskIcon = (taskName: string) => {
    if (taskName.includes("classification")) return <BrainCircuit size={18} className="text-purple-600" />;
    if (taskName.includes("contradiction")) return <RefreshCcw size={18} className="text-orange-600" />;
    return <FileText size={18} className="text-gray-500" />;
  };
  const formatTaskName = (name: string) => {
      // Convert 'process_brain_classification' -> 'Brain Classification'
      return name.replace('process_', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden  flex flex-col transition-transform duration-300 ease-in-out animate-in slide-in-from-right-10">

      {/* Header */}
      <div className="p-3 flex items-center justify-end w-full border-b border-gray-200   bg-gray-50/50">
      
        {onClose && (
    <button 
      onClick={onClose}
      className="text-gray-500 hover:text-gray-700"
    >
         <ChevronsRight size={18} />
    </button>
  )}
      </div>

      {/* Body */}
      <div className="show-scrollbar overflow-y-auto flex-1 p-4 space-y-3">
        {processes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 "  style={{ height: "calc(100vh - 160px)"}}>No activity yet.</div>
        ) : (
          processes.map((p) => (
            <div key={p.id} className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

              {/* Progress (only for processing) */}
              {/* {p.status === "processing" && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-blue-600 opacity-20 rounded-b-lg transition-all"
                  style={{ width: `40%` }} 
                />
              )} */}

              <div className="flex items-start gap-3">
                
                {/* Icon */}
                <div className="mt-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  {getTaskIcon(p.task_name)}
                </div>

                {/* Main */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">
                    {formatTaskName(p.task_name)}

                    </h3>

                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${getStatusColor(p.status)}`}>
                      {getStatusIcon(p.status)}
                      <span>{p.status}</span>
                    </div>
                  </div>

                  {/* Dynamic fields */}
                  <div className="flex flex-col gap-1 mt-2 text-xs">

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Task:</span>
                      <span className="font-medium"> {formatTaskName(p.task_name)}
</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Event:</span>
                      <span className="font-medium">{p.event}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Doc ID:</span>
                      <span className="font-mono text-gray-600 text-[10px] truncate max-w-[120px]">
                        {p.context_data_id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span><ISTTime utcString={p.created} showDate={true}/></span>
                    </div>
                  </div>

                  {/* Message Log */}
                  {p.message && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 font-mono truncate">
                        <span className="text-gray-300 mr-1">$</span>
                        {p.message}
                      </p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
