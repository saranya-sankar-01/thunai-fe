import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { fetchSuggestedQuestions } from "../../services/suggestions"; 
interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  activeTab: string; 
}

export const SuggestedQuestions = ({ onSelectQuestion, activeTab }: SuggestedQuestionsProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionCache, setQuestionCache] = useState<Record<string, string[]>>({});

  const [error, setError] = useState('');


useEffect(() => {
  const getQuestions = async () => {
    const questionType = activeTab === 'meetings' ? 'meet' : 'kb';

    // If we already have cached questions, use them
    if (questionCache[questionType]) {
      setQuestions(questionCache[questionType]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const questions = await fetchSuggestedQuestions(questionType);
      setQuestions(questions);
      setQuestionCache(prev => ({ ...prev, [questionType]: questions }));
      setError('');
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load suggested questions");
      setQuestions([
        "What is Thunai AI?",
        "What types of files can I upload to the Thunai Brain?",
        "Which applications can I integrate with Thunai?",
        "What types of AI agents can I create?"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  getQuestions();
}, [activeTab, questionCache]);

  return (
  <div className="p-4 border-t border-border/50">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggested questions</h3>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
         {(window.innerWidth < 768 ? [1, 2] : [1, 2, 3, 4]).map((i) => (
            <div
              key={i}
              className="h-auto py-2 px-3 rounded-2xl bg-muted animate-pulse flex items-center bg-white shadow-md"
            >
              <div className="w-full p-4 rounded-2xl bg-white">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 rounded-full bg-gray-100 w-3/4"></div>
                  <div className="h-4 rounded-full bg-gray-100 w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
           {(error ? questions : questions)
    .slice(0, window.innerWidth < 768 ? 2 : 4) 
    .map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSelectQuestion(question)}
              className="justify-start text-left h-auto py-2 px-3 text-sm font-normal hover:bg-gray-100 hover:text-black text-wrap"
            >
              {question}
            </Button>
          ))}
        </div>
      )}
    </div>
  </div>
);
};



