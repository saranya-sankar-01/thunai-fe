import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  document: {
    id: string;
    title: string;
    type: string;
  };
  onClose: () => void;
  selectedText?: string;
}

const suggestedQuestions = [
  "Summarize the key points in section 3",
  "What are the main action items?",
  "Explain the risk assessment",
  "List all financial projections",
  "What are the strategic initiatives?",
];

export const ChatInterface = ({ document, onClose, selectedText }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi! I'm Thunai, your AI assistant. I've analyzed "${document.title}" and I'm ready to answer your questions, provide deeper insights, or explain any part of the content.`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedText) {
      setInput(`Explain this text: "${selectedText}"`);
    }
  }, [selectedText]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('summarize') || lowerQuestion.includes('summary')) {
      return "Based on the document, here are the key points:\n\n• Q4 2024 strategy focuses on EMEA expansion with 25% growth target\n• Enterprise market presents $12M opportunity with less competition\n• Three-phase approach: Foundation, Expansion, and Scale\n• Risk mitigation includes 15% contingency budget for economic uncertainty\n\nWould you like me to elaborate on any of these points?";
    }
    
    if (lowerQuestion.includes('action') || lowerQuestion.includes('tasks')) {
      return "Here are the immediate action items identified:\n\n🎯 **Immediate Actions (Q4 2024):**\n• Hire 5 additional enterprise sales representatives\n• Establish EMEA regional office\n• Launch partner enablement program\n• Finalize strategic partnerships by end of Q3\n\n📋 **Next Phase Actions (Q1 2025):**\n• Product line extension rollout\n• Marketing campaign launch\n• Partnership activations\n\nWhich actions would you like me to explain in more detail?";
    }
    
    if (lowerQuestion.includes('risk')) {
      return "The document identifies several key risks:\n\n⚠️ **Primary Risk: Economic Uncertainty**\n• May impact enterprise spending patterns\n• Could delay customer decision-making processes\n• Recommendation: 15% contingency budget allocation\n\n🛡️ **Mitigation Strategies:**\n• Flexible pricing models\n• Shorter contract terms initially\n• Focus on proven ROI messaging\n\nWould you like me to suggest additional risk mitigation strategies?";
    }
    
    if (lowerQuestion.includes('financial') || lowerQuestion.includes('budget')) {
      return "Financial highlights from the strategy:\n\n💰 **Revenue Targets:**\n• 25% growth target for Q4 2024\n• $12M addressable market opportunity\n• Average deal size increased to $50K (up from $35K)\n\n📊 **Investment Areas:**\n• EMEA office establishment\n• 5 new sales hires\n• Marketing campaign budget\n• 15% contingency allocation\n\n📈 **ROI Metrics:**\n• Customer acquisition cost reduced by 20%\n• Customer lifetime value increased by 35%\n\nNeed more details on any specific financial aspect?";
    }
    
    if (lowerQuestion.includes('explain') && selectedText) {
      return `Looking at the selected text, this section discusses:\n\n${selectedText}\n\nThis is significant because it represents a key strategic decision point in the document. The context suggests this relates to the overall market expansion strategy and supports the 25% growth target mentioned earlier.\n\nWould you like me to explain how this connects to other parts of the strategy?`;
    }
    
    return "I understand you're asking about the document content. Based on my analysis of the Q4 2024 Business Strategy, I can help you with:\n\n• Strategic initiatives and timelines\n• Market analysis and opportunities\n• Risk assessments and mitigation plans\n• Financial projections and budgets\n• Action items and responsibilities\n\nCould you be more specific about what aspect you'd like to explore? You can also try one of the suggested questions below.";
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col knowledge-card animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>Ask Thunai</span>
            <Badge variant="secondary">AI Assistant</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((message) => (
              <div key={message.id} className={`flex space-x-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'ai' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.type === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about the document content..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="thunai-input flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              className="thunai-button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};