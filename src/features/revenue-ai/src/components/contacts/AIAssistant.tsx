
import React, { useEffect, useRef, useState } from 'react';
import { Send, Brain, Calendar, Mail, MessageSquare, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Contact } from '../../types/Contact';
import { useContactStore } from '../../store/contactStore';
import { Opportunity } from '../../types/Opportunity';

interface AIAssistantProps {
  contact?: Contact;
  opportunity?: Opportunity;
}

const quickActions = [
  {
    icon: Calendar,
    title: 'Schedule Meeting',
    prompt: 'Schedule a meeting with {{contact.name}}'
  },
  {
    icon: Mail,
    title: 'Draft Email',
    prompt: 'Draft a follow-up email to {{contact.name}}'
  },
  {
    icon: MessageSquare,
    title: 'Create Summary',
    prompt: 'Create a summary of recent interactions with {{contact.name}}'
  },
  // {
  //   icon: Sparkles,
  //   title: 'Generate Insights',
  //   prompt: 'Analyze {{contact.name}}\'s engagement patterns and suggest next best actions'
  // }
];

const recentPrompts = [
  'Schedule a follow-up meeting on Friday at 5 PM',
  'Send out an email following up with this contact',
  'Help me draft a mail for the action items',
  'What are the key discussion points from our last meeting?',
  'Create a proposal outline based on our conversations'
];

export const AIAssistant = ({ contact, opportunity }: AIAssistantProps) => {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getAiChatHistory, aiChatHistory, loading, sendPromptToAi, deleteAiChatHistory } = useContactStore();

  useEffect(() => {
    let email: string = "";
    if (contact?.email) email = contact?.email;
    else if (opportunity?.contact_mailid) email = opportunity?.contact_mailid;
    else email = "";
    getAiChatHistory(email);
  }, [contact?.email, opportunity?.contact_mailid]);


  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;
    const payload = {
      chat_data: prompt,
      contact_email: contact.email,
    }
    await sendPromptToAi(payload);
    setPrompt("");
  };

  const handleQuickAction = (action: any) => {
    const processedPrompt = action.prompt.replace('{{contact.name}}', contact.name);
    setPrompt(processedPrompt);
    inputRef.current?.focus();
  };

  const handleDeleteChatHistory = async () => {
    await deleteAiChatHistory(contact.email);
  };

  const copyToClipboard = (data: string, index: number) => {
    navigator.clipboard.writeText(data).then(() => {
      setCopied(index);
      setTimeout(() => {
        setCopied(null);
      }, 2000)
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-2 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">Get help with {contact?.name || opportunity?.assignee?.assignee_name}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action)}
              className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2 mb-1">
                <action.icon size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-900">{action.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {aiChatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.user ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${message.user
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
                }`}
            >{message.user}

              <div className="whitespace-pre-wrap text-sm">
                {message.model}
                {message.model &&
                  <div className='flex justify-end'>
                    <Button variant='ghost' className='p-2' onClick={() => copyToClipboard(message.model, index)}>
                      {copied === index ? <Check /> : <Copy />}
                    </Button>
                  </div>
                }
              </div>
            </div>
          </div>
        ))}

        {loading.sendingPrompt && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Prompts */}
      <div className="p-2 bg-white border-t border-gray-200">
        <div className='flex justify-end mb-2'>
          <Button variant='outline' onClick={handleDeleteChatHistory}>Clear Chat</Button>
        </div>
        {/* <p className="text-xs text-gray-500 mb-2">Recent prompts:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {recentPrompts.slice(0, 3).map((recentPrompt, index) => (
            <button
              key={index}
              onClick={() => setPrompt(recentPrompt)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
            >
              "{recentPrompt}"
            </button>
          ))}
        </div> */}

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            placeholder={`Ask AI to help with ${contact?.name || opportunity?.assignee?.assignee_name}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading.sendingPrompt}
          />
          <Button
            onClick={handleSendPrompt}
            disabled={!prompt.trim() || loading.sendingPrompt}
            size="sm"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
