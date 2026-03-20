// FAQSection.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { useRef, useEffect } from "react";

interface FAQ {
  question: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  onAddFAQ: () => void;
  onUpdateFAQ: (index: number, question: string) => void;
  onRemoveFAQ: (index: number) => void;
  onResetToDefaults?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>; // Add this prop
}

export function FAQSection({ 
  faqs, 
  onAddFAQ,
  onUpdateFAQ, 
  onRemoveFAQ, 
  onResetToDefaults,
  containerRef // Add this
}: FAQSectionProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);

  const handleAddFAQ = () => {
    onAddFAQ();
    setTimeout(() => {
      if (internalScrollRef.current && faqs.length >= 2) {
        internalScrollRef.current.scrollTo({
          top: internalScrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
      else if (containerRef?.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div className="space-y-3 p-3 border border-grey-50 rounded-lg mt-5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-thunai-text-primary">
          Frequently Asked Questions
        </Label>
        <div className="flex items-center gap-2">
          {onResetToDefaults && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetToDefaults}
              className="flex items-center gap-2 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Defaults
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFAQ}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add FAQ
          </Button>
        </div>
      </div>
      <p className="text-xs text-thunai-text-secondary">
        Add common questions and answers for your agent
      </p>

      {/* FAQ List with conditional scroll */}
      <div 
        ref={internalScrollRef}
        className={`space-y-3 ${faqs.length > 2 ? 'max-h-52 overflow-y-auto pr-2' : ''}`}
      >
        {faqs.map((faq, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-grey-50 bg-background rounded-lg">
            <div className="flex-1">
              <Label className="text-xs text-thunai-text-secondary block mb-4">
                Question {index + 1}
              </Label>
              <Input
                value={faq.question}
                onChange={(e) => onUpdateFAQ(index, e.target.value)}
                placeholder="Enter your question..."
                className="bg-background border-muted focus:ring-thunai-accent-2"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFAQ(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-7"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
