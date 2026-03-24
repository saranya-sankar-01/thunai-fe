// Add this component to your project
import ReactMarkdown from 'react-markdown';

interface CanvasCardProps {
  title: string;
  content: string;
  statusHistory: string[];
  isLoading: boolean;
  progress: number;
}

const CanvasCard = ({ title, content, statusHistory, isLoading, progress }: CanvasCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mb-4">
      {title && (
        <div className="border-b border-border p-4 bg-muted/30">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}
      
      {content && (
        <div className="p-4 prose prose-sm max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
      
      <div className="border-t border-border p-4 bg-muted/20 space-y-2">
        <h3 className="text-sm font-medium">Generation Status</h3>
        
        {isLoading && (
          <div className="w-full mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
          {statusHistory.map((status, index) => (
            <div key={index} className="text-xs text-muted-foreground flex items-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></span>
              {status}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasCard;
