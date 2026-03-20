import { useState, memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export interface NodeData {
  label: string;
  instructions?: string;
  type?: 'default' | 'primary' | 'error' | 'success';
  choices?: { id: string; label: string }[];
  selectedTools?: string[];
  constraints?: string[];
  applications?: any;
  [key: string]: any;
}

interface CustomNodeProps extends NodeProps<any> {}

const CustomNode = ({ data, id, selected }: CustomNodeProps) => {
  console.log(data)
  const [isAppOpen, setIsAppOpen] = useState(false);

  const nodeType = data?.type || 'default';

  const getNodeColor = () => {
    switch (nodeType) {
      case 'primary':
        return 'border-blue-500 bg-blue-950';
      case 'error':
        return 'border-red-500 bg-red-950';
      case 'success':
        return 'border-green-500 bg-green-950';
      default:
        return 'border-[#0A0B5C] bg-[#0A0B5C]';
    }
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    const customEvent = new CustomEvent('nodeedit', { detail: { nodeId: id } });
    document.dispatchEvent(customEvent);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    const customEvent = new CustomEvent('nodedelete', { detail: { nodeId: id } });
    document.dispatchEvent(customEvent);
  };

  return (
    <div
      className={`
        p-4 rounded-md shadow-xl border-white bg-white  ${selected ? 'shadow-2xl' : ''}
        hover:shadow-xl
        cursor-pointer
      `}
      title={data.label}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 border-2 border-gray-500 rounded-full bg-gray-700"
      />

      <div className="min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-4 h-4 rounded-full ${
                nodeType === 'primary'
                  ? 'bg-blue-500'
                  : nodeType === 'error'
                  ? 'bg-red-500'
                  : nodeType === 'success'
                  ? 'bg-green-500'
                  : 'bg-black'
              }`}
            ></div>
            <div className="font-semibold text-black text-lg select-none">{data.label}</div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              aria-label="Edit node"
              title="Edit node"
              className="p-2 rounded-md text-black hover:border border-black transition-colors duration-200"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDelete}
              aria-label="Delete node"
              title="Delete node"
              className="p-2 rounded-md text-black hover:border border-black  transition-colors duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {data.instructions && (
          <div className="text-sm text-black mb-3 select-text whitespace-pre-wrap leading-relaxed">
            {data.instructions}
          </div>
        )}

        {/* Conditionally Render Application Details */}
        {data?.applications?.applicationName && data?.applications?.applicationTool && (
          <div className="mb-3 p-3 bg-gray-200 rounded border border-gray-600 text-gray-200 text-sm">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setIsAppOpen(!isAppOpen)}
              aria-expanded={isAppOpen}
              type="button"
            >
              {isAppOpen ? <ChevronDown size={16} className='text-black' /> : <ChevronRight size={16} className='text-black' />}
              <span className="font-semibold select-none text-black">Action</span>
            </button>
            {isAppOpen && (
              <div className="mt-2">
                <div className='flex'>
                  <strong className='text-black'>Integration:</strong>
                  <p className='pl-2 text-black'>{data.applications.applicationName}</p>
                </div>
                <div className='flex'>
                  <strong className='text-black'>Tool:</strong>
                  <p className='pl-2 text-black'>{data.applications.applicationTool}</p>
                </div>
              </div>
            )}
          </div>
        )}
{data?.applications?.tools && data.applications.tools.length > 0 && (
  <div className="mb-3 p-3 bg-gray-200 rounded border border-gray-600 text-sm">
    <button
      className="flex items-center space-x-2 focus:outline-none"
      onClick={() => setIsAppOpen(!isAppOpen)}
      aria-expanded={isAppOpen}
      type="button"
    >
      {isAppOpen ? (
        <ChevronDown size={16} className="text-black" />
      ) : (
        <ChevronRight size={16} className="text-black" />
      )}
      <span className="font-semibold select-none text-black">Action</span>
    </button>

    {isAppOpen && (
      <div className="mt-2 space-y-2">
        {data.applications.tools.map((tool: any, index: number) => (
          <div
            key={index}
            className="p-2 rounded bg-white border border-gray-300 text-black"
          >
            <div className="flex">
              <strong>Integration:</strong>
              <p className="pl-2">{tool.applicationName}</p>
            </div>
            <div className="flex">
              <strong>Tool:</strong>
              <p className="pl-2">{tool.applicationTool}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {data.selectedTools && data.selectedTools.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.selectedTools.map((tool: string) => (
              <span
                key={tool}
                className="px-3 py-1 bg-gray-700 text-gray-200 text-xs font-medium rounded-full select-none"
              >
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 border-2 border-gray-500 rounded-full bg-gray-700"
      />
    </div>
  );
};

export default memo(CustomNode);
