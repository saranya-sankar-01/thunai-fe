// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent } from "@/components/ui/card";
// import { Shield, ShieldCheck, ShieldX, Send, MessageCircle, Mic, Mail, Calendar, ArrowLeft, MicIcon, Square } from "lucide-react";
// import { useState } from "react";

// interface TestAgentModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   widgetId?: string;

// }

// export function TestAgentModal({widgetId, open, onOpenChange }: TestAgentModalProps) {
//   const [step, setStep] = useState<"interface" | "testing">("interface");
//   const [selectedInterface, setSelectedInterface] = useState<string>("");
//   const [testMode, setTestMode] = useState("functional");
//   const [testInput, setTestInput] = useState("");
//   const [chatMessages, setChatMessages] = useState<{role: 'user' | 'agent', content: string, timestamp: Date}[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [isRecording, setIsRecording] = useState(false);
//   const [voiceText, setVoiceText] = useState("");
//   const [emailContent, setEmailContent] = useState({
//     to: "",
//     subject: "",
//     body: ""
//   });
//   const [testResult, setTestResult] = useState<{
//     response: string;
//     safe: boolean;
//     guardrails: { name: string; passed: boolean }[];
//   } | null>(null);

//   const interfaces = [
//     { id: "chat", name: "Chat", icon: MessageCircle, description: "Text-based conversations" },
//     { id: "voice", name: "Voice", icon: Mic, description: "Speech recognition & synthesis" },
//     { id: "email", name: "Email", icon: Mail, description: "Email-based interactions" },
//     { id: "meetings", name: "Meetings", icon: Calendar, description: "Calendar & meeting management" },
//   ];

//   const handleInterfaceSelect = (interfaceId: string) => {
//     setSelectedInterface(interfaceId);
//     setStep("testing");
//     // Reset state for new interface
//     setChatMessages([]);
//     setChatInput("");
//     setVoiceText("");
//     setIsRecording(false);
//   };

//   const handleChatSend = () => {
//     if (!chatInput.trim()) return;
    
//     const userMessage = { role: 'user' as const, content: chatInput, timestamp: new Date() };
//     setChatMessages(prev => [...prev, userMessage]);
    
//     // Simulate agent response
//     setTimeout(() => {
//       const agentResponse = { 
//         role: 'agent' as const, 
//         content: `I received your message: "${chatInput}". How can I help you further?`, 
//         timestamp: new Date() 
//       };
//       setChatMessages(prev => [...prev, agentResponse]);
//     }, 1000);
    
//     setChatInput("");
//   };

//   const handleVoiceToggle = () => {
//     setIsRecording(!isRecording);
//     if (!isRecording) {
//       // Simulate voice recording
//       setTimeout(() => {
//         setVoiceText("Voice recording detected: 'Hello, can you help me with my query?'");
//         setIsRecording(false);
//       }, 3000);
//     }
//   };

//   const handleTest = () => {
//     let response = "";
//     if (selectedInterface === "email") {
//       response = `Email processed successfully!\n\nTo: ${emailContent.to}\nSubject: ${emailContent.subject}\n\nThe agent would respond with a professionally crafted email based on your content.`;
//     } else {
//       response = "Hello! I'm your agent. How can I help you today?";
//     }

//     setTestResult({
//       response,
//       safe: true,
//       guardrails: [
//         { name: "Prompt Injection Protection", passed: true },
//         { name: "Sensitive Data Filter", passed: true },
//         { name: "Toxicity & Bias Filter", passed: true },
//         { name: "Output Length Control", passed: true },
//       ]
//     });
//   };

//   const resetTest = () => {
//     setStep("interface");
//     setSelectedInterface("");
//     setTestInput("");
//     setChatMessages([]);
//     setChatInput("");
//     setVoiceText("");
//     setIsRecording(false);
//     setEmailContent({ to: "", subject: "", body: "" });
//     setTestResult(null);
//   };

//   const goBack = () => {
//     setStep("interface");
//     setTestResult(null);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-thunai-text-primary">
//             <Shield className="h-5 w-5 text-thunai-primary" />
//             Test Agent
//           </DialogTitle>
//           <DialogDescription className="text-thunai-text-secondary">
//             Test your agent's responses and verify guardrail performance.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6">
//           {step === "interface" && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium text-thunai-text-primary">
//                 Which interface do you want to test?
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {interfaces.map((interfaceItem) => {
//                   const Icon = interfaceItem.icon;
//                   return (
//                     <Card
//                       key={interfaceItem.id}
//                       className="cursor-pointer hover:shadow-medium transition-smooth border-border"
//                       onClick={() => handleInterfaceSelect(interfaceItem.id)}
//                     >
//                       <CardContent className="p-4">
//                         <div className="flex items-center gap-3">
//                           <Icon className="h-5 w-5 text-thunai-accent" />
//                           <div>
//                             <p className="font-medium text-thunai-text-primary">{interfaceItem.name}</p>
//                             <p className="text-sm text-thunai-text-secondary">{interfaceItem.description}</p>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {step === "testing" && (
//             <div className="space-y-4">
//               <div className="flex items-center gap-2">
//                 <Button variant="ghost" size="sm" onClick={goBack}>
//                   <ArrowLeft className="h-4 w-4" />
//                 </Button>
//                 <h3 className="text-lg font-medium text-thunai-text-primary">
//                   Testing {interfaces.find(i => i.id === selectedInterface)?.name} Interface
//                 </h3>
//               </div>

//               {/* Test Mode Selection */}
//               <div className="space-y-2">
//                 <Label htmlFor="test-mode" className="text-thunai-text-primary font-medium">
//                   Test Mode
//                 </Label>
//                 <Select value={testMode} onValueChange={setTestMode}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white border border-border z-50">
//                     <SelectItem value="functional">Functional</SelectItem>
//                     <SelectItem value="security">Security</SelectItem>
//                     <SelectItem value="combined">Combined</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Interface-specific testing forms */}
//               {selectedInterface === "chat" && (
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-medium text-thunai-text-primary">Chat Interface</h4>
                  
//                   {/* Chat Messages */}
//                   <Card className="h-64 overflow-hidden">
//                     <CardContent className="p-0 h-full flex flex-col">
//                       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                         {chatMessages.length === 0 && (
//                           <p className="text-sm text-thunai-text-secondary text-center py-8">
//                             Start a conversation to test the chat interface
//                           </p>
//                         )}
//                         {chatMessages.map((message, index) => (
//                           <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                             <div className={`max-w-[80%] p-3 rounded-lg ${
//                               message.role === 'user' 
//                                 ? 'bg-thunai-primary text-white' 
//                                 : 'bg-muted text-thunai-text-primary'
//                             }`}>
//                               <p className="text-sm">{message.content}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
                      
//                       {/* Chat Input */}
//                       <div className="border-t p-4">
//                         <div className="flex gap-2">
//                           <Input
//                             placeholder="Type your message..."
//                             value={chatInput}
//                             onChange={(e) => setChatInput(e.target.value)}
//                             onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
//                             className="flex-1"
//                           />
//                           <Button onClick={handleChatSend} disabled={!chatInput.trim()}>
//                             <Send className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               )}

//               {selectedInterface === "voice" && (
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-medium text-thunai-text-primary">Voice Interface</h4>
                  
//                   <Card>
//                     <CardContent className="p-6 text-center space-y-4">
//                       <div className="flex flex-col items-center gap-4">
//                         <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
//                           isRecording ? 'bg-red-500 animate-pulse' : 'bg-thunai-primary'
//                         }`}>
//                           {isRecording ? (
//                             <Square className="h-8 w-8 text-white" />
//                           ) : (
//                             <Mic className="h-8 w-8 text-white" />
//                           )}
//                         </div>
                        
//                         <div className="space-y-2">
//                           <p className="text-sm font-medium text-thunai-text-primary">
//                             {isRecording ? 'Recording...' : 'Press to start voice recording'}
//                           </p>
//                           <Button
//                             onClick={handleVoiceToggle}
//                             variant={isRecording ? "destructive" : "default"}
//                             size="lg"
//                           >
//                             {isRecording ? 'Stop Recording' : 'Start Recording'}
//                           </Button>
//                         </div>
                        
//                         {voiceText && (
//                           <div className="w-full p-3 bg-muted rounded-lg">
//                             <p className="text-sm text-thunai-text-primary">
//                               <span className="font-medium">Detected Speech:</span><br />
//                               {voiceText}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               )}

//               {selectedInterface === "email" && (
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-medium text-thunai-text-primary">Draft Test Email Content</h4>
                  
//                   <div className="space-y-2">
//                     <Label htmlFor="email-to" className="text-sm text-thunai-text-primary">To</Label>
//                     <Input
//                       id="email-to"
//                       placeholder="recipient@example.com"
//                       value={emailContent.to}
//                       onChange={(e) => setEmailContent(prev => ({ ...prev, to: e.target.value }))}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="email-subject" className="text-sm text-thunai-text-primary">Subject</Label>
//                     <Input
//                       id="email-subject"
//                       placeholder="Email subject"
//                       value={emailContent.subject}
//                       onChange={(e) => setEmailContent(prev => ({ ...prev, subject: e.target.value }))}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="email-body" className="text-sm text-thunai-text-primary">Email Body</Label>
//                     <Textarea
//                       id="email-body"
//                       placeholder="Type your test email content here..."
//                       value={emailContent.body}
//                       onChange={(e) => setEmailContent(prev => ({ ...prev, body: e.target.value }))}
//                       className="min-h-[120px]"
//                     />
//                   </div>

//                   <Button 
//                     onClick={handleTest} 
//                     disabled={!emailContent.to || !emailContent.subject || !emailContent.body}
//                     className="w-full"
//                   >
//                     <Send className="h-4 w-4 mr-2" />
//                     Test Email Processing
//                   </Button>
//                 </div>
//               )}

//               {selectedInterface === "meetings" && (
//                 <div className="space-y-2">
//                   <Label htmlFor="test-input" className="text-thunai-text-primary font-medium">
//                     Meeting Test Input
//                   </Label>
//                   <div className="flex gap-2">
//                     <Input
//                       id="test-input"
//                       placeholder="Enter meeting request or calendar query..."
//                       value={testInput}
//                       onChange={(e) => setTestInput(e.target.value)}
//                       className="flex-1"
//                     />
//                     <Button onClick={handleTest} disabled={!testInput.trim()}>
//                       <Send className="h-4 w-4 mr-2" />
//                       Test
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {/* Test Results */}
//               {testResult && (
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-medium text-thunai-text-primary">Test Results</h3>
//                     <Button variant="outline" size="sm" onClick={resetTest}>
//                       Reset
//                     </Button>
//                   </div>

//                   {/* Agent Response */}
//                   <Card>
//                     <CardContent className="p-4">
//                       <div className="flex items-start gap-3">
//                         <div className={`p-2 rounded-full ${testResult.safe ? 'bg-thunai-positive/10' : 'bg-thunai-negative/10'}`}>
//                           {testResult.safe ? (
//                             <ShieldCheck className="h-4 w-4 text-thunai-positive" />
//                           ) : (
//                             <ShieldX className="h-4 w-4 text-thunai-negative" />
//                           )}
//                         </div>
//                         <div className="flex-1">
//                           <p className="text-sm font-medium text-thunai-text-primary mb-1">
//                             Agent Response
//                           </p>
//                           <p className="text-sm text-thunai-text-secondary whitespace-pre-line">
//                             {testResult.response}
//                           </p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Guardrail Results */}
//                   <div className="space-y-2">
//                     <h4 className="text-sm font-medium text-thunai-text-primary">Guardrail Status</h4>
//                     <div className="grid grid-cols-1 gap-2">
//                       {testResult.guardrails.map((guardrail, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
//                         >
//                           <span className="text-sm text-thunai-text-primary">{guardrail.name}</span>
//                           <div className="flex items-center gap-2">
//                             {guardrail.passed ? (
//                               <>
//                                 <ShieldCheck className="h-4 w-4 text-thunai-positive" />
//                                 <span className="text-xs text-thunai-positive font-medium">Passed</span>
//                               </>
//                             ) : (
//                               <>
//                                 <ShieldX className="h-4 w-4 text-thunai-negative" />
//                                 <span className="text-xs text-thunai-negative font-medium">Failed</span>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
// import { useState, useEffect } from "react";



// export function TestAgentModal({ widgetId, open, onOpenChange }: TestAgentModalProps) {
//   // useEffect(() => {
//   //   if (open && widgetId) {
//   //     // Create and inject the chat agent
//   //     const chatAgent = document.createElement('chat-agent');
//   //     chatAgent.setAttribute('widgetid',widgetId);
      
//   //     // Position it at the bottom right
//   //     chatAgent.style.position = 'fixed';
//   //     chatAgent.style.bottom = '20px';
//   //     chatAgent.style.right = '20px';
//   //     chatAgent.style.zIndex = '99';
//   //     chatAgent.style.transform = 'translateY(-40px)';
      
//   //     // Inject scripts if not already present
//   //     if (!document.querySelector('script[src*="vendor.js"]')) {
//   //       const vendorScript = document.createElement('script');
//   //       vendorScript.src = 'https://storage.googleapis.com/thunai-agent/common-agent-one/vendor.js';
//   //       vendorScript.type = 'module';
//   //       document.head.appendChild(vendorScript);
//   //     }
      
//   //     if (!document.querySelector('script[src*="main.js"]')) {
//   //       const mainScript = document.createElement('script');
//   //       mainScript.src = 'https://storage.googleapis.com/thunai-agent/common-agent-one/main.js';
//   //       mainScript.type = 'module';
//   //       document.head.appendChild(mainScript);
//   //     }
      
//   //     // Add to document body
//   //     document.body.appendChild(chatAgent);
//   //   }

//   //   // Remove agent when modal closes
//   //   if (!open) {
//   //     const existingAgent = document.querySelector('chat-agent');
//   //     if (existingAgent) {
//   //       existingAgent.remove();
//   //     }
//   //   }
//   // }, [open, widgetId]);

//   // Cleanup on unmount
// useEffect(() => {
//   if (!open || !widgetId) return;

//   const loadScript = (src: string) =>
//     new Promise<void>((resolve) => {
//       if (document.querySelector(`script[src="${src}"]`)) return resolve();
//       const script = document.createElement("script");
//       script.src = src;
//       script.type = "module";
//       script.onload = () => resolve();
//       document.head.appendChild(script);
//     });

//   (async () => {
//     await loadScript("https://storage.googleapis.com/thunai-agent/common-agent-one/vendor.js");
//     await loadScript("https://storage.googleapis.com/thunai-agent/common-agent-one/main.js");

//     const chatAgent = document.createElement("chat-agent");
//     chatAgent.setAttribute("widgetid", widgetId);
//     document.body.appendChild(chatAgent);

//     const observer = new MutationObserver(() => {
//       const buttons = chatAgent.querySelectorAll("button");
//       buttons.forEach((btn) => {
//         const el = btn as HTMLElement;
//         const style = window.getComputedStyle(el);
//         if (style.position === "fixed" && el.offsetHeight > 30) {
//           el.style.bottom = "75px";
//           el.style.right = "24px";
//         }
//       });
//     });

//     observer.observe(chatAgent, { childList: true, subtree: true });

//     return () => {
//       observer.disconnect();
//       chatAgent.remove();
//     };
//   })();
// }, [open, widgetId]);



//   useEffect(() => {
//     return () => {
//       const existingAgent = document.querySelector('chat-agent');
//       if (existingAgent) {
//         existingAgent.remove();
//       }
//     };
//   }, []);

//   return null; // No UI needed, just handles the widget injection
// }
import { useEffect } from "react";
interface TestAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetId?: string;
}
export function TestAgentModal({ widgetId, open }: TestAgentModalProps) {
  
  const baseUrl =import.meta.env.VITE_AGENT_SCRIPT_URL || window['env']['AGENT_SCRIPT_URL'];
  useEffect(() => {
    if (!open || !widgetId) return;

    let chatAgent: HTMLElement | null = null;
    let observer: MutationObserver;

    const loadScript = (src: string) =>
      new Promise<void>((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.type = "module";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
      
    const setupAgent = async () => {
      
      await loadScript(`${baseUrl}/vendor.js`);
      await loadScript(`${baseUrl}/main.js`);

      chatAgent = document.createElement("thunai-agent");
      chatAgent.setAttribute("widgetid", widgetId);
      document.body.appendChild(chatAgent);

      observer = new MutationObserver(() => {
        chatAgent!.querySelectorAll("button").forEach((btn) => {
          const el = btn as HTMLElement;
          const style = window.getComputedStyle(el);
          if (style.position === "fixed" && el.offsetHeight > 30) {
            el.style.bottom = "75px";
          }
        });
      });

      observer.observe(chatAgent, { childList: true, subtree: true });
    };

    setupAgent();

    return () => {
      if (observer) observer.disconnect();
      if (chatAgent) chatAgent.remove();
    };
  }, [open, widgetId]);

  return null;
}
